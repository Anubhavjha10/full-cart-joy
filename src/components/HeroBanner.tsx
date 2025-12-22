import { Button } from '@/components/ui/button';

const HeroBanner = () => {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-8 md:p-12 min-h-[280px] flex flex-col justify-center animate-fade-in">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-foreground rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-foreground rounded-full blur-2xl transform -translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative z-10">
        <p className="text-sm md:text-base opacity-80 mb-2">Paan Corner</p>
        <p className="text-xs md:text-sm opacity-70 mb-4">Your favourite paan shop is now online</p>
        
        <h1 className="text-3xl md:text-5xl font-bold mb-2">Military Supplies</h1>
        <p className="text-lg md:text-xl opacity-90 mb-6">Quality products for our defense personnel</p>
        
        <Button className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold">
          Shop Now
        </Button>
      </div>

      {/* Decorative Cards Preview */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden lg:flex gap-3 opacity-60">
        <div className="bg-primary-foreground/20 backdrop-blur-sm rounded-lg p-4 w-40">
          <p className="font-semibold text-sm">Pharmacy at your doorstep!</p>
          <p className="text-xs opacity-80 mt-1">Pain relief, sprays & more</p>
        </div>
        <div className="bg-primary-foreground/20 backdrop-blur-sm rounded-lg p-4 w-40">
          <p className="font-semibold text-sm">Pet Care supplies in minutes</p>
          <p className="text-xs opacity-80 mt-1">Food, treats, toys & more</p>
        </div>
        <div className="bg-primary-foreground/20 backdrop-blur-sm rounded-lg p-4 w-40">
          <p className="font-semibold text-sm">No time for a diaper run?</p>
          <p className="text-xs opacity-80 mt-1">Get baby care essentials</p>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
