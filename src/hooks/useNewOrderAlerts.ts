import { useEffect, useRef, useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Different notification sounds as data URIs
const SOUNDS = {
  // Standard order sound - simple beep
  standard: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleVABLH3Wz7qQg5E8V6baz6yEmMxPh9fWrqKwmIm0w7SsrLS2uLi+s6uipqq9u7/DtaigrLG8vLW4tba1vMC5tbW3wLu7wL22s7W7ube8vLi4ube4uru5uri6urq5ubq5urq6ubi4uLi5uLi4uLi4uLi4t7i4uLe3t7e3t7e3t7e3t7e3t7e3tre2tra1tbW1tbS0tLSzs7OzsrKysrGxsbGwsLCwr6+vrq6urq2traysrKurq6qqqqmpqaioqKenp6ampqWlpaSkpKOjo6KioqGhoaCgoJ+fn56enp2dnZycnJubm5qampqZmZmYmJiXl5eWlpaVlZWUlJSTk5OSkpKRkZGQkJCPj4+OjY2MjIyLi4qKioqJiYiIiIeHh4aGhoWFhYSEhIODg4KCgoGBgYCAgH9/f35+fn19fXx8fHt7e3p6enl5eXh4eHd3d3Z2dnV1dXR0dHNzc3JycnFxcXBwcG9vb25ubm1tbWxsbGtra2pqamlpaWhnaGdnZ2ZmZmVlZWRkZGNjY2JhYWFgYGBfX19eXl5dXV1cXFxbW1taWlpZWVlYWFhXV1dWVlZVVVVUVFRTU1NSUlJRUVFQUFBPT09OTk5NTU1MTExLS0tKSkpJSUlISEhHR0dGRkZFRUVEREQ=',
  // High priority - double beep
  high: 'data:audio/wav;base64,UklGRl4HAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YToHAAB/f39/f39/f39/fn5+fn5+fn19fX19fXx8fHx8e3t7e3t6enp6enl5eXl5eHh4eHh3d3d3dnZ2dnZ1dXV1dHR0dHRzc3Nzc3JycnJxcXFxcXBwcHBvb29vb25ubm5tbW1tbWxsbGxra2trampqamppaeXl5eXl5eTk5OTj4+Pj4uLi4uHh4eHg4ODg39/f39/e3t7e3d3d3dzc3Nzb29vb2tra2tnZ2dnY2NjY19fX19bW1tbV1dXV1NTU1NPT09PS0tLS0dHR0dDQ0NDPz8/Pzs7Ozs3Nzc3MzMzMy8vLy8rKysrJycnJyMjIyMfHx8fGxsbGxcXFxcTExMTDw8PDwsLCwsHBwcHAwMDAv7+/v76+vr69vb29vLy8vLu7u7u6urq6ubm5ueDg4ODg4ODg4eHh4eHh4eLi4uLi4uPj4+Pj4+Tk5OTk5eXl5eXl5ubm5ubm5+fn5+fn6Ojo6Ojo6enp6enp6urq6urq6+vr6+vr7Ozs7Ozs7e3t7e3t7u7u7u7u7+/v7+/v8PDw8PDw8fHx8fHx8vLy8vLy8/Pz8/Pz9PT09PT09fX19fX19vb29vb29/f39/f3+Pj4+Pj4+fn5+fn5+vr6+vr6+/v7+/v7/Pz8/Pz8/f39/f39/v7+/v7+////f39/f39/f39/fn5+fn5+fn19fX19fXx8fHx8e3t7e3t6enp6enl5eXl5eHh4eHh3d3d3dnZ2dnZ1dXV1dHR0dHRzc3Nzc3JycnJxcXFxcXBwcHBvb29vb25ubm5tbW1tbWxsbGxra2tra2pqamppaeXl5eXl5eTk5OTj4+Pj4uLi4uHh4eHg4ODg39/f39/e3t7e3d3d3dzc3Nzb29vb2tra2tnZ2dnY2NjY19fX19bW1tbV1dXV1NTU1NPT09PS0tLS0dHR0dDQ0NDPz8/Pzs7Ozs3Nzc3MzMzMy8vLy8rKysrJycnJyMjIyMfHx8fGxsbGxcXFxcTExMTDw8PDwsLCwsHBwcHAwMDAv7+/v76+vr69vb29vLy8vLu7u7u6urq6ubm5uQ==',
  // Urgent - triple ascending beep
  urgent: 'data:audio/wav;base64,UklGRsYIAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YaIIAAB/f39/f39/fn5+fn19fXx8fHt7e3p6enl5eXh4eHd3d3Z2dnV1dXR0dHNzc3JycnFxcXBwcG9vb25ubm1tbWxsbGtra2pqamlpaWhoaGdnZ2ZmZmVlZWRkZGNjY2JiYmFhYWBgYF9fX15eXl1dXVxcXFtbW1paWllZWVhYWFdXV1ZWVlVVVVRUVFNTU1JSUlFRUVBQUE9PT05OTk1NTUxMTEtLS0pKSklJSUhISEdHR0ZGRkVFReTk5OPj4+Li4uHh4eDg4N/f397e3t3d3dzc3Nvb29ra2tnZ2djY2NfX19bW1tXV1dTU1NPT09LS0tHR0dDQ0M/Pz87Ozs3Nzc7Ozs/Pz9DQ0NHR0dLS0tPT09TU1NXV1dbW1tfX19jY2NnZ2dra2tvb29zc3N3d3d7e3t/f3+Dg4OHh4eLi4uPj4+Tk5OXl5ebm5ufn5+jo6Onp6erq6uvr6+zs7O3t7e7u7u/v7/Dw8PHx8fLy8vPz8/T09PX19fb29vf39/j4+Pn5+fr6+vv7+/z8/P39/f7+/v///39/f39/f35+fn19fXx8fHt7e3p6enl5eXh4eHd3d3Z2dnV1dXR0dHNzc3JycnFxcXBwcG9vb25ubm1tbWxsbGtra2pqamlpaWhoaGdnZ2ZmZmVlZWRkZGNjY2JiYmFhYWBgYF9fX15eXl1dXVxcXFtbW1paWllZWVhYWFdXV1ZWVlVVVVRUVFNTU1JSUlFRUVBQUE9PT05OTk1NTUxMTEtLS0pKSklJSUhISEdHR0ZGRkVFRebm5uXl5eTk5OPj4+Li4uHh4eDg4N/f397e3t3d3dzc3Nvb29ra2tnZ2djY2NfX19bW1tXV1dTU1NPT09LS0tHR0dDQ0M/Pz87Ozs3NzcrKysrKysrKysrKysrKysrKy8vLy8vLy8vLy8zMzMzMzMzMzM3Nzc3Nzc3Nzc7Ozs7Ozs7Ozs/Pz8/Pz8/Pz9DQ0NDQ0NDQ0NHR0dHR0dHR0dLS0tLS0tLS0tPT09PT09PT09TU1NTU1NTU1NXV1dXV1dXV1dbW1tbW1tbW1tfX19fX19fX19jY2NjY2NjY2NnZ2dnZ2dnZ2dra2tra2tra2tvb29vb29vb29zc3Nzc3Nzc3N3d3d3d3d3d3d7e3t7e3t7e3t/f39/f39/f3+Dg4ODg4ODg4OHh4eHh4eHh4eLi4uLi4uLi4uPj4+Pj4+Pj4+Tk5OTk5OTk5OXl5eXl5eXl5ebm5ubm5ubm5ufn5+fn5+fn5+jo6Ojo6Ojo6Onp6enp6enp6erq6urq6urq6uvr6+vr6+vr6+zs7Ozs7Ozs7O3t7e3t7e3t7e7u7u7u7u7u7u/v7+/v7+/v7/Dw8PDw8PDw8PHx8fHx8fHx8fLy8vLy8vLy8vPz8/Pz8/Pz8/T09PT09PT09PX19fX19fX19fb29vb29vb29vf39/f39/f39/j4+Pj4+Pj4+Pn5+fn5+fn5+fr6+vr6+vr6+vv7+/v7+/v7+/z8/Pz8/Pz8/P39/f39/f39/f7+/v7+/v7+/v////8=',
};

// Priority thresholds based on order amount
const PRIORITY_THRESHOLDS = {
  urgent: 2000, // Orders above ₹2000
  high: 1000,   // Orders above ₹1000
};

type Priority = 'standard' | 'high' | 'urgent';

export function useNewOrderAlerts() {
  const { toast } = useToast();
  const audioRefs = useRef<Record<Priority, HTMLAudioElement | null>>({
    standard: null,
    high: null,
    urgent: null,
  });
  const hasPermissionRef = useRef(false);
  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem('orderAlertsMuted') === 'true';
  });

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

  // Create audio elements for each priority level
  useEffect(() => {
    Object.entries(SOUNDS).forEach(([priority, dataUri]) => {
      const audio = new Audio(dataUri);
      audio.volume = 0.5;
      audioRefs.current[priority as Priority] = audio;
    });
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
    
    const audio = audioRefs.current[priority];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch((err) => {
        console.log('Could not play notification sound:', err);
      });
    }
  }, [isMuted]);

  const showBrowserNotification = useCallback((orderId: string, amount: number, priority: Priority) => {
    if ('Notification' in window && hasPermissionRef.current) {
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
  }, [getPriorityLabel]);

  const showToastNotification = useCallback((orderId: string, amount: number, priority: Priority) => {
    const priorityLabel = getPriorityLabel(priority);
    toast({
      title: `${priorityLabel} Order!`,
      description: `Order #${orderId.slice(0, 8).toUpperCase()} - ₹${amount.toFixed(0)}`,
      variant: priority === 'urgent' ? 'destructive' : 'default',
    });
  }, [toast, getPriorityLabel]);

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
          const priority = getPriority(newOrder.total_amount);
          console.log('New order alert:', newOrder, 'Priority:', priority);
          
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

  return {
    isMuted,
    toggleMute: () => setIsMuted((prev) => !prev),
    requestPermission: () => {
      if ('Notification' in window && Notification.permission !== 'granted') {
        Notification.requestPermission().then((permission) => {
          hasPermissionRef.current = permission === 'granted';
        });
      }
    },
  };
}
