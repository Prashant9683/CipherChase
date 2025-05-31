import { useState, useEffect } from 'react';
import { fetchAchievements } from '../lib/supabase';

export const useAchievements = () => {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAchievements = async () => {
      try {
        const data = await fetchAchievements();
        setAchievements(data);
      } catch (err) {
        setError('Failed to load achievements');
        console.error('Error loading achievements:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAchievements();
  }, []);

  return { achievements, loading, error };
};