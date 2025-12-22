import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Search, Loader2, ShoppingCart, Eye, ClipboardCheck, Radio } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import OrderReviewDialog from '@/components/admin/OrderReviewDialog';
import {
  ORDER_STATUSES,
  getValidNextStatuses,
  isTerminalStatus,
  getStatusLabel,
  getStatusColor,
} from '@/lib/orderStatusFlow';
import { useAdminRealtimeOrders, Order, OrderItem } from '@/hooks/useAdminRealtimeOrders';

export default function AdminOrders() {
  const { orders, loading, refetch } = useAdminRealtimeOrders();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const { toast } = useToast();

  const fetchOrderItems = async (orderId: string) => {
    setLoadingItems(true);
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (error) throw error;
      setOrderItems((data || []) as OrderItem[]);
    } catch (error) {
      console.error('Error fetching order items:', error);
    } finally {
      setLoadingItems(false);
    }
  };

  const handleViewDetails = async (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
    await fetchOrderItems(order.id);
  };

  const handleReviewOrder = async (order: Order) => {
    setSelectedOrder(order);
    await fetchOrderItems(order.id);
    setIsReviewOpen(true);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    // Validate transition on client side too
    const validStatuses = getValidNextStatuses(order.status);
    if (!validStatuses.includes(newStatus)) {
      toast({
        title: 'Invalid status change',
        description: `Cannot change from ${getStatusLabel(order.status)} to ${getStatusLabel(newStatus)}`,
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      // Create notification for status change
      await supabase.from('notifications').insert({
        user_id: order.user_id,
        order_id: orderId,
        type: `order_${newStatus}`,
        title: `Order ${getStatusLabel(newStatus)}`,
        message: `Your order #${orderId.slice(0, 8).toUpperCase()} is now ${getStatusLabel(newStatus).toLowerCase()}.`,
      });

      toast({ title: 'Order status updated' });
      // Real-time will handle the update automatically

      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update order status',
        variant: 'destructive',
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const colorClass = getStatusColor(status);
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
        {getStatusLabel(status)}
      </span>
    );
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const renderStatusSelect = (order: Order) => {
    const isTerminal = isTerminalStatus(order.status);
    const validNextStatuses = getValidNextStatuses(order.status);
    
    if (isTerminal) {
      return getStatusBadge(order.status);
    }

    // For pending orders, show review button instead of status select
    if (order.status === 'pending') {
      return (
        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={() => handleReviewOrder(order)}
        >
          <ClipboardCheck className="h-3 w-3 mr-1" />
          Review
        </Button>
      );
    }

    return (
      <Select
        value={order.status}
        onValueChange={(value) => handleStatusChange(order.id, value)}
      >
        <SelectTrigger className="w-[140px] h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {/* Current status */}
          <SelectItem value={order.status} disabled>
            {getStatusLabel(order.status)} (Current)
          </SelectItem>
          {/* Valid next statuses */}
          {validNextStatuses.map((status) => (
            <SelectItem key={status} value={status}>
              {getStatusLabel(status)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">Orders</h1>
          <Badge variant="outline" className="text-xs gap-1.5 animate-pulse">
            <span className="h-2 w-2 rounded-full bg-primary" />
            Live
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by order ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                {ORDER_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">
              {filteredOrders.length} orders
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No orders found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm">
                      #{order.id.slice(0, 8)}
                    </TableCell>
                    <TableCell>{formatDate(order.created_at)}</TableCell>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{formatCurrency(order.adjusted_amount ?? order.total_amount)}</span>
                        {order.adjusted_amount && order.adjusted_amount !== order.total_amount && (
                          <span className="text-xs text-muted-foreground line-through">
                            {formatCurrency(order.total_amount)}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {renderStatusSelect(order)}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDetails(order)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Order ID</p>
                  <p className="font-mono font-medium">#{selectedOrder.id.slice(0, 8)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium">{formatDate(selectedOrder.created_at)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                </div>
                <div>
                  <p className="text-muted-foreground">Total</p>
                  <p className="font-medium">
                    {formatCurrency(selectedOrder.adjusted_amount ?? selectedOrder.total_amount)}
                    {selectedOrder.adjusted_amount && selectedOrder.adjusted_amount !== selectedOrder.total_amount && (
                      <span className="text-xs text-muted-foreground line-through ml-2">
                        {formatCurrency(selectedOrder.total_amount)}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {selectedOrder.delivery_address && (
                <div className="text-sm">
                  <p className="text-muted-foreground">Delivery Address</p>
                  <p className="font-medium">{selectedOrder.delivery_address}</p>
                </div>
              )}

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Order Items</h4>
                {loadingItems ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : orderItems.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No items found</p>
                ) : (
                  <div className="space-y-2">
                    {orderItems.map((item) => (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between py-2 border-b last:border-0 ${
                          item.item_status === 'out_of_stock' ? 'opacity-50' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div>
                            <p className={`font-medium ${item.item_status === 'out_of_stock' ? 'line-through' : ''}`}>
                              {item.product_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Qty: {item.quantity}
                            </p>
                          </div>
                          {item.item_status === 'out_of_stock' && (
                            <Badge variant="destructive" className="text-xs">
                              Out of Stock
                            </Badge>
                          )}
                        </div>
                        <p className={`font-medium ${item.item_status === 'out_of_stock' ? 'line-through' : ''}`}>
                          {formatCurrency(item.product_price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Order Review Dialog for pending orders */}
      {selectedOrder && (
        <OrderReviewDialog
          order={selectedOrder}
          items={orderItems}
          open={isReviewOpen}
          onOpenChange={setIsReviewOpen}
          onOrderUpdated={refetch}
        />
      )}
    </div>
  );
}
