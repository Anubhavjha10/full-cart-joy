import { useState } from 'react';
import Header from '@/components/Header';
import HeroBanner from '@/components/HeroBanner';
import NoticeBox from '@/components/NoticeBox';
import SpecialOfferBox from '@/components/SpecialOfferBox';
import CategorySection from '@/components/CategorySection';
import ProductSection from '@/components/ProductSection';
import FeaturedCarousel from '@/components/FeaturedCarousel';
import Footer from '@/components/Footer';
import MobileNavbar from '@/components/MobileNavbar';
import { useCategories } from '@/hooks/useCategories';
import { useFeaturedProducts, useProductsByCategories } from '@/hooks/useProducts';
import { Skeleton } from '@/components/ui/skeleton';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { categories, loading: categoriesLoading } = useCategories();
  const { products: featuredProducts, loading: featuredLoading } = useFeaturedProducts();
  const { data: productsByCategory, loading: productsLoading } = useProductsByCategories();

  // Convert Map to array for rendering
  const categoryProductSections = Array.from(productsByCategory.entries());

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <main className="container mx-auto px-4 py-4">
        {/* Hero Banner */}
        <HeroBanner />

        {/* Notice and Offer Boxes - Hidden on mobile */}
        <section className="hidden md:grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <NoticeBox />
          <SpecialOfferBox />
        </section>

        {/* Category Section */}
        <CategorySection categories={categories} isLoading={categoriesLoading} />

        {/* Featured Products Carousel */}
        {!searchQuery && (
          featuredLoading ? (
            <section className="py-6">
              <Skeleton className="h-8 w-48 mb-4" />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-64 rounded-xl" />
                ))}
              </div>
            </section>
          ) : featuredProducts.length > 0 && (
            <FeaturedCarousel 
              title="Featured Products" 
              products={featuredProducts.map(p => ({
                id: p.id,
                name: p.name,
                quantity: p.unit,
                price: p.price,
                image: p.image_url || '/placeholder.svg',
                category: p.category?.slug || '',
                rating: 4.5,
              }))} 
              icon="sparkles" 
            />
          )
        )}

        {/* Product Sections by Category */}
        {productsLoading ? (
          <div className="space-y-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <section key={i} className="py-6">
                <Skeleton className="h-8 w-48 mb-4" />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <Skeleton key={j} className="h-64 rounded-xl" />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : categoryProductSections.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No products available yet. Add products from the Admin Panel.
            </p>
          </div>
        ) : (
          categoryProductSections.map(([categoryName, products]) => (
            <ProductSection 
              key={categoryName}
              title={categoryName} 
              products={products.map(p => ({
                id: p.id,
                name: p.name,
                quantity: p.unit,
                price: p.price,
                image: p.image_url || '/placeholder.svg',
                category: p.category?.slug || '',
                rating: 4.5,
              }))} 
              categorySlug={products[0]?.category?.slug}
            />
          ))
        )}
      </main>

      <Footer />
      <MobileNavbar />
    </div>
  );
};

export default Index;
