import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronDown, ChevronUp, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import OrderTimeline from '@/components/OrderTimeline';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeOrders, Order, OrderItem } from '@/hooks/useRealtimeOrders';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { getStatusLabel, getStatusColor } from '@/lib/orderStatusFlow';

const Orders = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const { orders, loading } = useRealtimeOrders();

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'accepted':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'packed':
        return 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20';
      case 'out_for_delivery':
        return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'delivered':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'cancelled':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getOutOfStockItems = (items: OrderItem[] | undefined) => {
    if (!items) return [];
    return items.filter((item) => item.item_status === 'out_of_stock');
  };

  const getAvailableItems = (items: OrderItem[] | undefined) => {
    if (!items) return [];
    return items.filter((item) => item.item_status !== 'out_of_stock');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <main className="container mx-auto px-4 py-12">
          <div className="text-center py-16">
            <Package className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Sign in to view orders</h1>
            <p className="text-muted-foreground mb-6">
              Please login to see your order history.
            </p>
            <Link to="/auth">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Sign In
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <main className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-foreground mb-6">My Orders</h1>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
            <h2 className="text-xl font-bold text-foreground mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-6">
              You haven't placed any orders yet. Start shopping!
            </p>
            <Link to="/">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Browse Products
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const isExpanded = expandedOrders.has(order.id);
              const outOfStockItems = getOutOfStockItems(order.order_items);
              const availableItems = getAvailableItems(order.order_items);
              const hasOutOfStock = outOfStockItems.length > 0;
              const displayAmount = order.adjusted_amount ?? order.total_amount;

              return (
                <Card key={order.id} className="overflow-hidden animate-fade-in">
                  {/* Order Header */}
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm text-muted-foreground">Order ID:</span>
                          <span className="font-mono text-sm text-foreground">
                            {order.id.slice(0, 8).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(order.created_at), 'MMM dd, yyyy')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {format(new Date(order.created_at), 'hh:mm a')}
                          </span>
                        </div>
                      </div>
                      <Badge className={cn('border', getStatusColorClass(order.status))}>
                        {getStatusLabel(order.status)}
                      </Badge>
                    </div>

                    {/* Out of stock warning */}
                    {hasOutOfStock && (
                      <div className="flex items-start gap-2 p-3 mb-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg text-amber-800 dark:text-amber-200">
                        <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="font-medium">
                            {outOfStockItems.length} item(s) were out of stock
                          </p>
                          <p className="text-amber-600 dark:text-amber-300">
                            {outOfStockItems.map((item) => item.product_name).join(', ')}
                          </p>
                        </div>
                      </div>
                    )}

                    {availableItems.length > 0 && (
                      <div className="border-t border-border pt-4 mb-4">
                        <div className="space-y-2">
                          {availableItems.slice(0, 2).map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span className="text-foreground">
                                {item.product_name} x {item.quantity}
                              </span>
                              <span className="text-muted-foreground">
                                ₹{item.product_price * item.quantity}
                              </span>
                            </div>
                          ))}
                          {availableItems.length > 2 && (
                            <p className="text-sm text-muted-foreground">
                              +{availableItems.length - 2} more items
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div>
                        <span className="font-bold text-lg text-foreground">
                          Total: ₹{displayAmount}
                        </span>
                        {order.adjusted_amount && order.adjusted_amount !== order.total_amount && (
                          <span className="text-sm text-muted-foreground line-through ml-2">
                            ₹{order.total_amount}
                          </span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary"
                        onClick={() => toggleOrderExpand(order.id)}
                      >
                        {isExpanded ? 'Hide' : 'Track Order'}
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 ml-1" />
                        ) : (
                          <ChevronDown className="h-4 w-4 ml-1" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Timeline */}
                  {isExpanded && (
                    <div className="border-t border-border bg-muted/30 px-6 pb-6">
                      <OrderTimeline status={order.status} createdAt={order.created_at} />

                      {order.delivery_address && (
                        <div className="mt-4 p-4 bg-card rounded-lg border border-border">
                          <p className="text-sm font-medium text-foreground mb-1">
                            Delivery Address
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {order.delivery_address}
                          </p>
                        </div>
                      )}

                      {order.order_items && order.order_items.length > 0 && (
                        <div className="mt-4 p-4 bg-card rounded-lg border border-border">
                          <p className="text-sm font-medium text-foreground mb-2">
                            All Items
                          </p>
                          <div className="space-y-2">
                            {order.order_items.map((item) => (
                              <div
                                key={item.id}
                                className={cn(
                                  'flex justify-between text-sm',
                                  item.item_status === 'out_of_stock' && 'opacity-50'
                                )}
                              >
                                <span className={cn(
                                  'text-foreground',
                                  item.item_status === 'out_of_stock' && 'line-through'
                                )}>
                                  {item.product_name} x {item.quantity}
                                  {item.item_status === 'out_of_stock' && (
                                    <Badge variant="destructive" className="ml-2 text-xs">
                                      Out of Stock
                                    </Badge>
                                  )}
                                </span>
                                <span className={cn(
                                  'text-muted-foreground',
                                  item.item_status === 'out_of_stock' && 'line-through'
                                )}>
                                  ₹{item.product_price * item.quantity}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Orders;
