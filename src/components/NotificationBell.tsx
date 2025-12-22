import { Bell, Volume2, VolumeX, BellRing, BellPlus, BellOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useOrderNotifications } from '@/hooks/useOrderNotifications';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';

export default function NotificationBell() {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead,
    isMuted,
    toggleMute,
    requestBrowserPermission,
  } = useOrderNotifications();
  
  const {
    isSupported: isPushSupported,
    isSubscribed: isPushSubscribed,
    isLoading: isPushLoading,
    subscribe: subscribePush,
    unsubscribe: unsubscribePush,
  } = usePushNotifications();
  
  const [isAnimating, setIsAnimating] = useState(false);

  // Animate bell when new notification arrives
  useEffect(() => {
    if (unreadCount > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [unreadCount]);

  // Request browser permission on mount
  useEffect(() => {
    requestBrowserPermission();
  }, [requestBrowserPermission]);

  const getNotificationIcon = (type: string) => {
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

  const handlePushToggle = () => {
    if (isPushSubscribed) {
      unsubscribePush();
    } else {
      subscribePush();
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn(
            "relative",
            isAnimating && "animate-pulse"
          )}
        >
          {isAnimating ? (
            <BellRing className="h-5 w-5 text-primary animate-wiggle" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-destructive animate-pulse"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h4 className="font-semibold text-sm">Notifications</h4>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={toggleMute}
              title={isMuted ? "Unmute notifications" : "Mute notifications"}
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            {isPushSupported && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handlePushToggle}
                disabled={isPushLoading}
                title={isPushSubscribed ? "Disable push notifications" : "Enable push notifications"}
              >
                {isPushLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isPushSubscribed ? (
                  <BellOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <BellPlus className="h-4 w-4" />
                )}
              </Button>
            )}
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-primary h-auto py-1 px-2"
                onClick={markAllAsRead}
              >
                Mark all read
              </Button>
            )}
          </div>
        </div>
        
        {/* Push notification status */}
        {isPushSupported && (
          <div className="px-4 py-2 bg-muted/30 border-b">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Push notifications
              </span>
              <span className={cn(
                "font-medium",
                isPushSubscribed ? "text-primary" : "text-muted-foreground"
              )}>
                {isPushSubscribed ? "Enabled" : "Disabled"}
              </span>
            </div>
          </div>
        )}
        
        <ScrollArea className="h-[280px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors',
                    !notification.is_read && 'bg-primary/5'
                  )}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex gap-3">
                    <span className="text-lg">
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          'text-sm',
                          !notification.is_read && 'font-medium'
                        )}
                      >
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(notification.created_at), 'MMM d, h:mm a')}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
