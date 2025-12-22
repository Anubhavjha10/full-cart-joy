import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Truck, Shield, Plus, Minus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { useCart } from '@/contexts/CartContext';
import { getProductById, getRelatedProducts } from '@/data/products';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const { addToCart, items, updateQuantity } = useCart();

  const product = id ? getProductById(id) : undefined;
  const relatedProducts = id ? getRelatedProducts(id, 4) : [];
  const cartItem = items.find((item) => item.id === product?.id);

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <main className="container mx-auto px-4 py-12">
          <div className="text-center py-16">
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
    <div className="min-h-screen bg-background">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <main className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-primary hover:underline mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Link>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Image */}
          <div className="animate-fade-in">
            <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <Badge className="absolute top-4 left-4 bg-card/95 text-foreground backdrop-blur-sm">
                <Clock className="h-3 w-3 mr-1" />
                {product.deliveryTime}
              </Badge>
            </div>
          </div>

          {/* Product Info */}
          <div className="animate-slide-in">
            <div className="mb-2">
              <Badge variant="secondary" className="text-xs">
                {product.brand}
              </Badge>
            </div>
            
            <h1 className="text-3xl font-bold text-foreground mb-2">{product.name}</h1>
            <p className="text-muted-foreground mb-4">{product.quantity}</p>
            
            <div className="text-3xl font-bold text-primary mb-6">₹{product.price}</div>

            <p className="text-foreground mb-6 leading-relaxed">{product.description}</p>

            {/* Add to Cart */}
            <div className="flex items-center gap-4 mb-8">
              {cartItem ? (
                <div className="flex items-center gap-3">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 w-12 p-0 text-primary border-primary hover:bg-primary hover:text-primary-foreground"
                    onClick={() => updateQuantity(product.id, cartItem.count - 1)}
                  >
                    <Minus className="h-5 w-5" />
                  </Button>
                  <span className="w-12 text-center text-xl font-bold text-foreground">
                    {cartItem.count}
                  </span>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 w-12 p-0 text-primary border-primary hover:bg-primary hover:text-primary-foreground"
                    onClick={() => updateQuantity(product.id, cartItem.count + 1)}
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
              ) : (
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 gap-2"
                  onClick={() => addToCart(product)}
                >
                  <ShoppingCart className="h-5 w-5" />
                  Add to Cart
                </Button>
              )}
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="flex flex-col items-center text-center p-4 bg-accent/50 rounded-lg">
                <Clock className="h-6 w-6 text-primary mb-2" />
                <span className="text-sm font-medium text-foreground">Fast Delivery</span>
                <span className="text-xs text-muted-foreground">13 minutes</span>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-accent/50 rounded-lg">
                <Truck className="h-6 w-6 text-primary mb-2" />
                <span className="text-sm font-medium text-foreground">Free Shipping</span>
                <span className="text-xs text-muted-foreground">No minimum order</span>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-accent/50 rounded-lg">
                <Shield className="h-6 w-6 text-primary mb-2" />
                <span className="text-sm font-medium text-foreground">Quality Assured</span>
                <span className="text-xs text-muted-foreground">100% genuine</span>
              </div>
            </div>

            {/* Product Details Card */}
            <Card className="p-6">
              <h3 className="font-bold text-foreground mb-4">Product Details</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Brand</span>
                  <span className="text-foreground font-medium">{product.brand}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quantity</span>
                  <span className="text-foreground font-medium">{product.quantity}</span>
                </div>
                {product.origin && (
                  <>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Origin</span>
                      <span className="text-foreground font-medium">{product.origin}</span>
                    </div>
                  </>
                )}
                {product.ingredients && (
                  <>
                    <Separator />
                    <div>
                      <span className="text-muted-foreground block mb-1">Ingredients</span>
                      <span className="text-foreground">{product.ingredients}</span>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="animate-fade-in">
            <h2 className="text-xl font-bold text-foreground mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
