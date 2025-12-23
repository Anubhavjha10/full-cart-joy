import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type Category = Tables<'categories'>;

// Default category icons mapping
const categoryIcons: Record<string, string> = {
  'dairy': '🥛',
  'dairy-eggs': '🥛',
  'vegetables': '🥦',
  'fruits': '🍎',
  'snacks': '🍪',
  'beverages': '🥤',
  'bakery': '🍞',
  'staples': '🌾',
  'meat': '🥩',
  'fish': '🐟',
  'groceries': '🛒',
  'fresh-produce': '🥬',
  'frozen': '🧊',
  'breakfast': '🥣',
  'default': '📦',
};

export const getCategoryIcon = (slug: string): string => {
  const normalizedSlug = slug.toLowerCase().replace(/\s+/g, '-');
  
  for (const [key, icon] of Object.entries(categoryIcons)) {
    if (normalizedSlug.includes(key)) {
      return icon;
    }
  }
  
  return categoryIcons.default;
};

// Fetch all active categories
export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (error) throw error;
        setCategories(data || []);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch categories'));
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Transform categories to have icon and label for backward compatibility
  const categoriesWithIcons = categories.map(cat => ({
    ...cat,
    icon: getCategoryIcon(cat.slug),
    label: cat.name,
  }));

  return { categories: categoriesWithIcons, loading, error };
};

// Fetch single category by slug
export const useCategory = (slug: string | undefined) => {
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    const fetchCategory = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('slug', slug)
          .eq('is_active', true)
          .maybeSingle();

        if (error) throw error;
        setCategory(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch category'));
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [slug]);

  return { category, loading, error };
};
