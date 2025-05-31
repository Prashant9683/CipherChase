import { createClient } from '@supabase/supabase-js';
import { Puzzle, TreasureHunt, UserProfile } from '../types';
// src/lib/supabaseClient.ts
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
        'CRITICAL: Supabase URL and/or Anon Key are missing from environment variables. Supabase functionality will be disabled.'
    );
    // In a real app, you might throw an error here or export a null/dummy client
    // to prevent the app from breaking entirely, depending on how critical Supabase is.
    // For now, we'll assume they are set and proceed.
}

// Create and export the single Supabase client instance
export const supabase = createClient(supabaseUrl!, supabaseAnonKey!);


// Authentication helpers
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;

  if (data.user) {
    // Create initial profile for the user
    await createUserProfile(data.user.id, email);
  }

  return data;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// User profile operations
export const fetchUserProfile = async (userId: string) => {
  const { data, error } = await supabase
      .from('profiles')
      .select('*, achievements(*)')
      .eq('user_id', userId)
      .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

export const createUserProfile = async (userId: string, email: string) => {
  const { data, error } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
        email,
        display_name: email.split('@')[0],
        is_public: true,
        total_hunts_completed: 0,
        total_puzzles_solved: 0,
      })
      .select()
      .single();

  if (error) throw error;
  return data;
};

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
  const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

  if (error) throw error;
  return data;
};

// Hunt operations

export const fetchHunts = async () => {
  try {
    const { data: hunts, error } = await supabase
        .from('hunts')
        .select(`
        *,
        puzzles (*),
        creator:user_profiles (
          display_name,
          avatar_url
        )
      `)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      throw new Error(`Failed to fetch hunts: ${error.message}`);
    }

    if (!hunts) {
      throw new Error('No hunts data received from Supabase');
    }

    return hunts;
  } catch (error) {
    console.error('Error in fetchHunts:', error);
    throw error;
  }
};

export const fetchHuntById = async (huntId: string) => {
  const { data, error } = await supabase
      .from('hunts')
      .select('*, creator:profiles(display_name), puzzles(*)')
      .eq('id', huntId)
      .single();

  if (error) throw error;
  return data;
};

export const createHunt = async (hunt: Omit<TreasureHunt, 'id'>, userId: string) => {
  const { data, error } = await supabase
      .from('hunts')
      .insert({
        title: hunt.title,
        description: hunt.description,
        is_public: hunt.isPublic,
        creator_id: userId,
        created_at: new Date().toISOString(),
        story_context: hunt.story_context || null
      })
      .select()
      .single();

  if (error) throw error;

  // Insert puzzles for this hunt
  if (hunt.puzzles && hunt.puzzles.length > 0) {
    const puzzlesWithHuntId = hunt.puzzles.map(puzzle => ({
      ...puzzle,
      hunt_id: data.id
    }));

    const { error: puzzleError } = await supabase
        .from('puzzles')
        .insert(puzzlesWithHuntId);

    if (puzzleError) throw puzzleError;
  }

  return data;
};

// Puzzle operations
export const createPuzzle = async (puzzle: Omit<Puzzle, 'id'>) => {
  const { data, error } = await supabase
      .from('puzzles')
      .insert(puzzle)
      .select()
      .single();

  if (error) throw error;
  return data;
};

// Achievement operations
export const fetchAchievements = async () => {
  const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .order('points', { ascending: false });

  if (error) throw error;
  return data;
};

export const awardAchievement = async (userId: string, achievementId: string) => {
  const { data, error } = await supabase
      .from('user_achievements')
      .insert({
        user_id: userId,
        achievement_id: achievementId,
      })
      .select('*, achievement:achievements(*)')
      .single();

  if (error) throw error;
  return data;
};

// Progress tracking
export const trackHuntCompletion = async (userId: string, huntId: string, timeToComplete: number) => {
  // Record the completion
  const { error } = await supabase
      .from('user_hunt_progress')
      .insert({
        user_id: userId,
        hunt_id: huntId,
        completed_at: new Date().toISOString(),
        time_to_complete: timeToComplete,
        is_completed: true
      });

  if (error) throw error;

  // Increment the user's total hunts completed count
  await supabase.rpc('increment_user_hunts_completed', {
    user_id: userId
  });
};

export const trackPuzzleSolved = async (userId: string, puzzleId: string) => {
  // Record the solution
  const { error } = await supabase
      .from('user_puzzle_progress')
      .insert({
        user_id: userId,
        puzzle_id: puzzleId,
        solved_at: new Date().toISOString()
      });

  if (error) throw error;

  // Increment the user's total puzzles solved count
  await supabase.rpc('increment_user_puzzles_solved', {
    user_id: userId
  });
};