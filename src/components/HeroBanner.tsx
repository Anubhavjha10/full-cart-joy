import { Button } from '@/components/ui/button';

const HeroBanner = () => {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-4 md:p-6 min-h-[140px] md:min-h-[180px] flex flex-col justify-center animate-fade-in">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-foreground rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary-foreground rounded-full blur-xl transform -translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative z-10">
        <p className="text-xs md:text-sm opacity-80 mb-1">SPG Para Military Canteen</p>
        
        <h1 className="text-xl md:text-3xl font-bold mb-1">Quality Military Supplies</h1>
        <p className="text-sm md:text-base opacity-90 mb-3">Trusted products for our defense personnel</p>
        
        <Button className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold text-sm h-9">
          Shop Now
        </Button>
      </div>
    </div>
  );
};

export default HeroBanner;
