import { useState, useMemo } from 'react';
import Header from '@/components/Header';
import HeroBanner from '@/components/HeroBanner';
import PromoCategoryCard from '@/components/PromoCategoryCard';
import CategoryIcon from '@/components/CategoryIcon';
import ProductSection from '@/components/ProductSection';
import FeaturedCarousel from '@/components/FeaturedCarousel';
import Footer from '@/components/Footer';
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
    <div className="min-h-screen bg-background">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <main className="container mx-auto px-4 py-6">
        {/* Hero Banner */}
        <HeroBanner />

        {/* Promo Category Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <PromoCategoryCard
            title="Medical Supplies"
            subtitle="Essential medical items for wellness"
            variant="cyan"
          />
          <PromoCategoryCard
            title="Grocery Essentials"
            subtitle="Daily needs delivered fast"
            variant="amber"
          />
          <PromoCategoryCard
            title="Fresh Produce"
            subtitle="Farm fresh vegetables & fruits"
            variant="violet"
          />
        </section>

        {/* Category Icons */}
        <section className="mt-10 overflow-x-auto">
          <div className="flex justify-start md:justify-center gap-2 md:gap-4 pb-2">
            {categories.map((cat) => (
              <CategoryIcon
                key={cat.label}
                icon={cat.icon}
                label={cat.label}
                href={`/category/${cat.label.toLowerCase().replace(/\s+/g, '-')}`}
              />
            ))}
          </div>
        </section>

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
    </div>
  );
};

export default Index;
