import { Link, useNavigate } from 'react-router-dom';
import { User, ShoppingCart, LogOut, Package, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/contexts/WishlistContext';
import SearchAutocomplete from '@/components/SearchAutocomplete';
import NotificationBell from '@/components/NotificationBell';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const Header = ({ searchQuery, onSearchChange }: HeaderProps) => {
  const { totalItems } = useCart();
  const { user, signOut } = useAuth();
  const { items: wishlistItems } = useWishlist();
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/search');
    }
  };


  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <div className="flex flex-col">
              <span className="text-xl font-bold text-primary">SPG Para Military</span>
              <span className="text-sm text-muted-foreground">Canteen</span>
            </div>
          </Link>

          {/* Search Bar */}
          <SearchAutocomplete
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            onSubmit={handleSearchSubmit}
            className="flex-1 max-w-xl hidden md:block"
          />

          {/* Actions */}
          <div className="flex items-center gap-2">
            {user && <NotificationBell />}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline max-w-[100px] truncate">
                      {user.user_metadata?.full_name || user.email?.split('@')[0]}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                      <User className="h-4 w-4" />
                      My Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/wishlist" className="flex items-center gap-2 cursor-pointer">
                      <Heart className="h-4 w-4" />
                      My Wishlist
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/orders" className="flex items-center gap-2 cursor-pointer">
                      <Package className="h-4 w-4" />
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut()}
                    className="flex items-center gap-2 text-destructive cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="outline" className="gap-2 hidden sm:flex">
                  <User className="h-4 w-4" />
                  Login
                </Button>
              </Link>
            )}
            <Link to="/cart">
              <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden sm:inline">My Cart</span>
                {totalItems > 0 && (
                  <span className="bg-primary-foreground text-primary text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px]">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Search */}
        <SearchAutocomplete
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onSubmit={handleSearchSubmit}
          className="mt-3 md:hidden"
        />
      </div>
    </header>
  );
};

export default Header;
