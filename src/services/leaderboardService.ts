// src/services/leaderboardService.ts
import { supabase } from '../lib/supabase';

interface LeaderboardEntry {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  score: number; // Generic score, could be points or completions
  rank?: number;
}

export const fetchGlobalLeaderboard = async (
  metric: 'total_points' | 'total_hunts_completed' = 'total_points',
  limit: number = 10
): Promise<LeaderboardEntry[]> => {
  // Assuming user_profiles has total_points and total_hunts_completed
  const { data, error } = await supabase
    .from('user_profiles') // Or your specific leaderboard view name
    .select('id, display_name, avatar_url, total_points, total_hunts_completed')
    .order(metric, { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching global leaderboard:', error);
    throw error;
  }
  return (data || []).map((entry, index) => ({
    user_id: entry.id,
    display_name: entry.display_name,
    avatar_url: entry.avatar_url,
    score:
      metric === 'total_points'
        ? entry.total_points
        : entry.total_hunts_completed,
    rank: index + 1,
  }));
};
