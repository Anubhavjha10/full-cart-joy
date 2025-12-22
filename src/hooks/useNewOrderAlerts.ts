import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useNewOrderAlerts() {
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasPermissionRef = useRef(false);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        hasPermissionRef.current = true;
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((permission) => {
          hasPermissionRef.current = permission === 'granted';
        });
      }
    }
  }, []);

  // Create audio element for notification sound
  useEffect(() => {
    // Using a data URI for a simple notification beep sound
    const audioData = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleVABLH3Wz7qQg5E8V6baz6yEmMxPh9fWrqKwmIm0w7SsrLS2uLi+s6uipqq9u7/DtaigrLG8vLW4tba1vMC5tbW3wLu7wL22s7W7ube8vLi4ube4uru5uri6urq5ubq5urq6ubi4uLi5uLi4uLi4uLi4t7i4uLe3t7e3t7e3t7e3t7e3t7e3tre2tra1tbW1tbS0tLSzs7OzsrKysrGxsbGwsLCwr6+vrq6urq2traysrKurq6qqqqmpqaioqKenp6ampqWlpaSkpKOjo6KioqGhoaCgoJ+fn56enp2dnZycnJubm5qampqZmZmYmJiXl5eWlpaVlZWUlJSTk5OSkpKRkZGQkJCPj4+OjY2MjIyLi4qKioqJiYiIiIeHh4aGhoWFhYSEhIODg4KCgoGBgYCAgH9/f35+fn19fXx8fHt7e3p6enl5eXh4eHd3d3Z2dnV1dXR0dHNzc3JycnFxcXBwcG9vb25ubm1tbWxsbGtra2pqamlpaWhnaGdnZ2ZmZmVlZWRkZGNjY2JhYWFgYGBfX19eXl5dXV1cXFxbW1taWlpZWVlYWFhXV1dWVlZVVVVUVFRTU1NSUlJRUVFQUFBPT09OTk5NTU1MTExLS0tKSkpJSUlISEhHR0dGRkZFRUVEREQ=';
    audioRef.current = new Audio(audioData);
    audioRef.current.volume = 0.5;
  }, []);

  const playNotificationSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((err) => {
        console.log('Could not play notification sound:', err);
      });
    }
  }, []);

  const showBrowserNotification = useCallback((orderId: string, amount: number) => {
    if ('Notification' in window && hasPermissionRef.current) {
      const notification = new Notification('🛒 New Order Received!', {
        body: `Order #${orderId.slice(0, 8).toUpperCase()} - ₹${amount.toFixed(0)}`,
        icon: '/favicon.ico',
        tag: orderId,
        requireInteraction: true,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  }, []);

  const showToastNotification = useCallback((orderId: string, amount: number) => {
    toast({
      title: '🛒 New Order Received!',
      description: `Order #${orderId.slice(0, 8).toUpperCase()} - ₹${amount.toFixed(0)}`,
    });
  }, [toast]);

  // Subscribe to new orders
  useEffect(() => {
    const channel = supabase
      .channel('new-order-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          const newOrder = payload.new as { id: string; total_amount: number };
          console.log('New order alert:', newOrder);
          
          // Play sound
          playNotificationSound();
          
          // Show browser notification
          showBrowserNotification(newOrder.id, newOrder.total_amount);
          
          // Show in-app toast
          showToastNotification(newOrder.id, newOrder.total_amount);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [playNotificationSound, showBrowserNotification, showToastNotification]);

  return {
    requestPermission: () => {
      if ('Notification' in window && Notification.permission !== 'granted') {
        Notification.requestPermission().then((permission) => {
          hasPermissionRef.current = permission === 'granted';
        });
      }
    },
  };
}
