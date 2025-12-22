import { Button } from '@/components/ui/button';

interface PromoCategoryCardProps {
  title: string;
  subtitle: string;
  variant: 'cyan' | 'amber' | 'violet';
  onClick?: () => void;
}

const PromoCategoryCard = ({ title, subtitle, variant, onClick }: PromoCategoryCardProps) => {
  const bgClasses = {
    cyan: 'bg-cyan',
    amber: 'bg-amber',
    violet: 'bg-violet',
  };

  return (
    <div
      className={`${bgClasses[variant]} rounded-xl p-6 text-card min-h-[200px] flex flex-col justify-between animate-scale-in`}
    >
      <div>
        <h3 className="text-2xl font-bold mb-2">{title}</h3>
        <p className="text-sm opacity-90">{subtitle}</p>
      </div>
      <Button
        onClick={onClick}
        className="bg-foreground hover:bg-foreground/90 text-card w-fit mt-4"
      >
        Order Now
      </Button>
    </div>
  );
};

export default PromoCategoryCard;
