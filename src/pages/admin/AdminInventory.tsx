import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  DialogDescription,
  DialogFooter,
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Search,
  Loader2,
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingDown,
  TrendingUp,
  Edit2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Product {
  id: string;
  name: string;
  stock: number;
  low_stock_threshold: number;
  is_active: boolean;
  image_url: string | null;
  price: number;
  category_id: string | null;
}

interface Category {
  id: string;
  name: string;
}

type StockFilter = 'all' | 'low' | 'out' | 'healthy';

export default function AdminInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newStock, setNewStock] = useState(0);
  const [newThreshold, setNewThreshold] = useState(10);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_products')
        .select('id, name, stock, low_stock_threshold, is_active, image_url, price, category_id')
        .order('stock', { ascending: true });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch inventory',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleEditStock = (product: Product) => {
    setEditingProduct(product);
    setNewStock(product.stock || 0);
    setNewThreshold(product.low_stock_threshold || 10);
  };

  const handleSaveStock = async () => {
    if (!editingProduct) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('admin_products')
        .update({
          stock: newStock,
          low_stock_threshold: newThreshold,
        })
        .eq('id', editingProduct.id);

      if (error) throw error;

      toast({ title: 'Stock updated successfully' });
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      console.error('Error updating stock:', error);
      toast({
        title: 'Error',
        description: 'Failed to update stock',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getStockStatus = (product: Product) => {
    const stock = product.stock || 0;
    const threshold = product.low_stock_threshold || 10;

    if (stock === 0) return 'out';
    if (stock <= threshold) return 'low';
    return 'healthy';
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const matchesStock =
      stockFilter === 'all' || getStockStatus(product) === stockFilter;

    const matchesCategory =
      categoryFilter === 'all' || product.category_id === categoryFilter;

    return matchesSearch && matchesStock && matchesCategory;
  });

  const stats = {
    total: products.length,
    outOfStock: products.filter((p) => (p.stock || 0) === 0).length,
    lowStock: products.filter((p) => {
      const stock = p.stock || 0;
      const threshold = p.low_stock_threshold || 10;
      return stock > 0 && stock <= threshold;
    }).length,
    healthy: products.filter((p) => {
      const stock = p.stock || 0;
      const threshold = p.low_stock_threshold || 10;
      return stock > threshold;
    }).length,
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Inventory Management</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card
          className={`cursor-pointer transition-colors ${
            stockFilter === 'all' ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => setStockFilter('all')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-colors ${
            stockFilter === 'out' ? 'ring-2 ring-destructive' : ''
          }`}
          onClick={() => setStockFilter('out')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.outOfStock}</div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-colors ${
            stockFilter === 'low' ? 'ring-2 ring-amber-500' : ''
          }`}
          onClick={() => setStockFilter('low')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{stats.lowStock}</div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-colors ${
            stockFilter === 'healthy' ? 'ring-2 ring-green-500' : ''
          }`}
          onClick={() => setStockFilter('healthy')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Healthy Stock</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.healthy}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground self-center">
              {filteredProducts.length} products
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No products found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Threshold</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const status = getStockStatus(product);
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
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
                          <div>
                            <p className="font-medium">{product.name}</p>
                            {!product.is_active && (
                              <Badge variant="secondary" className="text-xs">
                                Inactive
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(product.price)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {status === 'out' && (
                            <TrendingDown className="h-4 w-4 text-destructive" />
                          )}
                          {status === 'low' && (
                            <TrendingDown className="h-4 w-4 text-amber-500" />
                          )}
                          {status === 'healthy' && (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          )}
                          <span
                            className={
                              status === 'out'
                                ? 'text-destructive font-medium'
                                : status === 'low'
                                ? 'text-amber-500 font-medium'
                                : ''
                            }
                          >
                            {product.stock || 0}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{product.low_stock_threshold || 10}</TableCell>
                      <TableCell>
                        {status === 'out' && (
                          <Badge variant="destructive">Out of Stock</Badge>
                        )}
                        {status === 'low' && (
                          <Badge className="bg-amber-500 hover:bg-amber-600">
                            Low Stock
                          </Badge>
                        )}
                        {status === 'healthy' && (
                          <Badge className="bg-green-500 hover:bg-green-600">
                            In Stock
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditStock(product)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Stock Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Stock</DialogTitle>
            <DialogDescription>
              Update stock level and low stock threshold for {editingProduct?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="stock">Current Stock</Label>
              <Input
                id="stock"
                type="number"
                min={0}
                value={newStock}
                onChange={(e) => setNewStock(parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="threshold">Low Stock Threshold</Label>
              <Input
                id="threshold"
                type="number"
                min={0}
                value={newThreshold}
                onChange={(e) => setNewThreshold(parseInt(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">
                Alert will show when stock falls to or below this number
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingProduct(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveStock} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
