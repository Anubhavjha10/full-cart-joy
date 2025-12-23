import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface ProductSuggestion {
  id: string;
  name: string;
  slug: string;
  price: number;
  image_url: string | null;
  category_name?: string;
}

const SEARCH_HISTORY_KEY = 'search_history';
const MAX_HISTORY_ITEMS = 5;

const getSearchHistory = (): string[] => {
  try {
    const history = localStorage.getItem(SEARCH_HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch {
    return [];
  }
};

const saveSearchHistory = (query: string) => {
  if (!query.trim()) return;
  const history = getSearchHistory();
  const filtered = history.filter((item) => item.toLowerCase() !== query.toLowerCase());
  const updated = [query, ...filtered].slice(0, MAX_HISTORY_ITEMS);
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
};

const removeFromHistory = (query: string) => {
  const history = getSearchHistory();
  const updated = history.filter((item) => item.toLowerCase() !== query.toLowerCase());
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
};

interface SearchAutocompleteProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  className?: string;
  placeholder?: string;
}

const SearchAutocomplete = ({
  searchQuery,
  onSearchChange,
  onSubmit,
  className,
  placeholder = 'Search "groceries"',
}: SearchAutocompleteProps) => {
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSearchHistory(getSearchHistory());
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const fetchSuggestions = async () => {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from('admin_products')
            .select(`
              id,
              name,
              slug,
              price,
              image_url,
              category:categories(name)
            `)
            .eq('is_active', true)
            .ilike('name', `%${searchQuery}%`)
            .limit(6);

          if (error) throw error;

          const mapped = (data || []).map(p => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            price: p.price,
            image_url: p.image_url,
            category_name: p.category?.name,
          }));

          setSuggestions(mapped);
          setIsOpen(mapped.length > 0);
          setShowHistory(false);
        } catch {
          setSuggestions([]);
          setIsOpen(false);
        } finally {
          setLoading(false);
        }
      };

      const debounce = setTimeout(fetchSuggestions, 300);
      return () => clearTimeout(debounce);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
    setSelectedIndex(-1);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowHistory(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalItems = showHistory ? searchHistory.length : suggestions.length;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen && !showHistory) {
      if (e.key === 'Enter') {
        saveSearchHistory(searchQuery);
        onSubmit(e);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (showHistory && selectedIndex >= 0 && selectedIndex < searchHistory.length) {
          handleHistoryClick(searchHistory[selectedIndex]);
        } else if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else {
          setIsOpen(false);
          setShowHistory(false);
          saveSearchHistory(searchQuery);
          onSubmit(e);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setShowHistory(false);
        break;
    }
  };

  const handleSuggestionClick = (product: ProductSuggestion) => {
    setIsOpen(false);
    setShowHistory(false);
    saveSearchHistory(product.name);
    navigate(`/product/${product.slug}`);
  };

  const handleHistoryClick = (query: string) => {
    onSearchChange(query);
    setShowHistory(false);
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleRemoveHistory = (e: React.MouseEvent, query: string) => {
    e.stopPropagation();
    removeFromHistory(query);
    setSearchHistory(getSearchHistory());
  };

  const handleFocus = () => {
    if (searchQuery.trim().length < 2 && searchHistory.length > 0) {
      setShowHistory(true);
      setSelectedIndex(-1);
    } else if (searchQuery.trim().length >= 2 && suggestions.length > 0) {
      setIsOpen(true);
    }
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="font-semibold text-primary">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 pl-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          autoComplete="off"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Search History Dropdown */}
      {showHistory && searchHistory.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="px-4 py-2 border-b border-border">
            <span className="text-xs font-medium text-muted-foreground">Recent Searches</span>
          </div>
          {searchHistory.map((query, index) => (
            <button
              key={query}
              onClick={() => handleHistoryClick(query)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                'hover:bg-accent',
                selectedIndex === index && 'bg-accent'
              )}
            >
              <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="flex-1 text-sm truncate">{query}</span>
              <button
                onClick={(e) => handleRemoveHistory(e, query)}
                className="p-1 hover:bg-muted rounded-full transition-colors"
                aria-label="Remove from history"
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
            </button>
          ))}
        </div>
      )}

      {/* Product Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          {suggestions.map((product, index) => (
            <button
              key={product.id}
              onClick={() => handleSuggestionClick(product)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                'hover:bg-accent',
                selectedIndex === index && 'bg-accent'
              )}
            >
              <img
                src={product.image_url || '/placeholder.svg'}
                alt={product.name}
                className="w-10 h-10 rounded-md object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {highlightMatch(product.name, searchQuery)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {product.category_name} • ₹{product.price}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchAutocomplete;
