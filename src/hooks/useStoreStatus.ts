import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMemo } from 'react';

interface StoreSettings {
  openTime: string;
  closeTime: string;
  forceStatus: 'auto' | 'open' | 'closed';
  closedMessage: string;
}

interface StoreStatus {
  isOpen: boolean;
  nextOpenTime: string | null;
  message: string;
  settings: StoreSettings;
  loading: boolean;
}

export function useStoreStatus(): StoreStatus {
  const { data: settings, isLoading } = useQuery({
    queryKey: ['store-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_settings')
        .select('setting_key, setting_value');

      if (error) throw error;

      const settingsMap: Record<string, string> = {};
      data?.forEach((item: { setting_key: string; setting_value: string }) => {
        settingsMap[item.setting_key] = item.setting_value;
      });

      return {
        openTime: settingsMap.store_open_time || '09:00',
        closeTime: settingsMap.store_close_time || '21:00',
        forceStatus: (settingsMap.store_force_status || 'auto') as 'auto' | 'open' | 'closed',
        closedMessage: settingsMap.store_closed_message || 'Store is closed right now.',
      };
    },
    staleTime: 60000, // 1 minute
    refetchInterval: 60000, // Refetch every minute
  });

  const storeStatus = useMemo(() => {
    if (!settings) {
      return {
        isOpen: true,
        nextOpenTime: null,
        message: '',
        settings: {
          openTime: '09:00',
          closeTime: '21:00',
          forceStatus: 'auto' as const,
          closedMessage: 'Store is closed.',
        },
        loading: isLoading,
      };
    }

    // Handle force status
    if (settings.forceStatus === 'open') {
      return {
        isOpen: true,
        nextOpenTime: null,
        message: '',
        settings,
        loading: false,
      };
    }

    if (settings.forceStatus === 'closed') {
      return {
        isOpen: false,
        nextOpenTime: null,
        message: settings.closedMessage,
        settings,
        loading: false,
      };
    }

    // Auto mode - check current time
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const [openHour, openMin] = settings.openTime.split(':').map(Number);
    const [closeHour, closeMin] = settings.closeTime.split(':').map(Number);

    const openMinutes = openHour * 60 + openMin;
    const closeMinutes = closeHour * 60 + closeMin;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    let isOpen: boolean;
    
    // Handle overnight hours (e.g., 22:00 - 06:00)
    if (closeMinutes < openMinutes) {
      isOpen = currentMinutes >= openMinutes || currentMinutes < closeMinutes;
    } else {
      isOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes;
    }

    const formatTime = (time: string) => {
      const [h, m] = time.split(':').map(Number);
      const period = h >= 12 ? 'PM' : 'AM';
      const hour = h % 12 || 12;
      return `${hour}:${String(m).padStart(2, '0')} ${period}`;
    };

    return {
      isOpen,
      nextOpenTime: isOpen ? null : formatTime(settings.openTime),
      message: isOpen ? '' : `${settings.closedMessage} Opens at ${formatTime(settings.openTime)}.`,
      settings,
      loading: false,
    };
  }, [settings, isLoading]);

  return storeStatus;
}
