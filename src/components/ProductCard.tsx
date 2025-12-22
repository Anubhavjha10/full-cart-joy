import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCart, Product } from '@/contexts/CartContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart, items, updateQuantity } = useCart();
  const cartItem = items.find((item) => item.id === product.id);

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
          {/* Delivery Badge */}
          <div className="absolute top-3 left-3 bg-card/95 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1 text-xs font-medium text-foreground shadow-sm">
            <Clock className="h-3 w-3" />
            {product.deliveryTime}
          </div>
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
