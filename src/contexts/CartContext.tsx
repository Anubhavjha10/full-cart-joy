import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

export interface Product {
  id: string;
  name: string;
  quantity: string;
  price: number;
  image: string;
  category: string;
  deliveryTime: string;
}

export interface CartItem extends Product {
  count: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, count: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  loading: boolean;
  placeOrder: (deliveryAddress: string) => Promise<boolean>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Load cart from database when user logs in
  useEffect(() => {
    if (user) {
      loadCartFromDB();
    } else {
      setItems([]);
    }
  }, [user]);

  const loadCartFromDB = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const cartItems: CartItem[] = (data || []).map((item) => ({
        id: item.product_id,
        name: item.product_name,
        image: item.product_image,
        quantity: item.product_quantity,
        price: item.product_price,
        count: item.count,
        category: '',
        deliveryTime: '13 MINS',
      }));

      setItems(cartItems);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncCartToDB = useCallback(async (newItems: CartItem[]) => {
    if (!user) return;

    try {
      // Delete all existing cart items for this user
      await supabase.from('cart_items').delete().eq('user_id', user.id);

      // Insert new cart items
      if (newItems.length > 0) {
        const cartItemsToInsert = newItems.map((item) => ({
          user_id: user.id,
          product_id: item.id,
          product_name: item.name,
          product_image: item.image,
          product_quantity: item.quantity,
          product_price: item.price,
          count: item.count,
        }));

        await supabase.from('cart_items').insert(cartItemsToInsert);
      }
    } catch (error) {
      console.error('Error syncing cart:', error);
    }
  }, [user]);

  const addToCart = useCallback((product: Product) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      let newItems: CartItem[];
      
      if (existing) {
        newItems = prev.map((item) =>
          item.id === product.id ? { ...item, count: item.count + 1 } : item
        );
      } else {
        newItems = [...prev, { ...product, count: 1 }];
      }
      
      if (user) {
        syncCartToDB(newItems);
      }
      
      return newItems;
    });
    
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  }, [user, syncCartToDB]);

  const removeFromCart = useCallback((productId: string) => {
    setItems((prev) => {
      const newItems = prev.filter((item) => item.id !== productId);
      if (user) {
        syncCartToDB(newItems);
      }
      return newItems;
    });
  }, [user, syncCartToDB]);

  const updateQuantity = useCallback((productId: string, count: number) => {
    if (count <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setItems((prev) => {
      const newItems = prev.map((item) =>
        item.id === productId ? { ...item, count } : item
      );
      if (user) {
        syncCartToDB(newItems);
      }
      return newItems;
    });
  }, [user, removeFromCart, syncCartToDB]);

  const clearCart = useCallback(() => {
    setItems([]);
    if (user) {
      syncCartToDB([]);
    }
  }, [user, syncCartToDB]);

  const placeOrder = useCallback(async (deliveryAddress: string): Promise<boolean> => {
    if (!user || items.length === 0) return false;

    try {
      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: totalPrice,
          status: 'pending',
          delivery_address: deliveryAddress,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: orderData.id,
        product_id: item.id,
        product_name: item.name,
        product_price: item.price,
        quantity: item.count,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart
      clearCart();

      toast({
        title: 'Order placed!',
        description: 'Your order has been placed successfully.',
      });

      return true;
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: 'Order failed',
        description: 'Failed to place order. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  }, [user, items, clearCart]);

  const totalItems = items.reduce((sum, item) => sum + item.count, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.count, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        loading,
        placeOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
