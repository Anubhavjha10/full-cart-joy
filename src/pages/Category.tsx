import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Filter, X, SortAsc, Star, Package, IndianRupee } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProductsByCategory } from '@/hooks/useProducts';
import { getCategoryIcon } from '@/hooks/useCategories';
import { useState, useMemo } from 'react';

type SortOption = 'relevance' | 'price-low' | 'price-high' | 'name-asc' | 'name-desc';

const Category = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const { products, category, loading } = useProductsByCategory(categoryId);
  
  // Filter states
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [stockStatus, setStockStatus] = useState<'all' | 'in-stock' | 'out-of-stock'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Calculate price bounds from products
  const priceBounds = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 10000 };
    const prices = products.map(p => p.price);
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices)),
    };
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Price filter
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Stock status filter
    if (stockStatus === 'in-stock') {
      result = result.filter(p => (p.stock ?? 0) > 0);
    } else if (stockStatus === 'out-of-stock') {
      result = result.filter(p => (p.stock ?? 0) === 0);
    }

    // Rating filter (we'll use a mock rating for now since we don't have it in admin_products)
    // In production, you'd join with product_reviews and calculate average
    if (selectedRatings.length > 0) {
      // For now, we'll just show all products since rating isn't in DB yet
      // This filter will work once you add rating data
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }

    return result;
  }, [products, priceRange, stockStatus, selectedRatings, sortBy]);

  const handleRatingToggle = (rating: number) => {
    setSelectedRatings(prev =>
      prev.includes(rating)
        ? prev.filter(r => r !== rating)
        : [...prev, rating]
    );
  };

  const clearFilters = () => {
    setPriceRange([priceBounds.min, priceBounds.max]);
    setSelectedRatings([]);
    setStockStatus('all');
    setSortBy('relevance');
  };

  const hasActiveFilters = 
    priceRange[0] !== priceBounds.min || 
    priceRange[1] !== priceBounds.max || 
    selectedRatings.length > 0 || 
    stockStatus !== 'all';

  const activeFilterCount = [
    priceRange[0] !== priceBounds.min || priceRange[1] !== priceBounds.max,
    selectedRatings.length > 0,
    stockStatus !== 'all',
  ].filter(Boolean).length;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Price Range Filter */}
      <div>
        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <IndianRupee className="h-4 w-4" />
          Price Range
        </h3>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={(value) => setPriceRange(value as [number, number])}
            min={priceBounds.min}
            max={priceBounds.max}
            step={10}
            className="mb-4"
          />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>₹{priceRange[0]}</span>
            <span>₹{priceRange[1]}</span>
          </div>
        </div>
      </div>

      {/* Rating Filter */}
      <div>
        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <Star className="h-4 w-4" />
          Rating
        </h3>
        <div className="space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <label
              key={rating}
              className="flex items-center gap-3 cursor-pointer hover:bg-accent/50 p-2 rounded-lg transition-colors"
            >
              <Checkbox
                checked={selectedRatings.includes(rating)}
                onCheckedChange={() => handleRatingToggle(rating)}
              />
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">& up</span>
            </label>
          ))}
        </div>
      </div>

      {/* Stock Status Filter */}
      <div>
        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <Package className="h-4 w-4" />
          Availability
        </h3>
        <div className="space-y-2">
          <label className="flex items-center gap-3 cursor-pointer hover:bg-accent/50 p-2 rounded-lg transition-colors">
            <Checkbox
              checked={stockStatus === 'all'}
              onCheckedChange={() => setStockStatus('all')}
            />
            <span className="text-sm text-foreground">All Products</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer hover:bg-accent/50 p-2 rounded-lg transition-colors">
            <Checkbox
              checked={stockStatus === 'in-stock'}
              onCheckedChange={() => setStockStatus(stockStatus === 'in-stock' ? 'all' : 'in-stock')}
            />
            <span className="text-sm text-foreground">In Stock</span>
            <Badge variant="secondary" className="ml-auto text-xs">
              {products.filter(p => (p.stock ?? 0) > 0).length}
            </Badge>
          </label>
          <label className="flex items-center gap-3 cursor-pointer hover:bg-accent/50 p-2 rounded-lg transition-colors">
            <Checkbox
              checked={stockStatus === 'out-of-stock'}
              onCheckedChange={() => setStockStatus(stockStatus === 'out-of-stock' ? 'all' : 'out-of-stock')}
            />
            <span className="text-sm text-foreground">Out of Stock</span>
            <Badge variant="outline" className="ml-auto text-xs">
              {products.filter(p => (p.stock ?? 0) === 0).length}
            </Badge>
          </label>
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={clearFilters}
          className="w-full"
        >
          <X className="h-4 w-4 mr-2" />
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <main className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Category Header */}
        <div className="flex items-center gap-4 mb-6">
          {loading ? (
            <>
              <Skeleton className="w-14 h-14 rounded-full" />
              <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
            </>
          ) : (
            <>
              <span className="text-5xl">
                {categoryId ? getCategoryIcon(categoryId) : '📦'}
              </span>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  {category?.name || categoryId?.replace(/-/g, ' ')}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {filteredProducts.length} of {products.length} products
                </p>
              </div>
            </>
          )}
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-4">
            {(priceRange[0] !== priceBounds.min || priceRange[1] !== priceBounds.max) && (
              <Badge variant="secondary" className="gap-1">
                ₹{priceRange[0]} - ₹{priceRange[1]}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => setPriceRange([priceBounds.min, priceBounds.max])} 
                />
              </Badge>
            )}
            {selectedRatings.length > 0 && (
              <Badge variant="secondary" className="gap-1">
                {Math.min(...selectedRatings)}+ Stars
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => setSelectedRatings([])} 
                />
              </Badge>
            )}
            {stockStatus !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                {stockStatus === 'in-stock' ? 'In Stock' : 'Out of Stock'}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => setStockStatus('all')} 
                />
              </Badge>
            )}
          </div>
        )}

        <div className="flex gap-6">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-foreground flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </h2>
                {hasActiveFilters && (
                  <Badge variant="secondary">{activeFilterCount}</Badge>
                )}
              </div>
              <FilterContent />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filters & Sort Bar */}
            <div className="flex items-center gap-3 mb-6">
              {/* Mobile Filter Button */}
              <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden gap-2">
                    <Filter className="h-4 w-4" />
                    Filters
                    {activeFilterCount > 0 && (
                      <Badge className="bg-primary text-primary-foreground ml-1">
                        {activeFilterCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      Filters
                    </SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterContent />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2 ml-auto">
                <SortAsc className="h-4 w-4 text-muted-foreground hidden sm:block" />
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="name-asc">Name: A to Z</SelectItem>
                    <SelectItem value="name-desc">Name: Z to A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <Skeleton key={i} className="h-64 rounded-xl" />
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={{
                      id: product.id,
                      name: product.name,
                      quantity: product.unit,
                      price: product.price,
                      image: product.image_url || '/placeholder.svg',
                      category: product.category?.slug || '',
                      rating: 4.5,
                    }} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg mb-4">
                  {hasActiveFilters 
                    ? 'No products match your filters.'
                    : 'No products available in this category yet.'}
                </p>
                {hasActiveFilters ? (
                  <Button onClick={clearFilters}>Clear Filters</Button>
                ) : (
                  <Link to="/">
                    <Button>Browse All Products</Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Category;
