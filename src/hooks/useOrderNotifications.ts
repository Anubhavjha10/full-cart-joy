import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Notification {
  id: string;
  user_id: string;
  order_id: string | null;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

// Create notification sound using Web Audio API
const playNotificationSound = (type: string) => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const gainNode = audioContext.createGain();
    gainNode.connect(audioContext.destination);
    gainNode.gain.value = 0.6;

    // Different sounds based on notification type
    if (type === 'order_delivered') {
      // Happy chime for delivery
      const frequencies = [523, 659, 784]; // C5, E5, G5 (major chord)
      frequencies.forEach((freq, i) => {
        const osc = audioContext.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        osc.connect(gainNode);
        osc.start(audioContext.currentTime + i * 0.1);
        osc.stop(audioContext.currentTime + i * 0.1 + 0.2);
      });
    } else if (type === 'item_out_of_stock' || type === 'order_cancelled') {
      // Warning tone
      const osc = audioContext.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = 440;
      osc.connect(gainNode);
      osc.start();
      osc.stop(audioContext.currentTime + 0.3);
    } else {
      // Standard notification sound (two-tone)
      [0, 0.15].forEach((delay, i) => {
        const osc = audioContext.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = i === 0 ? 880 : 1046.5;
        osc.connect(gainNode);
        osc.start(audioContext.currentTime + delay);
        osc.stop(audioContext.currentTime + delay + 0.12);
      });
    }
  } catch (err) {
    console.log('Could not play notification sound:', err);
  }
};

// Get notification icon based on type
const getNotificationEmoji = (type: string): string => {
  switch (type) {
    case 'order_accepted':
      return '✅';
    case 'order_packed':
      return '📦';
    case 'order_out_for_delivery':
      return '🚚';
    case 'order_delivered':
      return '🎉';
    case 'order_cancelled':
      return '❌';
    case 'item_out_of_stock':
      return '⚠️';
    default:
      return '📋';
  }
};

export function useOrderNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem('customerNotificationsMuted') === 'true';
  });
  const { user } = useAuth();
  const { toast } = useToast();
  const isInitialLoadRef = useRef(true);

  // Persist mute state
  useEffect(() => {
    localStorage.setItem('customerNotificationsMuted', String(isMuted));
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && data) {
      setNotifications(data as Notification[]);
      setUnreadCount(data.filter((n) => !n.is_read).length);
    }
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (!error) {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (!error) {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    isInitialLoadRef.current = true;
    fetchNotifications().then(() => {
      // Give a small delay before allowing notifications
      setTimeout(() => {
        isInitialLoadRef.current = false;
      }, 1000);
    });

    if (!user) return;

    // Subscribe to new notifications for this user
    const channel = supabase
      .channel(`notifications-user-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          console.log('🔔 New customer notification:', newNotification.title);
          
          setNotifications((prev) => [newNotification, ...prev]);
          setUnreadCount((prev) => prev + 1);
          
          // Skip toast and sound on initial load
          if (isInitialLoadRef.current) return;

          // Play sound if not muted
          if (!isMuted) {
            playNotificationSound(newNotification.type);
          }

          // Show toast notification
          const emoji = getNotificationEmoji(newNotification.type);
          toast({
            title: `${emoji} ${newNotification.title}`,
            description: newNotification.message,
            duration: 8000,
          });

          // Try to show browser notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(newNotification.title, {
              body: newNotification.message,
              icon: '/favicon.ico',
              tag: newNotification.id,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchNotifications, toast, isMuted]);

  const requestBrowserPermission = useCallback(() => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
    isMuted,
    toggleMute,
    requestBrowserPermission,
  };
}
