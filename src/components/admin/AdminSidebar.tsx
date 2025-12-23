import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Image, 
  Settings,
  LogOut,
  FolderTree,
  Megaphone,
  Flame,
  Upload,
  Warehouse
} from 'lucide-react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAdminNotifications } from '@/contexts/AdminNotificationContext';
import { useEffect } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';

const menuItems = [
  { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
  { title: 'Products', url: '/admin/products', icon: Package },
  { title: 'Inventory', url: '/admin/inventory', icon: Warehouse },
  { title: 'Bulk Import', url: '/admin/bulk-import', icon: Upload },
  { title: 'Categories', url: '/admin/categories', icon: FolderTree },
  { title: 'Orders', url: '/admin/orders', icon: ShoppingCart, showBadge: true },
  { title: 'Users', url: '/admin/users', icon: Users },
  { title: 'Banners', url: '/admin/banners', icon: Image },
  { title: 'Notices', url: '/admin/notices', icon: Megaphone },
  { title: 'Offers', url: '/admin/offers', icon: Flame },
  { title: 'Settings', url: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { unseenOrderCount, markOrdersSeen } = useAdminNotifications();

  // Mark orders as seen when visiting the orders page
  useEffect(() => {
    if (location.pathname === '/admin/orders') {
      markOrdersSeen();
    }
  }, [location.pathname, markOrdersSeen]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">A</span>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sidebar-foreground">Admin Panel</span>
            <span className="text-xs text-muted-foreground">Management</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/admin'}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                          isActive
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                            : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                        )
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="flex-1">{item.title}</span>
                      {item.showBadge && unseenOrderCount > 0 && (
                        <Badge 
                          variant="destructive" 
                          className="h-5 min-w-[20px] px-1.5 text-xs font-bold animate-pulse"
                        >
                          {unseenOrderCount > 99 ? '99+' : unseenOrderCount}
                        </Badge>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
