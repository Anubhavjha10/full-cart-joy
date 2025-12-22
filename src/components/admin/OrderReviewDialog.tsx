import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertTriangle, Package } from 'lucide-react';

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  item_status: string;
}

interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  adjusted_amount: number | null;
  status: string;
  delivery_address: string | null;
  created_at: string;
}

interface OrderReviewDialogProps {
  order: Order;
  items: OrderItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderUpdated: () => void;
}

export default function OrderReviewDialog({
  order,
  items,
  open,
  onOpenChange,
  onOrderUpdated,
}: OrderReviewDialogProps) {
  const [outOfStockItems, setOutOfStockItems] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const toggleOutOfStock = (itemId: string) => {
    setOutOfStockItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const availableItems = items.filter((item) => !outOfStockItems.has(item.id));
  const adjustedTotal = availableItems.reduce(
    (sum, item) => sum + item.product_price * item.quantity,
    0
  );

  const handleAcceptOrder = async () => {
    if (availableItems.length === 0) {
      toast({
        title: 'Cannot accept order',
        description: 'At least one item must be available to accept the order.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Update out of stock items
      if (outOfStockItems.size > 0) {
        const { error: itemsError } = await supabase
          .from('order_items')
          .update({ item_status: 'out_of_stock' })
          .in('id', Array.from(outOfStockItems));

        if (itemsError) throw itemsError;
      }

      // Update order status and adjusted amount
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          status: 'accepted',
          adjusted_amount: outOfStockItems.size > 0 ? adjustedTotal : null,
        })
        .eq('id', order.id);

      if (orderError) throw orderError;

      // Create notification for user with detailed item info
      let notificationMessage: string;
      let notificationTitle: string;
      
      if (outOfStockItems.size > 0) {
        const outOfStockItemNames = items
          .filter((item) => outOfStockItems.has(item.id))
          .map((item) => item.product_name)
          .join(', ');
        
        notificationTitle = 'Order Accepted - Some Items Unavailable';
        notificationMessage = `Your order #${order.id.slice(0, 8).toUpperCase()} has been accepted. Unfortunately, the following items were out of stock and have been removed: ${outOfStockItemNames}. Your adjusted total is ${formatCurrency(adjustedTotal)}. We are now processing the remaining items.`;
      } else {
        notificationTitle = 'Order Accepted';
        notificationMessage = `Your order #${order.id.slice(0, 8).toUpperCase()} has been accepted and is being prepared.`;
      }

      await supabase.from('notifications').insert({
        user_id: order.user_id,
        order_id: order.id,
        type: outOfStockItems.size > 0 ? 'item_out_of_stock' : 'order_accepted',
        title: notificationTitle,
        message: notificationMessage,
      });

      // Trigger push notification
      try {
        await supabase.functions.invoke('send-push-notification', {
          body: {
            user_id: order.user_id,
            title: notificationTitle,
            body: notificationMessage,
            data: { orderId: order.id, status: 'accepted', url: '/orders' },
          },
        });
      } catch (pushError) {
        console.log('Push notification not sent (may not be configured):', pushError);
      }

      toast({ title: 'Order accepted successfully' });
      onOpenChange(false);
      onOrderUpdated();
    } catch (error) {
      console.error('Error accepting order:', error);
      toast({
        title: 'Error',
        description: 'Failed to accept order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelOrder = async () => {
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', order.id);

      if (error) throw error;

      const notificationTitle = 'Order Cancelled';
      const notificationMessage = `Your order #${order.id.slice(0, 8).toUpperCase()} has been cancelled.`;

      // Create cancellation notification
      await supabase.from('notifications').insert({
        user_id: order.user_id,
        order_id: order.id,
        type: 'order_cancelled',
        title: notificationTitle,
        message: notificationMessage,
      });

      // Trigger push notification
      try {
        await supabase.functions.invoke('send-push-notification', {
          body: {
            user_id: order.user_id,
            title: notificationTitle,
            body: notificationMessage,
            data: { orderId: order.id, status: 'cancelled', url: '/orders' },
          },
        });
      } catch (pushError) {
        console.log('Push notification not sent (may not be configured):', pushError);
      }

      toast({ title: 'Order cancelled' });
      onOpenChange(false);
      onOrderUpdated();
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Review Order #{order.id.slice(0, 8).toUpperCase()}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {order.delivery_address && (
            <div className="text-sm bg-muted/50 p-3 rounded-lg">
              <p className="text-muted-foreground mb-1">Delivery Address</p>
              <p className="font-medium">{order.delivery_address}</p>
            </div>
          )}

          <div>
            <p className="text-sm font-medium mb-3">
              Review items and mark any out of stock:
            </p>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {items.map((item) => {
                const isOutOfStock = outOfStockItems.has(item.id);
                return (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                      isOutOfStock
                        ? 'bg-destructive/5 border-destructive/20'
                        : 'bg-card border-border'
                    }`}
                  >
                    <Checkbox
                      id={item.id}
                      checked={isOutOfStock}
                      onCheckedChange={() => toggleOutOfStock(item.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p
                          className={`font-medium ${
                            isOutOfStock ? 'line-through text-muted-foreground' : ''
                          }`}
                        >
                          {item.product_name}
                        </p>
                        {isOutOfStock && (
                          <Badge variant="destructive" className="text-xs">
                            Out of Stock
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity} × {formatCurrency(item.product_price)}
                      </p>
                    </div>
                    <p
                      className={`font-medium ${
                        isOutOfStock ? 'line-through text-muted-foreground' : ''
                      }`}
                    >
                      {formatCurrency(item.product_price * item.quantity)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {outOfStockItems.size > 0 && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg text-amber-800 dark:text-amber-200">
              <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium">
                  {outOfStockItems.size} item(s) marked as out of stock
                </p>
                <p className="text-amber-600 dark:text-amber-300">
                  Original: {formatCurrency(order.total_amount)} → Adjusted:{' '}
                  {formatCurrency(adjustedTotal)}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-lg font-bold">
              Total: {formatCurrency(outOfStockItems.size > 0 ? adjustedTotal : order.total_amount)}
            </span>
            <Badge className="bg-amber-100 text-amber-800">
              {items.length - outOfStockItems.size} of {items.length} items
            </Badge>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="destructive"
            onClick={handleCancelOrder}
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Cancel Order
          </Button>
          <Button
            onClick={handleAcceptOrder}
            disabled={isSubmitting || availableItems.length === 0}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Accept Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
