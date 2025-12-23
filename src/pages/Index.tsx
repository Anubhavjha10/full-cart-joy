import { useState, useMemo } from 'react';
import Header from '@/components/Header';
import HeroBanner from '@/components/HeroBanner';
import NoticeBox from '@/components/NoticeBox';
import SpecialOfferBox from '@/components/SpecialOfferBox';
import CategorySection from '@/components/CategorySection';
import ProductSection from '@/components/ProductSection';
import FeaturedCarousel from '@/components/FeaturedCarousel';
import Footer from '@/components/Footer';
import MobileNavbar from '@/components/MobileNavbar';
import {
  categories,
  dairyProducts,
  vegetableProducts,
  snackProducts,
  breakfastProducts,
  beverageProducts,
} from '@/data/products';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Featured products - pick a mix for the carousel
  const featuredProducts = useMemo(() => {
    const featured = [
      ...dairyProducts.slice(0, 2),
      ...snackProducts.slice(0, 2),
      ...beverageProducts.slice(0, 2),
      ...breakfastProducts.slice(0, 2),
    ];
    return featured;
  }, []);

  // Filter products based on search query
  const filterProducts = (products: typeof dairyProducts) => {
    if (!searchQuery.trim()) return products;
    const query = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
    );
  };

  const filteredDairy = useMemo(() => filterProducts(dairyProducts), [searchQuery]);
  const filteredVegetables = useMemo(() => filterProducts(vegetableProducts), [searchQuery]);
  const filteredSnacks = useMemo(() => filterProducts(snackProducts), [searchQuery]);
  const filteredBreakfast = useMemo(() => filterProducts(breakfastProducts), [searchQuery]);
  const filteredBeverages = useMemo(() => filterProducts(beverageProducts), [searchQuery]);

  const hasResults =
    filteredDairy.length > 0 ||
    filteredVegetables.length > 0 ||
    filteredSnacks.length > 0 ||
    filteredBreakfast.length > 0 ||
    filteredBeverages.length > 0;

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
        <CategorySection categories={categories} />

        {/* Featured Products Carousel */}
        {!searchQuery && (
          <FeaturedCarousel 
            title="Featured Products" 
            products={featuredProducts} 
            icon="sparkles" 
          />
        )}

        {/* Product Sections */}
        {!hasResults && searchQuery && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No products found for "{searchQuery}"
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="text-primary underline mt-2"
            >
              Clear search
            </button>
          </div>
        )}

        {filteredDairy.length > 0 && (
          <ProductSection 
            title="Dairy, Bread & Eggs" 
            products={filteredDairy} 
            categorySlug="dairy-&-eggs"
          />
        )}

        {filteredVegetables.length > 0 && (
          <ProductSection 
            title="Fruits & Vegetables" 
            products={filteredVegetables} 
            categorySlug="vegetables"
          />
        )}

        {filteredSnacks.length > 0 && (
          <ProductSection 
            title="Snacks & Munchies" 
            products={filteredSnacks} 
            categorySlug="snacks"
          />
        )}

        {filteredBreakfast.length > 0 && (
          <ProductSection 
            title="Breakfast & Instant Food" 
            products={filteredBreakfast} 
            categorySlug="bakery"
          />
        )}

        {filteredBeverages.length > 0 && (
          <ProductSection 
            title="Cold Drinks & Juices" 
            products={filteredBeverages} 
            categorySlug="beverages"
          />
        )}
      </main>

      <Footer />
      <MobileNavbar />
    </div>
  );
};

export default Index;
