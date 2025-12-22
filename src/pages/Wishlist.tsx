import { Link } from 'react-router-dom';
import { Heart, ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/contexts/WishlistContext';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

const Wishlist = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { items, loading } = useWishlist();
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <main className="container mx-auto px-4 py-16 text-center">
          <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Login to view your wishlist
          </h1>
          <p className="text-muted-foreground mb-6">
            Save your favorite products to buy later
          </p>
          <Link to="/auth">
            <Button>Login / Sign Up</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

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

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Heart className="h-8 w-8 text-destructive" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Wishlist</h1>
            <p className="text-muted-foreground">
              {items.length} {items.length === 1 ? 'item' : 'items'} saved
            </p>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Loading wishlist...</p>
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {items.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  ...product,
                  category: product.category || 'General',
                  rating: product.rating || 4.5,
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg mb-4">
              Your wishlist is empty
            </p>
            <Link to="/">
              <Button>Start Shopping</Button>
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Wishlist;
