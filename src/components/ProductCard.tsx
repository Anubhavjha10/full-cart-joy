import { Link } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCart, Product } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useProductRating } from '@/hooks/useProductRatings';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart, items, updateQuantity } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { rating, loading: ratingLoading } = useProductRating(product.id);
  const cartItem = items.find((item) => item.id === product.id);
  const inWishlist = isInWishlist(product.id);

  const handleAddClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  const handleQuantityChange = (e: React.MouseEvent, newCount: number) => {
    e.preventDefault();
    e.stopPropagation();
    updateQuantity(product.id, newCount);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <Link to={`/product/${product.id}`}>
      <Card className="group overflow-hidden bg-card border border-border hover:shadow-card-hover transition-all duration-300 animate-fade-in cursor-pointer">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Rating Badge */}
          <div className="absolute top-3 left-3 bg-card/95 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1 text-xs font-medium text-foreground shadow-sm">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            {ratingLoading ? (
              <span className="w-6 h-3 bg-muted animate-pulse rounded" />
            ) : rating ? (
              <span>{rating.averageRating.toFixed(1)} ({rating.reviewCount})</span>
            ) : (
              <span>{product.rating.toFixed(1)}</span>
            )}
          </div>
          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-card/95 backdrop-blur-sm shadow-sm hover:bg-card transition-colors"
          >
            <Heart
              className={cn(
                'h-4 w-4 transition-colors',
                inWishlist ? 'fill-destructive text-destructive' : 'text-muted-foreground hover:text-destructive'
              )}
            />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-foreground text-sm line-clamp-1 mb-1">
            {product.name}
          </h3>
          <p className="text-muted-foreground text-xs mb-3">{product.quantity}</p>
          
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-foreground">₹{product.price}</span>
            
            {cartItem ? (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0 text-primary border-primary hover:bg-primary hover:text-primary-foreground"
                  onClick={(e) => handleQuantityChange(e, cartItem.count - 1)}
                >
                  -
                </Button>
                <span className="w-6 text-center font-semibold text-foreground">{cartItem.count}</span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0 text-primary border-primary hover:bg-primary hover:text-primary-foreground"
                  onClick={(e) => handleQuantityChange(e, cartItem.count + 1)}
                >
                  +
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4"
                onClick={handleAddClick}
              >
                ADD
              </Button>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default ProductCard;
