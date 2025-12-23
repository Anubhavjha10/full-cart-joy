import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, User, Home, Package, Heart, Info, Phone, HelpCircle, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Separator } from '@/components/ui/separator';

const MobileNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { totalItems } = useCart();

  const closeMenu = () => setIsOpen(false);

  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/cart', label: 'Cart', icon: ShoppingCart, badge: totalItems },
    { to: '/wishlist', label: 'Wishlist', icon: Heart },
    { to: '/orders', label: 'My Orders', icon: Package },
  ];

  const infoLinks = [
    { to: '/about', label: 'About Us', icon: Info },
    { to: '/contact', label: 'Contact', icon: Phone },
    { to: '/faq', label: 'FAQs', icon: HelpCircle },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-lg">
      <div className="flex items-center justify-between px-4 py-2">
        {/* Menu Button */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0">
            <SheetHeader className="p-4 border-b border-border">
              <SheetTitle className="text-left text-primary">SPG Para Military Canteen</SheetTitle>
            </SheetHeader>
            
            <nav className="flex flex-col p-4 gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={closeMenu}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <link.icon className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">{link.label}</span>
                  {link.badge && link.badge > 0 && (
                    <span className="ml-auto bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                      {link.badge}
                    </span>
                  )}
                </Link>
              ))}
              
              <Separator className="my-2" />
              
              {infoLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={closeMenu}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <link.icon className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">{link.label}</span>
                </Link>
              ))}
              
              <Separator className="my-2" />
              
              {user ? (
                <>
                  <Link
                    to="/profile"
                    onClick={closeMenu}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <User className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">My Profile</span>
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      closeMenu();
                    }}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-muted transition-colors text-destructive w-full text-left"
                  >
                    <X className="h-5 w-5" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  onClick={closeMenu}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <User className="h-5 w-5" />
                  <span className="font-medium">Login / Sign Up</span>
                </Link>
              )}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Center - Home */}
        <Link to="/">
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <Home className="h-6 w-6" />
          </Button>
        </Link>

        {/* Cart Button */}
        <Link to="/cart" className="relative">
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <ShoppingCart className="h-6 w-6" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Button>
        </Link>

        {/* Account Button */}
        <Link to={user ? "/profile" : "/auth"}>
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <User className="h-6 w-6" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default MobileNavbar;
