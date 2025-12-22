import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, ShoppingCart, Star, ChevronDown, Package, RotateCcw, Shield, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import ProductReviews from '@/components/ProductReviews';
import { useCart } from '@/contexts/CartContext';
import { getProductById, getRelatedProducts } from '@/data/products';
import { useProductRating } from '@/hooks/useProductRatings';
import { cn } from '@/lib/utils';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const { addToCart, items, updateQuantity } = useCart();

  const product = id ? getProductById(id) : undefined;
  const relatedProducts = id ? getRelatedProducts(id, 6) : [];
  const cartItem = items.find((item) => item.id === product?.id);
  const { rating, loading: ratingLoading } = useProductRating(product?.id || '');

  // Calculate discount (mock - you can make this dynamic)
  const mrp = product ? Math.round(product.price * 1.15) : 0;
  const discount = product ? Math.round(((mrp - product.price) / mrp) * 100) : 0;

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <main className="container mx-auto px-4 py-12">
          <div className="text-center py-16">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Product not found</h1>
            <p className="text-muted-foreground mb-6">
              The product you're looking for doesn't exist.
            </p>
            <Link to="/">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Back to Home
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-0">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <main className="container mx-auto px-4 py-4 lg:py-6">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Back</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
          {/* Product Image - Clean & Centered */}
          <div className="animate-fade-in">
            <div className="relative bg-muted/30 rounded-2xl p-6 lg:p-10 aspect-square flex items-center justify-center overflow-hidden group">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
              />
              
              {/* Discount Badge */}
              {discount > 0 && (
                <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground font-bold">
                  {discount}% OFF
                </Badge>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="animate-fade-in space-y-4">
            {/* Brand */}
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {product.brand}
            </span>
            
            {/* Name */}
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground leading-tight">
              {product.name}
            </h1>

            {/* Quantity & Rating Row */}
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="secondary" className="text-sm font-medium px-3 py-1">
                {product.quantity}
              </Badge>
              
              {/* Compact Rating */}
              <div className="flex items-center gap-1.5 text-sm">
                <div className="flex items-center gap-1 bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-md">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  <span className="font-semibold">
                    {ratingLoading ? '...' : rating ? rating.averageRating.toFixed(1) : product.rating.toFixed(1)}
                  </span>
                </div>
                {rating && rating.reviewCount > 0 && (
                  <span className="text-muted-foreground">
                    ({rating.reviewCount} reviews)
                  </span>
                )}
              </div>
            </div>

            {/* Price Section */}
            <div className="flex items-baseline gap-3 pt-2">
              <span className="text-3xl font-bold text-foreground">₹{product.price}</span>
              {discount > 0 && (
                <>
                  <span className="text-lg text-muted-foreground line-through">₹{mrp}</span>
                  <Badge variant="outline" className="text-green-600 border-green-600/30 bg-green-500/5">
                    Save ₹{mrp - product.price}
                  </Badge>
                </>
              )}
            </div>

            {/* Short Description */}
            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
              {product.description}
            </p>

            {/* Quick Info Pills */}
            <div className="flex flex-wrap gap-2 py-2">
              <div className="flex items-center gap-1.5 text-xs bg-accent/50 rounded-full px-3 py-1.5">
                <Truck className="h-3.5 w-3.5 text-primary" />
                <span>Free Delivery</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs bg-accent/50 rounded-full px-3 py-1.5">
                <RotateCcw className="h-3.5 w-3.5 text-primary" />
                <span>Easy Returns</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs bg-accent/50 rounded-full px-3 py-1.5">
                <Shield className="h-3.5 w-3.5 text-primary" />
                <span>100% Genuine</span>
              </div>
            </div>

            {/* Desktop Add to Cart */}
            <div className="hidden lg:block pt-4">
              {cartItem ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-primary rounded-lg overflow-hidden">
                    <Button
                      size="lg"
                      variant="ghost"
                      className="h-12 w-12 p-0 rounded-none text-primary hover:bg-primary/10"
                      onClick={() => updateQuantity(product.id, cartItem.count - 1)}
                    >
                      <Minus className="h-5 w-5" />
                    </Button>
                    <span className="w-12 text-center text-lg font-bold text-foreground">
                      {cartItem.count}
                    </span>
                    <Button
                      size="lg"
                      variant="ghost"
                      className="h-12 w-12 p-0 rounded-none text-primary hover:bg-primary/10"
                      onClick={() => updateQuantity(product.id, cartItem.count + 1)}
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Item added to cart
                  </span>
                </div>
              ) : (
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 h-12 gap-2 text-base"
                  onClick={() => addToCart(product)}
                >
                  <ShoppingCart className="h-5 w-5" />
                  Add to Cart
                </Button>
              )}
            </div>

            {/* Expandable Sections */}
            <Accordion type="multiple" className="w-full pt-4">
              <AccordionItem value="details" className="border-b border-border/50">
                <AccordionTrigger className="text-sm font-semibold hover:no-underline py-4">
                  Product Details
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Brand</span>
                      <span className="text-foreground font-medium">{product.brand}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pack Size</span>
                      <span className="text-foreground font-medium">{product.quantity}</span>
                    </div>
                    {product.origin && (
                      <div className="flex justify-between">
                        <span>Country of Origin</span>
                        <span className="text-foreground font-medium">{product.origin}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Shelf Life</span>
                      <span className="text-foreground font-medium">Best before 6 months</span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="nutrition" className="border-b border-border/50">
                <AccordionTrigger className="text-sm font-semibold hover:no-underline py-4">
                  Nutritional Information
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Energy</span>
                      <span className="text-foreground font-medium">{product.nutritionalInfo.calories}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Protein</span>
                      <span className="text-foreground font-medium">{product.nutritionalInfo.protein}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Carbohydrates</span>
                      <span className="text-foreground font-medium">{product.nutritionalInfo.carbs}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fat</span>
                      <span className="text-foreground font-medium">{product.nutritionalInfo.fat}</span>
                    </div>
                    {product.nutritionalInfo.fiber && (
                      <div className="flex justify-between">
                        <span>Fiber</span>
                        <span className="text-foreground font-medium">{product.nutritionalInfo.fiber}</span>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {product.ingredients && (
                <AccordionItem value="ingredients" className="border-b border-border/50">
                  <AccordionTrigger className="text-sm font-semibold hover:no-underline py-4">
                    Ingredients
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground pb-4">
                    {product.ingredients}
                  </AccordionContent>
                </AccordionItem>
              )}

              <AccordionItem value="disclaimer" className="border-b-0">
                <AccordionTrigger className="text-sm font-semibold hover:no-underline py-4">
                  Disclaimer
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-4">
                  <p>
                    Product images are for illustrative purposes only. Actual product may vary. 
                    Please read all labels and packaging before use. Store in a cool, dry place.
                    Keep away from direct sunlight.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Product Reviews Section */}
            <div className="pt-4">
              <ProductReviews productId={product.id} />
            </div>
          </div>
        </div>

        {/* Similar Products Slider */}
        {relatedProducts.length > 0 && (
          <section className="mt-12 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">Similar Products</h2>
              <Link to={`/category/${product.category}`} className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
              {relatedProducts.map((relatedProduct) => (
                <div key={relatedProduct.id} className="flex-shrink-0 w-40 sm:w-48">
                  <ProductCard product={relatedProduct} />
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Mobile Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-card border-t border-border p-4 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.1)] z-50 animate-slide-in-bottom">
        <div className="flex items-center justify-between gap-4">
          {/* Price Info */}
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-foreground">₹{product.price}</span>
              {discount > 0 && (
                <span className="text-sm text-muted-foreground line-through">₹{mrp}</span>
              )}
            </div>
            <span className="text-xs text-muted-foreground">{product.quantity}</span>
          </div>

          {/* Add/Quantity Control */}
          {cartItem ? (
            <div className="flex items-center bg-primary rounded-lg overflow-hidden">
              <Button
                size="sm"
                variant="ghost"
                className="h-10 w-10 p-0 rounded-none text-primary-foreground hover:bg-primary/80"
                onClick={() => updateQuantity(product.id, cartItem.count - 1)}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-10 text-center text-base font-bold text-primary-foreground">
                {cartItem.count}
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="h-10 w-10 p-0 rounded-none text-primary-foreground hover:bg-primary/80"
                onClick={() => updateQuantity(product.id, cartItem.count + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 h-10"
              onClick={() => addToCart(product)}
            >
              Add
            </Button>
          )}
        </div>
      </div>

      <div className="hidden lg:block">
        <Footer />
      </div>
    </div>
  );
};

export default ProductDetail;
