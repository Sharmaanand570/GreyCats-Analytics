import { useState, useEffect, useRef } from 'react';
import { searchInstagramUser } from '../api/scheduledPostsApi';
import type { CollaboratorSearchResult } from '../api/types';

interface UseSearchCollaboratorResult {
  query: string;
  setQuery: (q: string) => void;
  result: CollaboratorSearchResult | null;
  isSearching: boolean;
  error: string | null;
  clearResult: () => void;
}

/**
 * Debounced collaborator search hook.
 * Calls the backend proxy to resolve the user's hidden Instagram numeric ID.
 */
export const useSearchCollaborator = (
  metaAccountId: number | null,
  debounceMs = 600
): UseSearchCollaboratorResult => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<CollaboratorSearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const trimmed = query.trim().replace(/^@/, '');

    if (!trimmed || !metaAccountId) {
      setResult(null);
      setError(null);
      setIsSearching(false);
      return;
    }

    if (abortRef.current) clearTimeout(abortRef.current);

    setIsSearching(true);
    setError(null);

    abortRef.current = setTimeout(async () => {
      try {
        const user = await searchInstagramUser(trimmed, metaAccountId);
        setResult(user);
        setError(null);
      } catch (err: unknown) {
        setResult(null);
        setError(err instanceof Error ? err.message : 'User not found');
      } finally {
        setIsSearching(false);
      }
    }, debounceMs);

    return () => {
      if (abortRef.current) clearTimeout(abortRef.current);
    };
  }, [query, metaAccountId, debounceMs]);

  const clearResult = () => {
    setQuery('');
    setResult(null);
    setError(null);
  };

  return { query, setQuery, result, isSearching, error, clearResult };
};
