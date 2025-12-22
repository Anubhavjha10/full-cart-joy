import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import { Product } from '@/contexts/CartContext';

interface ProductSectionProps {
  title: string;
  products: Product[];
  categorySlug?: string;
}

const ProductSection = ({ title, products, categorySlug }: ProductSectionProps) => {
  const displayProducts = products.slice(0, 4);
  const hasMore = products.length > 4;

  return (
    <section className="py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        {hasMore && categorySlug && (
          <Link 
            to={`/category/${categorySlug}`}
            className="flex items-center gap-1 text-primary font-medium text-sm hover:underline"
          >
            see all
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {displayProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default ProductSection;
