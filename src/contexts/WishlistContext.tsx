import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Product } from '@/contexts/CartContext';

interface WishlistContextType {
  items: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Load wishlist from database when user logs in
  useEffect(() => {
    if (user) {
      loadWishlistFromDB();
    } else {
      setItems([]);
    }
  }, [user]);

  const loadWishlistFromDB = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('wishlist_items')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      if (data) {
        const wishlistItems: Product[] = data.map((item) => ({
          id: item.product_id,
          name: item.product_name,
          price: item.product_price,
          image: item.product_image,
          quantity: item.product_quantity,
          category: '',
          deliveryTime: '15 min',
        }));
        setItems(wishlistItems);
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (product: Product) => {
    if (!user) {
      toast.error('Please login to add items to wishlist');
      return;
    }

    try {
      const { error } = await supabase.from('wishlist_items').insert({
        user_id: user.id,
        product_id: product.id,
        product_name: product.name,
        product_price: product.price,
        product_image: product.image,
        product_quantity: product.quantity,
      });

      if (error) throw error;

      setItems((prev) => [...prev, product]);
      toast.success('Added to wishlist');
    } catch (error: any) {
      if (error.code === '23505') {
        toast.info('Already in wishlist');
      } else {
        console.error('Error adding to wishlist:', error);
        toast.error('Failed to add to wishlist');
      }
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;

      setItems((prev) => prev.filter((item) => item.id !== productId));
      toast.success('Removed from wishlist');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove from wishlist');
    }
  };

  const isInWishlist = (productId: string) => {
    return items.some((item) => item.id === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        loading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
