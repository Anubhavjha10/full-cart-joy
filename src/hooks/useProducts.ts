import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type AdminProduct = Tables<'admin_products'>;

export interface ProductWithCategory extends AdminProduct {
  category?: Tables<'categories'> | null;
}

// Fetch all active products
export const useProducts = () => {
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('admin_products')
          .select(`
            *,
            category:categories(*)
          `)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProducts(data || []);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch products'));
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, loading, error };
};

// Fetch featured products
export const useFeaturedProducts = () => {
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('admin_products')
          .select(`
            *,
            category:categories(*)
          `)
          .eq('is_active', true)
          .eq('is_featured', true)
          .order('created_at', { ascending: false })
          .limit(12);

        if (error) throw error;
        setProducts(data || []);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch featured products'));
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, loading, error };
};

// Fetch products by category slug
export const useProductsByCategory = (categorySlug: string | undefined) => {
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [category, setCategory] = useState<Tables<'categories'> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!categorySlug) {
      setLoading(false);
      return;
    }

    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // First, find the category by slug
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('*')
          .eq('slug', categorySlug)
          .eq('is_active', true)
          .maybeSingle();

        if (categoryError) throw categoryError;
        
        setCategory(categoryData);

        if (categoryData) {
          // Fetch products for this category
          const { data: productsData, error: productsError } = await supabase
            .from('admin_products')
            .select(`
              *,
              category:categories(*)
            `)
            .eq('category_id', categoryData.id)
            .eq('is_active', true)
            .order('created_at', { ascending: false });

          if (productsError) throw productsError;
          setProducts(productsData || []);
        } else {
          setProducts([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch products'));
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categorySlug]);

  return { products, category, loading, error };
};

// Fetch single product by slug or ID
export const useProduct = (idOrSlug: string | undefined) => {
  const [product, setProduct] = useState<ProductWithCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!idOrSlug) {
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        
        // Try to fetch by slug first, then by id
        let query = supabase
          .from('admin_products')
          .select(`
            *,
            category:categories(*)
          `)
          .eq('is_active', true);

        // Check if it's a UUID
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
        
        if (isUUID) {
          query = query.eq('id', idOrSlug);
        } else {
          query = query.eq('slug', idOrSlug);
        }

        const { data, error } = await query.maybeSingle();

        if (error) throw error;
        setProduct(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch product'));
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [idOrSlug]);

  return { product, loading, error };
};

// Fetch related products (same category)
export const useRelatedProducts = (product: ProductWithCategory | null, limit = 6) => {
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!product?.category_id) {
      setProducts([]);
      setLoading(false);
      return;
    }

    const fetchRelated = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('admin_products')
          .select(`
            *,
            category:categories(*)
          `)
          .eq('category_id', product.category_id)
          .eq('is_active', true)
          .neq('id', product.id)
          .limit(limit);

        if (error) throw error;
        setProducts(data || []);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRelated();
  }, [product?.id, product?.category_id, limit]);

  return { products, loading };
};

// Search products
export const useSearchProducts = (query: string) => {
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setProducts([]);
      setLoading(false);
      return;
    }

    const fetchProducts = async () => {
      try {
        setLoading(true);
        const searchTerm = `%${query}%`;
        
        const { data, error } = await supabase
          .from('admin_products')
          .select(`
            *,
            category:categories(*)
          `)
          .eq('is_active', true)
          .or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProducts(data || []);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to search products'));
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchProducts, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  return { products, loading, error };
};

// Fetch products grouped by category for homepage
export const useProductsByCategories = () => {
  const [data, setData] = useState<Map<string, ProductWithCategory[]>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const { data: products, error } = await supabase
          .from('admin_products')
          .select(`
            *,
            category:categories(*)
          `)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Group by category
        const grouped = new Map<string, ProductWithCategory[]>();
        products?.forEach(product => {
          const categoryName = product.category?.name || 'Other';
          if (!grouped.has(categoryName)) {
            grouped.set(categoryName, []);
          }
          grouped.get(categoryName)!.push(product);
        });

        setData(grouped);
      } catch {
        setData(new Map());
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading };
};
