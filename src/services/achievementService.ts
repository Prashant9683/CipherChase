// src/services/achievementService.ts
import { supabase } from '../lib/supabase';
import { Achievement, UserAchievement } from '../types';

export const fetchAllAchievements = async (): Promise<Achievement[]> => {
  const { data, error } = await supabase.from('achievements').select('*');
  if (error) {
    console.error('Error fetching all achievements:', error);
    throw error;
  }
  return data || [];
};

export const fetchUserAchievements = async (
  userId: string
): Promise<Array<UserAchievement & { achievement: Achievement }>> => {
  const { data, error } = await supabase
    .from('user_achievements')
    .select(
      `
      *,
      achievement:achievement_id (*)
    `
    )
    .eq('user_id', userId)
    .order('achieved_at', { ascending: false });

  if (error) {
    console.error('Error fetching user achievements:', error);
    throw error;
  }
  return data || [];
};

// Call the Edge Function (client doesn't award directly)
export const triggerAchievementCheck = async (
  userId: string,
  actionType: string,
  actionDetails?: object
): Promise<{ newlyAwarded: Achievement[] }> => {
  const { data, error } = await supabase.functions.invoke(
    'checkAndAwardAchievements',
    {
      body: { userId, actionType, actionDetails },
    }
  );
  if (error) {
    console.error('Error triggering achievement check:', error);
    // Don't throw, as this is often a background process. Log and monitor.
    return { newlyAwarded: [] };
  }
  return data || { newlyAwarded: [] };
};
