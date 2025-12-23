import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useProductsByCategory } from '@/hooks/useProducts';
import { getCategoryIcon } from '@/hooks/useCategories';
import { useState } from 'react';

const Category = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const { products, category, loading } = useProductsByCategory(categoryId);

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
        <div className="flex items-center gap-4 mb-8">
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
                  {products.length} products available
                </p>
              </div>
            </>
          )}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {products.map((product) => (
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
              No products available in this category yet.
            </p>
            <Link to="/">
              <Button>Browse All Products</Button>
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Category;
