import { useState, useEffect } from 'react';
import { Star, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  profile?: {
    full_name: string | null;
  };
}

interface ProductReviewsProps {
  productId: string;
}

const StarRating = ({ 
  rating, 
  onRate, 
  interactive = false,
  size = 'md'
}: { 
  rating: number; 
  onRate?: (rating: number) => void; 
  interactive?: boolean;
  size?: 'sm' | 'md';
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const sizeClass = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClass} ${interactive ? 'cursor-pointer' : ''} ${
            star <= (hoverRating || rating)
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-muted-foreground'
          }`}
          onClick={() => interactive && onRate?.(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
        />
      ))}
    </div>
  );
};

const ProductReviews = ({ productId }: ProductReviewsProps) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const userReview = reviews.find(r => r.user_id === user?.id);
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : 0;

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      // Fetch reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;

      // Fetch profiles separately for each review
      const reviewsWithProfiles = await Promise.all(
        (reviewsData || []).map(async (review) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('user_id', review.user_id)
            .single();
          
          return {
            ...review,
            profile: profileData || { full_name: null }
          };
        })
      );

      setReviews(reviewsWithProfiles);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please login to submit a review');
      return;
    }
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setSubmitting(true);
    try {
      if (editingReview) {
        const { error } = await supabase
          .from('product_reviews')
          .update({ rating, review_text: reviewText || null })
          .eq('id', editingReview.id);

        if (error) throw error;
        toast.success('Review updated successfully');
      } else {
        const { error } = await supabase
          .from('product_reviews')
          .insert({
            user_id: user.id,
            product_id: productId,
            rating,
            review_text: reviewText || null,
          });

        if (error) throw error;
        toast.success('Review submitted successfully');
      }

      setShowForm(false);
      setEditingReview(null);
      setRating(0);
      setReviewText('');
      fetchReviews();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (review: Review) => {
    setEditingReview(review);
    setRating(review.rating);
    setReviewText(review.review_text || '');
    setShowForm(true);
  };

  const handleDelete = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from('product_reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;
      toast.success('Review deleted');
      fetchReviews();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete review');
    }
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingReview(null);
    setRating(0);
    setReviewText('');
  };

  return (
    <Card className="p-6 mt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-foreground">Customer Reviews</h3>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <StarRating rating={Math.round(averageRating)} size="sm" />
              <span className="text-sm text-muted-foreground">
                {averageRating.toFixed(1)} out of 5 ({reviews.length} reviews)
              </span>
            </div>
          )}
        </div>
        {user && !userReview && !showForm && (
          <Button onClick={() => setShowForm(true)} variant="outline">
            Write a Review
          </Button>
        )}
      </div>

      {/* Review Form */}
      {showForm && (
        <div className="bg-accent/30 p-4 rounded-lg mb-6">
          <h4 className="font-semibold text-foreground mb-3">
            {editingReview ? 'Edit Your Review' : 'Write Your Review'}
          </h4>
          <div className="mb-4">
            <label className="text-sm text-muted-foreground mb-2 block">Your Rating</label>
            <StarRating rating={rating} onRate={setRating} interactive />
          </div>
          <div className="mb-4">
            <label className="text-sm text-muted-foreground mb-2 block">Your Review (optional)</label>
            <Textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your experience with this product..."
              rows={3}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting...' : editingReview ? 'Update Review' : 'Submit Review'}
            </Button>
            <Button variant="outline" onClick={cancelForm}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <p className="text-muted-foreground">Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review, index) => (
            <div key={review.id}>
              {index > 0 && <Separator className="mb-4" />}
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-foreground">
                      {review.profile?.full_name || 'Anonymous'}
                    </span>
                    {review.user_id === user?.id && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                        You
                      </span>
                    )}
                  </div>
                  <StarRating rating={review.rating} size="sm" />
                  {review.review_text && (
                    <p className="text-foreground mt-2">{review.review_text}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
                {review.user_id === user?.id && (
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => handleEdit(review)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDelete(review.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default ProductReviews;