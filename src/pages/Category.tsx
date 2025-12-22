import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import {
  categories,
  dairyProducts,
  vegetableProducts,
  snackProducts,
  breakfastProducts,
  beverageProducts,
  ProductWithDetails,
} from '@/data/products';
import { useState } from 'react';

const categoryProductMap: Record<string, ProductWithDetails[]> = {
  'dairy': dairyProducts,
  'fruits': vegetableProducts,
  'snacks': snackProducts,
  'breakfast': breakfastProducts,
  'beverages': beverageProducts,
  'cold drinks': beverageProducts,
  'tea': breakfastProducts,
  'atta': breakfastProducts,
  'masala': snackProducts,
  'cleaning': [],
  'personal': [],
  'pet': [],
};

const Category = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [searchQuery, setSearchQuery] = useState('');

  const category = categories.find(
    (cat) => cat.label.toLowerCase().replace(/\s+/g, '-') === categoryId
  );

  const getCategoryProducts = (): ProductWithDetails[] => {
    if (!categoryId) return [];
    
    // Try exact match first
    const normalizedId = categoryId.replace(/-/g, ' ').toLowerCase();
    
    for (const [key, products] of Object.entries(categoryProductMap)) {
      if (normalizedId.includes(key) || key.includes(normalizedId.split('-')[0])) {
        return products;
      }
    }
    
    return [];
  };

  const products = getCategoryProducts();

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
          {category && (
            <span className="text-5xl">{category.icon}</span>
          )}
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {category?.label || categoryId?.replace(/-/g, ' ')}
            </h1>
            <p className="text-muted-foreground mt-1">
              {products.length} products available
            </p>
          </div>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
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
