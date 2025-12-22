import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ProductCard from './ProductCard';
import { Product } from '@/contexts/CartContext';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

interface FeaturedCarouselProps {
  title: string;
  products: Product[];
  icon?: 'star' | 'sparkles';
}

const FeaturedCarousel = ({ title, products, icon = 'star' }: FeaturedCarouselProps) => {
  if (products.length === 0) return null;

  const Icon = icon === 'star' ? Star : Sparkles;

  return (
    <section className="py-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="h-5 w-5 text-primary fill-primary" />
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
      </div>

      <Carousel
        opts={{
          align: 'start',
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {products.map((product) => (
            <CarouselItem
              key={product.id}
              className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 lg:basis-1/4"
            >
              <ProductCard product={product} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:flex -left-4" />
        <CarouselNext className="hidden sm:flex -right-4" />
      </Carousel>
    </section>
  );
};

export default FeaturedCarousel;