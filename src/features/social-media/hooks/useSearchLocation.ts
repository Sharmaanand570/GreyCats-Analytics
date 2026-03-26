import { useState, useEffect, useRef } from 'react';
import { searchLocations } from '../api/scheduledPostsApi';
import type { LocationSearchResult } from '../api/types';

interface UseSearchLocationResult {
  query: string;
  setQuery: (q: string) => void;
  results: LocationSearchResult[];
  isSearching: boolean;
  error: string | null;
  clear: () => void;
}

/**
 * Debounced location search hook.
 * Calls GET /api/scheduled-posts/locations/search to find Meta Places.
 */
export const useSearchLocation = (
  metaAccountId: number | null,
  debounceMs = 500
): UseSearchLocationResult => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const trimmed = query.trim();

    if (!trimmed || trimmed.length < 2 || !metaAccountId) {
      setResults([]);
      setError(null);
      setIsSearching(false);
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);

    setIsSearching(true);
    setError(null);

    timerRef.current = setTimeout(async () => {
      try {
        const locations = await searchLocations(trimmed, metaAccountId);
        setResults(locations);
        setError(null);
      } catch (err: unknown) {
        setResults([]);
        setError(err instanceof Error ? err.message : 'Search failed');
      } finally {
        setIsSearching(false);
      }
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, metaAccountId, debounceMs]);

  const clear = () => {
    setQuery('');
    setResults([]);
    setError(null);
  };

  return { query, setQuery, results, isSearching, error, clear };
};
