// src/services/userProgressService.ts
import { supabase } from '../lib/supabase'; // Your Supabase client instance
import { UserHuntProgress } from '../types'; // Your UserHuntProgress type definition

/**
 * Fetches the existing hunt progress for a given user and hunt.
 * @param userId - The ID of the user.
 * @param huntId - The ID of the hunt.
 * @returns A Promise that resolves to the UserHuntProgress object or null if not found.
 */
export const getUserHuntProgress = async (
  userId: string,
  huntId: string
): Promise<UserHuntProgress | null> => {
  if (!userId || !huntId) {
    console.warn('getUserHuntProgress called with invalid userId or huntId');
    return null;
  }

  const { data, error } = await supabase
    .from('user_hunt_progress') // Your user_hunt_progress table name
    .select('*')
    .eq('user_id', userId)
    .eq('hunt_id', huntId)
    .single(); // Expecting at most one progress record per user per hunt

  if (error && error.code !== 'PGRST116') {
    // PGRST116 means "No rows found", which is valid
    console.error('Error fetching user hunt progress:', error.message);
    throw error; // Re-throw other errors
  }

  return data as UserHuntProgress | null;
};

/**
 * Creates a new hunt progress record or updates an existing one for a user.
 * This function uses upsert to simplify creation/update logic.
 * @param progressData - An object containing the progress data. Must include user_id and hunt_id.
 *                       Can include other fields like current_story_node_id, status, story_state, etc.
 * @returns A Promise that resolves to the created or updated UserHuntProgress object.
 */
export const createOrUpdateUserHuntProgress = async (
  progressData: Partial<UserHuntProgress> & { user_id: string; hunt_id: string }
): Promise<UserHuntProgress> => {
  if (!progressData.user_id || !progressData.hunt_id) {
    throw new Error(
      'user_id and hunt_id are required to create or update progress.'
    );
  }

  // Ensure last_played_at is always updated
  const dataToUpsert = {
    ...progressData,
    last_played_at: new Date().toISOString(),
  };

  // If it's a new record (no 'id' provided), set 'started_at'
  if (!progressData.id && !progressData.started_at) {
    dataToUpsert.started_at = new Date().toISOString();
  }
  // Ensure default values for new records if not provided
  if (!progressData.id) {
    dataToUpsert.status = progressData.status || 'started';
    dataToUpsert.score = progressData.score || 0;
    dataToUpsert.completed_puzzle_ids = progressData.completed_puzzle_ids || [];
    dataToUpsert.story_state = progressData.story_state || {};
  }

  const { data, error } = await supabase
    .from('user_hunt_progress')
    .upsert(dataToUpsert, {
      onConflict: 'user_id, hunt_id', // Specify the columns for conflict resolution (your UNIQUE constraint)
      // defaultToNull: false, // Supabase client v2 might not need this explicitly for preserving existing non-null values
    })
    .select() // Select the upserted row(s)
    .single(); // Expecting a single row to be returned

  if (error) {
    console.error('Error creating/updating user hunt progress:', error.message);
    throw error;
  }

  if (!data) {
    // This case should ideally not happen with a successful upsert returning a selection.
    throw new Error('Upsert operation did not return data.');
  }

  return data as UserHuntProgress;
};

/**
 * Optionally, a function to specifically update only the story_state for a progress record.
 * This can be useful for more granular updates.
 * @param userHuntProgressId - The ID of the user_hunt_progress record.
 * @param newStoryState - The new story_state object (will overwrite existing).
 * @returns A Promise resolving to the updated UserHuntProgress object.
 */
export const updateStoryState = async (
  userHuntProgressId: string,
  newStoryState: Record<string, any>
): Promise<UserHuntProgress> => {
  const { data, error } = await supabase
    .from('user_hunt_progress')
    .update({
      story_state: newStoryState,
      last_played_at: new Date().toISOString(),
    })
    .eq('id', userHuntProgressId)
    .select()
    .single();

  if (error) {
    console.error('Error updating story state:', error.message);
    throw error;
  }
  if (!data) throw new Error('Failed to update story state, no data returned.');
  return data as UserHuntProgress;
};
