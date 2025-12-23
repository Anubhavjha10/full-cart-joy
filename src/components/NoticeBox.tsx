import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Megaphone } from 'lucide-react';

const NoticeBox = () => {
  const { data: notice } = useQuery({
    queryKey: ['active-notice'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notices')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  if (!notice) return null;

  return (
    <div className="hidden md:flex bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex-col gap-2 min-h-[120px]">
      <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
        <Megaphone className="h-5 w-5" />
        <span className="font-semibold text-sm">Notice</span>
      </div>
      <div>
        <h3 className="font-bold text-foreground">{notice.title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{notice.content}</p>
      </div>
    </div>
  );
};

export default NoticeBox;
