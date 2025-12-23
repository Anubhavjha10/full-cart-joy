import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Package, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
  low_stock_threshold: number;
  image_url: string | null;
}

interface LowStockAlertProps {
  limit?: number;
  showViewAll?: boolean;
}

export function LowStockAlert({ limit = 5, showViewAll = true }: LowStockAlertProps) {
  const [products, setProducts] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLowStockProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('admin_products')
          .select('id, name, stock, low_stock_threshold, image_url')
          .eq('is_active', true)
          .order('stock', { ascending: true })
          .limit(50);

        if (error) throw error;

        // Filter products where stock <= low_stock_threshold
        const lowStock = (data || []).filter(
          (p) => (p.stock || 0) <= (p.low_stock_threshold || 10)
        );

        setProducts(lowStock.slice(0, limit));
      } catch (error) {
        console.error('Error fetching low stock products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLowStockProducts();
  }, [limit]);

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Low Stock Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (products.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="h-4 w-4 text-green-500" />
            Stock Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            All products are well stocked
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-200 dark:border-amber-900">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Low Stock Alerts
            <Badge variant="destructive" className="ml-2">
              {products.length}
            </Badge>
          </CardTitle>
          {showViewAll && (
            <Link to="/admin/inventory">
              <Button variant="ghost" size="sm" className="h-8">
                View All
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-3 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/20"
            >
              <div className="h-10 w-10 rounded bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Package className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{product.name}</p>
                <p className="text-xs text-muted-foreground">
                  Threshold: {product.low_stock_threshold || 10}
                </p>
              </div>
              <Badge
                variant={product.stock === 0 ? 'destructive' : 'outline'}
                className={
                  product.stock === 0
                    ? ''
                    : 'border-amber-500 text-amber-600 dark:text-amber-400'
                }
              >
                {product.stock === 0 ? 'Out of Stock' : `${product.stock} left`}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
