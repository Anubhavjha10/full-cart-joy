import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ProductRating {
  productId: string;
  averageRating: number;
  reviewCount: number;
}

export const useProductRatings = (productIds: string[]) => {
  const [ratings, setRatings] = useState<Map<string, ProductRating>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (productIds.length === 0) {
      setLoading(false);
      return;
    }

    const fetchRatings = async () => {
      try {
        const { data, error } = await supabase
          .from('product_reviews')
          .select('product_id, rating')
          .in('product_id', productIds);

        if (error) throw error;

        // Calculate average ratings per product
        const ratingsMap = new Map<string, ProductRating>();
        const productRatingsTemp: Record<string, number[]> = {};

        data?.forEach((review) => {
          if (!productRatingsTemp[review.product_id]) {
            productRatingsTemp[review.product_id] = [];
          }
          productRatingsTemp[review.product_id].push(review.rating);
        });

        Object.entries(productRatingsTemp).forEach(([productId, ratingsList]) => {
          const average = ratingsList.reduce((sum, r) => sum + r, 0) / ratingsList.length;
          ratingsMap.set(productId, {
            productId,
            averageRating: Math.round(average * 10) / 10,
            reviewCount: ratingsList.length,
          });
        });

        setRatings(ratingsMap);
      } catch (error) {
        console.error('Error fetching product ratings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRatings();
  }, [productIds.join(',')]);

  const getRating = (productId: string, fallbackRating: number = 0) => {
    const rating = ratings.get(productId);
    return rating ? rating : { productId, averageRating: fallbackRating, reviewCount: 0 };
  };

  return { ratings, getRating, loading };
};

// Single product rating hook for use in individual product views
export const useProductRating = (productId: string) => {
  const [rating, setRating] = useState<ProductRating | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }

    const fetchRating = async () => {
      try {
        const { data, error } = await supabase
          .from('product_reviews')
          .select('rating')
          .eq('product_id', productId);

        if (error) throw error;

        if (data && data.length > 0) {
          const average = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
          setRating({
            productId,
            averageRating: Math.round(average * 10) / 10,
            reviewCount: data.length,
          });
        } else {
          setRating(null);
        }
      } catch (error) {
        console.error('Error fetching product rating:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRating();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`product-rating-${productId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'product_reviews',
          filter: `product_id=eq.${productId}`,
        },
        () => {
          fetchRating();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [productId]);

  return { rating, loading };
};
