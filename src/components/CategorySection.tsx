import { Link } from 'react-router-dom';
import { 
  Milk, 
  Carrot, 
  Apple, 
  Cookie, 
  Coffee, 
  Croissant, 
  Wheat, 
  Fish,
  ShoppingBag
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface Category {
  id?: string;
  icon: string;
  label: string;
  slug?: string;
}

interface CategorySectionProps {
  categories: Category[];
  isLoading?: boolean;
}

const categoryConfig: Record<string, { 
  Icon: React.ElementType; 
  gradient: string;
  hoverGradient: string;
}> = {
  'dairy': { 
    Icon: Milk, 
    gradient: 'from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30',
    hoverGradient: 'group-hover:from-blue-100 group-hover:to-blue-200 dark:group-hover:from-blue-900/50 dark:group-hover:to-blue-800/40'
  },
  'vegetables': { 
    Icon: Carrot, 
    gradient: 'from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30',
    hoverGradient: 'group-hover:from-green-100 group-hover:to-green-200 dark:group-hover:from-green-900/50 dark:group-hover:to-green-800/40'
  },
  'fruits': { 
    Icon: Apple, 
    gradient: 'from-red-50 to-orange-100 dark:from-red-950/50 dark:to-orange-900/30',
    hoverGradient: 'group-hover:from-red-100 group-hover:to-orange-200 dark:group-hover:from-red-900/50 dark:group-hover:to-orange-800/40'
  },
  'snacks': { 
    Icon: Cookie, 
    gradient: 'from-amber-50 to-yellow-100 dark:from-amber-950/50 dark:to-yellow-900/30',
    hoverGradient: 'group-hover:from-amber-100 group-hover:to-yellow-200 dark:group-hover:from-amber-900/50 dark:group-hover:to-yellow-800/40'
  },
  'beverages': { 
    Icon: Coffee, 
    gradient: 'from-cyan-50 to-teal-100 dark:from-cyan-950/50 dark:to-teal-900/30',
    hoverGradient: 'group-hover:from-cyan-100 group-hover:to-teal-200 dark:group-hover:from-cyan-900/50 dark:group-hover:to-teal-800/40'
  },
  'bakery': { 
    Icon: Croissant, 
    gradient: 'from-orange-50 to-amber-100 dark:from-orange-950/50 dark:to-amber-900/30',
    hoverGradient: 'group-hover:from-orange-100 group-hover:to-amber-200 dark:group-hover:from-orange-900/50 dark:group-hover:to-amber-800/40'
  },
  'staples': { 
    Icon: Wheat, 
    gradient: 'from-yellow-50 to-lime-100 dark:from-yellow-950/50 dark:to-lime-900/30',
    hoverGradient: 'group-hover:from-yellow-100 group-hover:to-lime-200 dark:group-hover:from-yellow-900/50 dark:group-hover:to-lime-800/40'
  },
  'meat': { 
    Icon: Fish, 
    gradient: 'from-rose-50 to-pink-100 dark:from-rose-950/50 dark:to-pink-900/30',
    hoverGradient: 'group-hover:from-rose-100 group-hover:to-pink-200 dark:group-hover:from-rose-900/50 dark:group-hover:to-pink-800/40'
  },
  'fish': { 
    Icon: Fish, 
    gradient: 'from-rose-50 to-pink-100 dark:from-rose-950/50 dark:to-pink-900/30',
    hoverGradient: 'group-hover:from-rose-100 group-hover:to-pink-200 dark:group-hover:from-rose-900/50 dark:group-hover:to-pink-800/40'
  },
};

const getConfigForCategory = (slug: string) => {
  const normalizedSlug = slug.toLowerCase().replace(/[-\s]+/g, '');
  
  for (const [key, config] of Object.entries(categoryConfig)) {
    if (normalizedSlug.includes(key)) {
      return config;
    }
  }
  
  return { 
    Icon: ShoppingBag, 
    gradient: 'from-gray-50 to-gray-100 dark:from-gray-950/50 dark:to-gray-900/30',
    hoverGradient: 'group-hover:from-gray-100 group-hover:to-gray-200'
  };
};

const CategorySkeleton = () => (
  <div className="flex flex-col items-center justify-center p-4 md:p-5 rounded-xl border border-border/50 bg-muted/30">
    <div className="relative mb-3">
      <Skeleton className="w-12 h-12 md:w-14 md:h-14 rounded-full" />
    </div>
    <Skeleton className="h-4 w-16 md:w-20" />
  </div>
);

const CategorySection = ({ categories, isLoading = false }: CategorySectionProps) => {
  return (
    <section className="mt-10">
      {/* Section Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Shop by Category</h2>
        <p className="text-muted-foreground text-sm">
          Explore our wide range of products across different categories
        </p>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 md:gap-4">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, index) => (
            <CategorySkeleton key={index} />
          ))
        ) : categories.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            No categories available. Add categories from the Admin Panel.
          </div>
        ) : (
          categories.map((cat) => {
            const slug = cat.slug || cat.label.toLowerCase().replace(/\s+/g, '-');
            const config = getConfigForCategory(slug);
            const { Icon, gradient, hoverGradient } = config;
            const href = `/category/${slug}`;

            return (
              <Link
                key={cat.id || cat.label}
                to={href}
                className="group"
              >
                <div
                  className={cn(
                    "relative flex flex-col items-center justify-center p-4 md:p-5 rounded-xl",
                    "bg-gradient-to-br transition-all duration-300 ease-out",
                    "border border-border/50 hover:border-primary/30",
                    "hover:shadow-lg hover:shadow-primary/5",
                    "hover:-translate-y-1",
                    gradient,
                    hoverGradient
                  )}
                >
                  {/* Icon Container */}
                  <div className="relative mb-3">
                    <div className={cn(
                      "w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center",
                      "bg-card shadow-sm",
                      "group-hover:scale-110 group-hover:shadow-md",
                      "transition-all duration-300 ease-out"
                    )}>
                      <Icon className="w-6 h-6 md:w-7 md:h-7 text-primary transition-transform duration-300 group-hover:scale-110" />
                    </div>
                    
                    {/* Decorative ring on hover */}
                    <div className={cn(
                      "absolute inset-0 rounded-full border-2 border-primary/0",
                      "group-hover:border-primary/20 group-hover:scale-125",
                      "transition-all duration-300 ease-out"
                    )} />
                  </div>

                  {/* Label */}
                  <span className={cn(
                    "text-xs md:text-sm font-medium text-foreground text-center",
                    "transition-colors duration-300",
                    "group-hover:text-primary"
                  )}>
                    {cat.label}
                  </span>

                  {/* Emoji fallback for visual interest */}
                  <span className="absolute top-2 right-2 text-lg opacity-50 group-hover:opacity-80 transition-opacity duration-300">
                    {cat.icon}
                  </span>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </section>
  );
};

export default CategorySection;
