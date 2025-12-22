import { Check, Clock, Package, Truck, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderTimelineProps {
  status: string;
  createdAt: string;
}

const statusSteps = [
  { key: 'pending', label: 'Order Placed', icon: Clock },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: Home },
];

const OrderTimeline = ({ status, createdAt }: OrderTimelineProps) => {
  const currentStepIndex = statusSteps.findIndex((step) => step.key === status);
  const isDelivered = status === 'delivered';
  const isCancelled = status === 'cancelled';

  if (isCancelled) {
    return (
      <div className="py-4">
        <div className="flex items-center gap-3 text-destructive">
          <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
            <span className="text-lg">✕</span>
          </div>
          <div>
            <p className="font-medium">Order Cancelled</p>
            <p className="text-sm text-muted-foreground">This order has been cancelled</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-border" />
        <div
          className="absolute left-5 top-5 w-0.5 bg-primary transition-all duration-500"
          style={{
            height: `calc(${Math.max(0, currentStepIndex) / (statusSteps.length - 1)} * (100% - 40px))`,
          }}
        />

        {/* Steps */}
        <div className="space-y-6">
          {statusSteps.map((step, index) => {
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const Icon = step.icon;

            return (
              <div key={step.key} className="relative flex items-start gap-4">
                {/* Icon Circle */}
                <div
                  className={cn(
                    'relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300',
                    isCompleted
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {isCompleted && !isCurrent ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pt-1.5">
                  <p
                    className={cn(
                      'font-medium',
                      isCompleted ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {step.label}
                  </p>
                  {isCurrent && (
                    <p className="text-sm text-primary mt-0.5">
                      {isDelivered ? 'Completed' : 'In Progress'}
                    </p>
                  )}
                  {index === 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrderTimeline;
