import { Clock, AlertCircle } from 'lucide-react';
import { useStoreStatus } from '@/hooks/useStoreStatus';

export function StoreClosedBanner() {
  const { isOpen, message, loading } = useStoreStatus();

  if (loading || isOpen) return null;

  return (
    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
      <div className="h-10 w-10 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0">
        <Clock className="h-5 w-5 text-destructive" />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-destructive flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Store is Currently Closed
        </h3>
        <p className="text-sm text-muted-foreground mt-1">{message}</p>
      </div>
    </div>
  );
}
