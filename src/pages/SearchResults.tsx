import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Filter, SortAsc, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { getAllProducts, categories } from '@/data/products';

type SortOption = 'relevance' | 'price-low' | 'price-high' | 'name-asc' | 'name-desc';

const categoryMap: Record<string, string> = {
  'Dairy & Eggs': 'dairy',
  'Vegetables': 'vegetables',
  'Fruits': 'vegetables',
  'Snacks': 'snacks',
  'Beverages': 'beverages',
  'Bakery': 'breakfast',
  'Staples': 'breakfast',
  'Meat & Fish': 'snacks',
};

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(query);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const allProducts = getAllProducts();

  const filteredProducts = useMemo(() => {
    let products = allProducts;

    // Filter by search query
    if (query) {
      const lowerQuery = query.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(lowerQuery) ||
          p.category.toLowerCase().includes(lowerQuery) ||
          p.brand.toLowerCase().includes(lowerQuery) ||
          p.description.toLowerCase().includes(lowerQuery)
      );
    }

    // Filter by selected categories
    if (selectedCategories.length > 0) {
      const categoryValues = selectedCategories.map((cat) => categoryMap[cat] || cat.toLowerCase());
      products = products.filter((p) => categoryValues.includes(p.category));
    }

    // Sort products
    switch (sortBy) {
      case 'price-low':
        products = [...products].sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        products = [...products].sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        products = [...products].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        products = [...products].sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        // relevance - keep original order
        break;
    }

    return products;
  }, [allProducts, query, selectedCategories, sortBy]);

  const handleSearchChange = (newQuery: string) => {
    setSearchQuery(newQuery);
    if (newQuery) {
      setSearchParams({ q: newQuery });
    } else {
      setSearchParams({});
    }
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSortBy('relevance');
  };

  const hasActiveFilters = selectedCategories.length > 0 || sortBy !== 'relevance';

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-foreground mb-3">Categories</h3>
        <div className="space-y-2">
          {categories.map((cat) => (
            <label
              key={cat.label}
              className="flex items-center gap-3 cursor-pointer hover:bg-accent/50 p-2 rounded-lg transition-colors"
            >
              <Checkbox
                checked={selectedCategories.includes(cat.label)}
                onCheckedChange={() => handleCategoryToggle(cat.label)}
              />
              <span className="text-lg">{cat.icon}</span>
              <span className="text-sm text-foreground">{cat.label}</span>
            </label>
          ))}
        </div>
      </div>

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
      <Header searchQuery={searchQuery} onSearchChange={handleSearchChange} />

      <main className="container mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {query ? `Search results for "${query}"` : 'All Products'}
          </h1>
          <p className="text-muted-foreground">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Active Filters */}
        {selectedCategories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedCategories.map((cat) => (
              <Badge
                key={cat}
                variant="secondary"
                className="gap-1 cursor-pointer hover:bg-destructive/20"
                onClick={() => handleCategoryToggle(cat)}
              >
                {cat}
                <X className="h-3 w-3" />
              </Badge>
            ))}
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
              </div>
              <FilterContent />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filters & Sort */}
            <div className="flex items-center gap-3 mb-6">
              {/* Mobile Filter Button */}
              <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden gap-2">
                    <Filter className="h-4 w-4" />
                    Filters
                    {selectedCategories.length > 0 && (
                      <Badge className="bg-primary text-primary-foreground ml-1">
                        {selectedCategories.length}
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
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-xl text-muted-foreground mb-4">
                  No products found
                </p>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your search or filters
                </p>
                <div className="flex gap-3 justify-center">
                  {query && (
                    <Link to="/search">
                      <Button variant="outline">View All Products</Button>
                    </Link>
                  )}
                  {hasActiveFilters && (
                    <Button onClick={clearFilters}>Clear Filters</Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SearchResults;
