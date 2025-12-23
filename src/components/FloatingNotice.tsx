import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, X, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

interface Notice {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export function FloatingNotice() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [localDismissed, setLocalDismissed] = useState<string[]>([]);

  // Load locally dismissed notices for non-logged in users
  useEffect(() => {
    const dismissed = localStorage.getItem('dismissed_notices');
    if (dismissed) {
      setLocalDismissed(JSON.parse(dismissed));
    }
  }, []);

  // Fetch active notice
  const { data: notice } = useQuery({
    queryKey: ['active-notice-floating'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notices')
        .select('id, title, content, created_at')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as Notice | null;
    },
  });

  // Check if user has viewed this notice
  const { data: hasViewed } = useQuery({
    queryKey: ['notice-viewed', notice?.id, user?.id],
    queryFn: async () => {
      if (!notice?.id || !user?.id) return false;

      const { data, error } = await supabase
        .from('notice_views')
        .select('id')
        .eq('notice_id', notice.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!notice?.id && !!user?.id,
  });

  // Mark notice as viewed
  const markViewedMutation = useMutation({
    mutationFn: async () => {
      if (!notice?.id || !user?.id) return;

      const { error } = await supabase
        .from('notice_views')
        .insert({
          notice_id: notice.id,
          user_id: user.id,
        });

      if (error && !error.message.includes('duplicate')) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notice-viewed'] });
    },
  });

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);

    if (notice) {
      if (user) {
        markViewedMutation.mutate();
      } else {
        // For non-logged in users, store in localStorage
        const newDismissed = [...localDismissed, notice.id];
        setLocalDismissed(newDismissed);
        localStorage.setItem('dismissed_notices', JSON.stringify(newDismissed));
      }
    }
  };

  // Check if notice should be shown
  const shouldShow = notice && (
    user 
      ? !hasViewed 
      : !localDismissed.includes(notice.id)
  );

  if (!shouldShow) return null;

  const NoticeContent = (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
        <Megaphone className="h-5 w-5" />
        <span className="font-medium">Important Notice</span>
      </div>
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <p className="text-muted-foreground whitespace-pre-wrap">{notice.content}</p>
      </div>
      <p className="text-xs text-muted-foreground">
        {new Date(notice.created_at).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })}
      </p>
    </div>
  );

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={handleOpen}
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 h-12 w-12 rounded-full bg-amber-500 hover:bg-amber-600 text-white shadow-lg flex items-center justify-center transition-all hover:scale-105 animate-bounce"
        style={{ animationDuration: '2s' }}
        aria-label="View notice"
      >
        <Bell className="h-5 w-5" />
        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-bold">
          1
        </span>
      </button>

      {/* Mobile: Bottom Sheet */}
      {isMobile ? (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent side="bottom" className="rounded-t-xl">
            <SheetHeader className="text-left">
              <SheetTitle>{notice.title}</SheetTitle>
            </SheetHeader>
            <div className="mt-4 pb-6">
              {NoticeContent}
              <Button onClick={handleClose} className="w-full mt-6">
                Got it
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        // Desktop: Dialog
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{notice.title}</DialogTitle>
            </DialogHeader>
            {NoticeContent}
            <Button onClick={handleClose} className="w-full mt-2">
              Got it
            </Button>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
