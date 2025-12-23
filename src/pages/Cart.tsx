import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, MapPin, AlertCircle, Check, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useStoreStatus } from '@/hooks/useStoreStatus';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { StoreClosedBanner } from '@/components/StoreClosedBanner';
import { z } from 'zod';

interface SavedAddress {
  id: string;
  label: string;
  address_line: string;
  city: string | null;
  pincode: string | null;
  is_default: boolean;
}

interface Profile {
  phone: string | null;
  full_name: string | null;
}

const phoneSchema = z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit phone number');

const Cart = () => {
  const { items, updateQuantity, removeFromCart, clearCart, totalPrice, placeOrder } = useCart();
  const { user } = useAuth();
  const { isOpen: storeIsOpen, message: storeClosedMessage } = useStoreStatus();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showPhoneDialog, setShowPhoneDialog] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [savingPhone, setSavingPhone] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSavedAddresses();
      fetchProfile();
    }
  }, [user]);

  const fetchSavedAddresses = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_addresses')
        .select('*')
        .eq('user_id', user!.id)
        .order('is_default', { ascending: false });

      if (error) throw error;
      setSavedAddresses(data || []);
      
      // Auto-select default address
      const defaultAddr = data?.find((a) => a.is_default);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
        setDeliveryAddress(formatAddress(defaultAddr));
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('phone, full_name')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const formatAddress = (addr: SavedAddress) => {
    let formatted = addr.address_line;
    if (addr.city) formatted += `, ${addr.city}`;
    if (addr.pincode) formatted += ` - ${addr.pincode}`;
    return formatted;
  };

  const handleAddressSelect = (addr: SavedAddress) => {
    setSelectedAddressId(addr.id);
    setDeliveryAddress(formatAddress(addr));
    setUseNewAddress(false);
  };

  const handleNewAddressToggle = () => {
    setUseNewAddress(true);
    setSelectedAddressId(null);
    setDeliveryAddress('');
  };

  const savePhone = async () => {
    const result = phoneSchema.safeParse(phoneInput);
    if (!result.success) {
      setPhoneError(result.error.errors[0].message);
      return;
    }
    setPhoneError('');
    setSavingPhone(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ phone: phoneInput })
        .eq('user_id', user!.id);

      if (error) throw error;
      setProfile((prev) => prev ? { ...prev, phone: phoneInput } : { phone: phoneInput, full_name: null });
      setShowPhoneDialog(false);
      toast.success('Phone number saved');
    } catch (error) {
      console.error('Error saving phone:', error);
      toast.error('Failed to save phone number');
    } finally {
      setSavingPhone(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Check if store is open
    if (!storeIsOpen) {
      toast.error('Store is currently closed. Please try again during store hours.');
      return;
    }

    // Check if phone number is set
    if (!profile?.phone) {
      setShowPhoneDialog(true);
      return;
    }

    if (!deliveryAddress.trim()) {
      toast.error('Please select or enter a delivery address');
      return;
    }

    setIsPlacingOrder(true);
    const success = await placeOrder(deliveryAddress);
    setIsPlacingOrder(false);

    if (success) {
      navigate('/orders');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <main className="container mx-auto px-4 py-12">
          <div className="text-center py-16">
            <ShoppingCart className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h1>
            <p className="text-muted-foreground mb-6">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Link to="/">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Start Shopping
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
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-primary hover:underline mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Continue Shopping
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-foreground">My Cart ({items.length})</h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCart}
                className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            </div>

            <div className="space-y-4">
              {items.map((item) => (
                <Card
                  key={item.id}
                  className="p-4 flex gap-4 items-center animate-fade-in"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />

                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.quantity}</p>
                    <p className="font-bold text-foreground mt-1">₹{item.price}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => updateQuantity(item.id, item.count - 1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-semibold">{item.count}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => updateQuantity(item.id, item.count + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeFromCart(item.id)}
                    className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </Card>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h2 className="text-lg font-bold text-foreground mb-4">Order Summary</h2>

              <div className="space-y-3 border-b border-border pb-4 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">₹{totalPrice}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span className="text-primary font-medium">FREE</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Taxes</span>
                  <span className="text-foreground">Included</span>
                </div>
              </div>

              <div className="flex justify-between font-bold text-lg mb-4">
                <span className="text-foreground">Total</span>
                <span className="text-foreground">₹{totalPrice}</span>
              </div>

              {user ? (
                <div className="space-y-4">
                  {/* Store closed warning */}
                  {!storeIsOpen && (
                    <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <Clock className="h-4 w-4 text-destructive mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-destructive">Store is closed</p>
                        <p className="text-muted-foreground">{storeClosedMessage}</p>
                      </div>
                    </div>
                  )}

                  {/* Profile completion warning */}
                  {!profile?.phone && storeIsOpen && (
                    <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                      <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-amber-600">Phone number required</p>
                        <p className="text-muted-foreground">Add your phone number to place orders</p>
                      </div>
                    </div>
                  )}

                  {/* Delivery Address Section */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Delivery Address
                    </label>

                    {/* Saved Addresses */}
                    {savedAddresses.length > 0 && (
                      <div className="space-y-2 mb-3">
                        {savedAddresses.map((addr) => (
                          <button
                            key={addr.id}
                            onClick={() => handleAddressSelect(addr)}
                            className={`w-full text-left p-3 rounded-lg border transition-colors ${
                              selectedAddressId === addr.id
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-foreground text-sm">{addr.label}</span>
                                {addr.is_default && (
                                  <Badge variant="secondary" className="text-xs">Default</Badge>
                                )}
                              </div>
                              {selectedAddressId === addr.id && (
                                <Check className="h-4 w-4 text-primary" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                              {formatAddress(addr)}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* New Address Option */}
                    <button
                      onClick={handleNewAddressToggle}
                      className={`w-full text-left p-3 rounded-lg border transition-colors mb-2 ${
                        useNewAddress
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">
                          + Enter new address
                        </span>
                        {useNewAddress && <Check className="h-4 w-4 text-primary" />}
                      </div>
                    </button>

                    {useNewAddress && (
                      <Input
                        placeholder="Enter your delivery address"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="mt-2"
                      />
                    )}

                    {savedAddresses.length === 0 && !useNewAddress && (
                      <Input
                        placeholder="Enter your delivery address"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                      />
                    )}
                  </div>

                  <Button
                    onClick={handlePlaceOrder}
                    disabled={isPlacingOrder || !deliveryAddress.trim() || !storeIsOpen}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 disabled:opacity-50"
                  >
                    {!storeIsOpen ? 'Store Closed' : isPlacingOrder ? 'Placing Order...' : 'Place Order'}
                  </Button>
                </div>
              ) : (
                <Link to="/auth">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6">
                    Login to Checkout
                  </Button>
                </Link>
              )}

              <p className="text-xs text-muted-foreground text-center mt-4">
                Delivery within 13 minutes
              </p>
            </Card>
          </div>
        </div>
      </main>

      {/* Phone Number Dialog */}
      <Dialog open={showPhoneDialog} onOpenChange={setShowPhoneDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Phone Number</DialogTitle>
            <DialogDescription>
              Please add your phone number to place orders. This is required for delivery updates.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium">Phone Number</label>
              <Input
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="Enter 10-digit phone number"
                maxLength={10}
                className="mt-1"
              />
              {phoneError && (
                <p className="text-sm text-destructive mt-1">{phoneError}</p>
              )}
            </div>
            <Button className="w-full" onClick={savePhone} disabled={savingPhone}>
              {savingPhone ? 'Saving...' : 'Save & Continue'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Cart;
