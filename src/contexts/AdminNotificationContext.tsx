import { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Louder, clearer notification sounds using Web Audio API frequencies
const createNotificationSound = (priority: 'standard' | 'high' | 'urgent'): () => void => {
  return () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const gainNode = audioContext.createGain();
      gainNode.connect(audioContext.destination);
      gainNode.gain.value = 0.8; // High volume

      if (priority === 'standard') {
        // Single clear beep
        const oscillator = audioContext.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.value = 880; // A5 note
        oscillator.connect(gainNode);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);
      } else if (priority === 'high') {
        // Double beep
        [0, 0.2].forEach((delay) => {
          const osc = audioContext.createOscillator();
          osc.type = 'sine';
          osc.frequency.value = 1046.5; // C6 note
          osc.connect(gainNode);
          osc.start(audioContext.currentTime + delay);
          osc.stop(audioContext.currentTime + delay + 0.15);
        });
      } else if (priority === 'urgent') {
        // Triple ascending beep (attention-grabbing)
        const frequencies = [880, 1046.5, 1318.5]; // A5, C6, E6
        frequencies.forEach((freq, i) => {
          const osc = audioContext.createOscillator();
          osc.type = 'square'; // More attention-grabbing
          osc.frequency.value = freq;
          osc.connect(gainNode);
          osc.start(audioContext.currentTime + i * 0.15);
          osc.stop(audioContext.currentTime + i * 0.15 + 0.12);
        });
      }
    } catch (err) {
      console.log('Could not play notification sound:', err);
    }
  };
};

// Priority thresholds based on order amount
const PRIORITY_THRESHOLDS = {
  urgent: 2000,
  high: 1000,
};

type Priority = 'standard' | 'high' | 'urgent';

interface AdminNotificationContextType {
  unseenOrderCount: number;
  markOrdersSeen: () => void;
  isMuted: boolean;
  toggleMute: () => void;
  requestPermission: () => void;
  hasPermission: boolean;
}

const AdminNotificationContext = createContext<AdminNotificationContextType | null>(null);

export function useAdminNotifications() {
  const context = useContext(AdminNotificationContext);
  if (!context) {
    throw new Error('useAdminNotifications must be used within AdminNotificationProvider');
  }
  return context;
}

interface AdminNotificationProviderProps {
  children: ReactNode;
}

export function AdminNotificationProvider({ children }: AdminNotificationProviderProps) {
  const { toast } = useToast();
  const [unseenOrderCount, setUnseenOrderCount] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);
  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem('orderAlertsMuted') === 'true';
  });

  // Sound generators
  const soundGenerators = useRef({
    standard: createNotificationSound('standard'),
    high: createNotificationSound('high'),
    urgent: createNotificationSound('urgent'),
  });

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        setHasPermission(true);
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((permission) => {
          setHasPermission(permission === 'granted');
        });
      }
    }
  }, []);

  // Persist mute state
  useEffect(() => {
    localStorage.setItem('orderAlertsMuted', String(isMuted));
  }, [isMuted]);

  const getPriority = useCallback((amount: number): Priority => {
    if (amount >= PRIORITY_THRESHOLDS.urgent) return 'urgent';
    if (amount >= PRIORITY_THRESHOLDS.high) return 'high';
    return 'standard';
  }, []);

  const getPriorityLabel = useCallback((priority: Priority): string => {
    switch (priority) {
      case 'urgent': return '🔴 URGENT';
      case 'high': return '🟠 High Priority';
      default: return '🟢 New';
    }
  }, []);

  const playNotificationSound = useCallback((priority: Priority) => {
    if (isMuted) return;
    soundGenerators.current[priority]();
  }, [isMuted]);

  const showBrowserNotification = useCallback((orderId: string, amount: number, priority: Priority) => {
    if ('Notification' in window && hasPermission) {
      const priorityLabel = getPriorityLabel(priority);
      const notification = new Notification(`${priorityLabel} Order!`, {
        body: `Order #${orderId.slice(0, 8).toUpperCase()} - ₹${amount.toFixed(0)}`,
        icon: '/favicon.ico',
        tag: orderId,
        requireInteraction: priority === 'urgent',
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  }, [hasPermission, getPriorityLabel]);

  const showToastNotification = useCallback((orderId: string, amount: number, priority: Priority) => {
    const priorityLabel = getPriorityLabel(priority);
    toast({
      title: `${priorityLabel} Order!`,
      description: `Order #${orderId.slice(0, 8).toUpperCase()} - ₹${amount.toFixed(0)}`,
      variant: priority === 'urgent' ? 'destructive' : 'default',
    });
  }, [toast, getPriorityLabel]);

  // Global subscription to new orders
  useEffect(() => {
    const channel = supabase
      .channel('global-order-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          const newOrder = payload.new as { id: string; total_amount: number };
          const priority = getPriority(newOrder.total_amount);
          console.log('🔔 New order alert:', newOrder.id, 'Priority:', priority);
          
          // Increment unseen count
          setUnseenOrderCount((prev) => prev + 1);
          
          // Play priority-based sound
          playNotificationSound(priority);
          
          // Show browser notification
          showBrowserNotification(newOrder.id, newOrder.total_amount, priority);
          
          // Show in-app toast
          showToastNotification(newOrder.id, newOrder.total_amount, priority);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [getPriority, playNotificationSound, showBrowserNotification, showToastNotification]);

  const markOrdersSeen = useCallback(() => {
    setUnseenOrderCount(0);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const requestPermission = useCallback(() => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission().then((permission) => {
        setHasPermission(permission === 'granted');
      });
    }
  }, []);

  return (
    <AdminNotificationContext.Provider
      value={{
        unseenOrderCount,
        markOrdersSeen,
        isMuted,
        toggleMute,
        requestPermission,
        hasPermission,
      }}
    >
      {children}
    </AdminNotificationContext.Provider>
  );
}
