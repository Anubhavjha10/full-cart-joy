import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const SpecialOfferBox = () => {
  const { data: offer } = useQuery({
    queryKey: ['active-offer'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('special_offers')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  if (!offer) return null;

  return (
    <div className="hidden md:flex bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border border-red-200 dark:border-red-800 rounded-xl p-4 flex-col gap-2 min-h-[120px]">
      <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
        <Flame className="h-5 w-5" />
        <span className="font-semibold text-sm">Special Offer</span>
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-foreground">{offer.title}</h3>
        {offer.description && (
          <p className="text-sm text-muted-foreground mt-1">{offer.description}</p>
        )}
      </div>
      {offer.cta_link && offer.cta_text && (
        <Link to={offer.cta_link}>
          <Button size="sm" variant="destructive" className="w-fit">
            {offer.cta_text}
          </Button>
        </Link>
      )}
    </div>
  );
};

export default SpecialOfferBox;
