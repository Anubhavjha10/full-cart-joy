import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  item_status: string;
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  adjusted_amount: number | null;
  status: string;
  delivery_address: string | null;
  created_at: string;
  order_items?: OrderItem[];
}

export function useRealtimeOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchOrders = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch order items for each order
      const ordersWithItems = await Promise.all(
        (ordersData || []).map(async (order) => {
          const { data: itemsData } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', order.id);
          return { 
            ...order, 
            order_items: (itemsData || []) as OrderItem[] 
          } as Order;
        })
      );

      setOrders(ordersWithItems);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOrders();

    if (!user) return;

    // Subscribe to order changes
    const ordersChannel = supabase
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Order update received:', payload);
          
          if (payload.eventType === 'UPDATE') {
            setOrders((prev) =>
              prev.map((order) =>
                order.id === payload.new.id
                  ? { ...order, ...payload.new }
                  : order
              )
            );
          } else if (payload.eventType === 'INSERT') {
            const newOrder = payload.new as Order;
            setOrders((prev) => [{ ...newOrder, order_items: [] }, ...prev]);
          }
        }
      )
      .subscribe();

    // Subscribe to order items changes
    const itemsChannel = supabase
      .channel('order-items-realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'order_items',
        },
        (payload) => {
          console.log('Order item update received:', payload);
          const updatedItem = payload.new as OrderItem;
          
          setOrders((prev) =>
            prev.map((order) => ({
              ...order,
              order_items: order.order_items?.map((item) =>
                item.id === updatedItem.id ? updatedItem : item
              ),
            }))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(itemsChannel);
    };
  }, [user, fetchOrders]);

  return { orders, loading, refetch: fetchOrders };
}
