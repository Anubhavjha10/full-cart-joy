import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { AdminSidebar } from './AdminSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Loader2, Bell, BellOff, Volume2, VolumeX } from 'lucide-react';
import { AdminNotificationProvider, useAdminNotifications } from '@/contexts/AdminNotificationContext';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AdminLayoutProps {
  children: ReactNode;
}

function AdminHeader({ email }: { email: string }) {
  const { isMuted, toggleMute, requestPermission, hasPermission } = useAdminNotifications();

  return (
    <header className="h-14 border-b border-border flex items-center px-4 gap-4 bg-card">
      <SidebarTrigger />
      <div className="flex-1" />
      
      <TooltipProvider>
        <div className="flex items-center gap-2">
          {/* Mute toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className={isMuted ? 'text-muted-foreground' : 'text-foreground'}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isMuted ? 'Unmute notifications' : 'Mute notifications'}
            </TooltipContent>
          </Tooltip>

          {/* Browser notification toggle */}
          {!hasPermission && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={requestPermission}
                  className="text-muted-foreground"
                >
                  <Bell className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Enable browser notifications</TooltipContent>
            </Tooltip>
          )}
        </div>
      </TooltipProvider>

      <span className="text-sm text-muted-foreground">
        Welcome, {email}
      </span>
    </header>
  );
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { isAdmin, loading, user } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this area.</p>
          <a href="/" className="text-primary hover:underline">Go back to home</a>
        </div>
      </div>
    );
  }

  return (
    <AdminNotificationProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AdminSidebar />
          <div className="flex-1 flex flex-col">
            <AdminHeader email={user.email || ''} />
            <main className="flex-1 p-6 overflow-auto">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </AdminNotificationProvider>
  );
}
