import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { TreasureHunt } from '../types';

export const useHunts = () => {
  const [hunts, setHunts] = useState<TreasureHunt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHunts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Simplified query that avoids the relationship issue
      const { data, error: supabaseError } = await supabase
        .from('hunts')
        .select(
          `
          *,
          puzzles_count,
          creator:creator_id(display_name)
        `
        )
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (supabaseError) {
        throw new Error(`Failed to fetch hunts: ${supabaseError.message}`);
      }

      setHunts(data as TreasureHunt[]);
    } catch (err) {
      console.error('Error in fetchHunts:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to load treasure hunts'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHunts();
  }, [fetchHunts]);

  return {
    hunts,
    loading,
    error,
    refetch: fetchHunts,
  };
};
