// src/services/userProgressService.ts
// This code is based on the provided search result [20] and your attached file.
// It correctly handles last_played_at. The 'updated_at' error is a DB schema/trigger issue.

import { supabase } from '../lib/supabase'; // Ensure this path is correct for your Supabase client
import { UserHuntProgress } from '../types';     // Your UserHuntProgress type definition

/**
 * Fetches the existing hunt progress for a given user and hunt.
 * @param userId - The ID of the user.
 * @param huntId - The ID of the hunt.
 * @returns A Promise that resolves to the UserHuntProgress object or null if not found.
 */
export const getUserHuntProgress = async (userId: string, huntId: string): Promise<UserHuntProgress | null> => {
    if (!userId || !huntId) {
        console.warn("getUserHuntProgress called with invalid userId or huntId");
        return null;
    }

    const { data, error } = await supabase
        .from('user_hunt_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('hunt_id', huntId)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means "No rows found", which is valid here
        console.error('Error fetching user hunt progress:', error.message, error);
        throw error;
    }

    return data as UserHuntProgress | null;
};

/**
 * Creates a new hunt progress record or updates an existing one for a user.
 * This function uses upsert to simplify creation/update logic.
 * @param progressData - An object containing the progress data. Must include user_id and hunt_id.
 * @returns A Promise that resolves to the created or updated UserHuntProgress object.
 */
export const createOrUpdateUserHuntProgress = async (
    progressData: Partial<UserHuntProgress> & { user_id: string; hunt_id: string }
): Promise<UserHuntProgress> => {
    if (!progressData.user_id || !progressData.hunt_id) {
        throw new Error("user_id and hunt_id are required.");
    }

    const dataToUpsert: any = { // Use 'any' carefully or create a more specific upsert type
        ...progressData,
        last_played_at: new Date().toISOString(),
    };

    // Initialize visited_node_path if it's a brand new progress record and a starting node is set
    if (!progressData.id && progressData.current_story_node_id && !progressData.visited_node_path) {
        dataToUpsert.visited_node_path = [progressData.current_story_node_id];
    } else if (progressData.current_story_node_id && progressData.visited_node_path) {
        // If navigating forward and current_story_node_id is different from the last one in path, add it.
        // This handles the normal forward navigation case for updating the path.
        // This logic might need refinement based on how 'navigateToNode' calls this.
        const lastVisited = progressData.visited_node_path[progressData.visited_node_path.length - 1];
        if (progressData.current_story_node_id !== lastVisited) {
            // This push is conceptual; path update should happen BEFORE this save if current_story_node_id is the *new* node
            // See HuntPlayerPage.tsx for better path management.
        }
    }


    if (!progressData.id) { // New record defaults
        dataToUpsert.started_at = progressData.started_at || new Date().toISOString();
        dataToUpsert.status = progressData.status || 'started';
        dataToUpsert.score = progressData.score || 0;
        dataToUpsert.completed_puzzle_ids = progressData.completed_puzzle_ids || [];
        dataToUpsert.story_state = progressData.story_state || {};
    }

    const { data, error } = await supabase
        .from('user_hunt_progress')
        .upsert(dataToUpsert, {
            onConflict: 'user_id,hunt_id',
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating/updating user hunt progress:', error.message, error);
        throw error;
    }
    if (!data) throw new Error('Upsert operation did not return data.');
    return data as UserHuntProgress;
};


// updateStoryState function (from your attached file, seems fine assuming last_played_at is desired here)
export const updateStoryState = async (
    userHuntProgressId: string,
    newStoryState: Record<string, any>
): Promise<UserHuntProgress> => {
    const { data, error } = await supabase
        .from('user_hunt_progress')
        .update({
            story_state: newStoryState,
            last_played_at: new Date().toISOString(), // Explicitly updating last_played_at
        })
        .eq('id', userHuntProgressId)
        .select()
        .single();

    if (error) {
        console.error('Error updating story state:', error.message, error);
        throw error;
    }
    if (!data) throw new Error('Failed to update story state, no data returned.');
    return data as UserHuntProgress;
};

