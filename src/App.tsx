import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useParams, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import Index from "./pages/Index";
import Cart from "./pages/Cart";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import Orders from "./pages/Orders";
import ProductDetail from "./pages/ProductDetail";
import SearchResults from "./pages/SearchResults";
import Category from "./pages/Category";
import Wishlist from "./pages/Wishlist";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

// Admin imports
import { AdminLayout } from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminBanners from "./pages/admin/AdminBanners";
import AdminSettings from "./pages/admin/AdminSettings";

// Wrapper to force remount on product ID change for proper history handling
const ProductDetailWrapper = () => {
  const { id } = useParams<{ id: string }>();
  return <ProductDetail key={id} />;
};
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/product/:id" element={<ProductDetailWrapper />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/category/:categoryId" element={<Category />} />
                <Route path="/wishlist" element={<Wishlist />} />
                
                {/* Admin Routes - redirect /admin/login to /auth */}
                <Route path="/admin/login" element={<Navigate to="/auth" replace />} />
                <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
                <Route path="/admin/products" element={<AdminLayout><AdminProducts /></AdminLayout>} />
                <Route path="/admin/categories" element={<AdminLayout><AdminCategories /></AdminLayout>} />
                <Route path="/admin/orders" element={<AdminLayout><AdminOrders /></AdminLayout>} />
                <Route path="/admin/users" element={<AdminLayout><AdminUsers /></AdminLayout>} />
                <Route path="/admin/banners" element={<AdminLayout><AdminBanners /></AdminLayout>} />
                <Route path="/admin/settings" element={<AdminLayout><AdminSettings /></AdminLayout>} />
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
