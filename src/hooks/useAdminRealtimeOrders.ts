import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

export function useAdminRealtimeOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchOrders();

    // Subscribe to ALL order changes (no user filter for admin)
    const ordersChannel = supabase
      .channel('admin-orders-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          console.log('Admin: Order update received:', payload);
          
          if (payload.eventType === 'UPDATE') {
            setOrders((prev) =>
              prev.map((order) =>
                order.id === payload.new.id
                  ? { ...order, ...payload.new }
                  : order
              )
            );
          } else if (payload.eventType === 'INSERT') {
            // Fetch the new order with its items
            const fetchNewOrder = async () => {
              const newOrder = payload.new as Order;
              const { data: itemsData } = await supabase
                .from('order_items')
                .select('*')
                .eq('order_id', newOrder.id);
              
              setOrders((prev) => [
                { ...newOrder, order_items: (itemsData || []) as OrderItem[] },
                ...prev
              ]);
            };
            fetchNewOrder();
          } else if (payload.eventType === 'DELETE') {
            setOrders((prev) => prev.filter((order) => order.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // Subscribe to order items changes
    const itemsChannel = supabase
      .channel('admin-order-items-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_items',
        },
        (payload) => {
          console.log('Admin: Order item update received:', payload);
          
          if (payload.eventType === 'UPDATE') {
            const updatedItem = payload.new as OrderItem;
            setOrders((prev) =>
              prev.map((order) => ({
                ...order,
                order_items: order.order_items?.map((item) =>
                  item.id === updatedItem.id ? updatedItem : item
                ),
              }))
            );
          } else if (payload.eventType === 'INSERT') {
            const newItem = payload.new as OrderItem & { order_id: string };
            setOrders((prev) =>
              prev.map((order) =>
                order.id === newItem.order_id
                  ? { ...order, order_items: [...(order.order_items || []), newItem] }
                  : order
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(itemsChannel);
    };
  }, [fetchOrders]);

  return { orders, loading, refetch: fetchOrders };
}
