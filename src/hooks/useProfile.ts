// src/hooks/useProfile.ts
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase'; // Ensure this path is correct
import { useAuth } from './useAuth'; // File `[3]`
import { UserProfile } from '../types'; // Ensure this path is correct

export const useProfile = (userId?: string) => {
  const { user: authUser } = useAuth(); // Renamed to avoid conflict with local user variable if any
  const [profile, setProfile] = useState<UserProfile | null>(null); // Typed state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // Typed state

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null); // Reset error on new fetch attempt

      const targetUserId = userId || authUser?.id;

      if (!targetUserId) {
        // If still no targetUserId after checking authUser, then we can't fetch.
        setError('No user ID available to fetch profile.');
        setLoading(false);
        setProfile(null); // Ensure profile is cleared
        return; // Exit early
      }

      try {
        const { data, error: supabaseError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', targetUserId)
            .single(); // Using .single() implies a profile MUST exist.
        // Consider .maybeSingle() if a user might not have a profile entry yet.

        if (supabaseError) {
          // Handle cases where .single() fails (e.g., no profile found - PGRST116, or other DB errors)
          if (supabaseError.code === 'PGRST116') { // No row found
            setError('Profile not found for this user.');
            setProfile(null);
          } else {
            throw supabaseError; // Re-throw other Supabase errors
          }
        } else {
          setProfile(data as UserProfile);
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError(err instanceof Error ? err.message : 'Failed to load profile');
        setProfile(null); // Clear profile on error
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we have a user context (authUser or explicit userId)
    // and if the profile hasn't been loaded yet or if the user/userId changes.
    if (authUser?.id || userId) {
      fetchProfile();
    } else {
      // No user context, ensure loading is false and profile is null
      setLoading(false);
      setProfile(null);
      setError(null); // Or "User not authenticated"
    }

  }, [userId, authUser]); // Depend on authUser as a whole object or authUser?.id

  const updateProfile = async (updates: Partial<UserProfile>) => {
    // ... (updateProfile logic seems mostly okay but ensure user is authUser)
    if (!authUser?.id) {
      setError('User must be authenticated to update profile');
      return { success: false, error: new Error('User not authenticated') };
    }
    setLoading(true);
    try {
      const { data, error: supabaseError } = await supabase
          .from('user_profiles')
          .update(updates)
          .eq('id', authUser.id) // Use authUser.id
          .select()
          .single();

      if (supabaseError) throw supabaseError;
      setProfile(data as UserProfile);
      setLoading(false);
      return { success: true, data };
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      setLoading(false);
      return { success: false, error: err instanceof Error ? err : new Error(String(err)) };
    }
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
  };
};
