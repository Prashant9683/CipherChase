// src/lib/auth.ts
import { supabase } from './supabase'; // CORRECT: Import the single Supabase client instance

export const signInWithGoogle = async () => {
  try {
    // Use the current window's origin. This will be:
    // - http://localhost:5173 (or your local port) when running locally
    // - https://cipherchasepg.netlify.app when deployed
    const currentOrigin = window.location.origin;

    // This is the URL Supabase will redirect the user to AFTER Supabase itself
    // has processed the callback from Google.
    // This URL *must* be whitelisted in your Supabase project's
    // "Authentication" -> "URL Configuration" -> "Additional Redirect URLs".
    // Using just the currentOrigin (e.g., "http://localhost:5173/") is simplest.
    const redirectTo = `${currentOrigin}/`;
    // If you prefer to land on a specific page after login, like the dashboard:
    // const redirectTo = `${currentOrigin}/dashboard`;

    console.log(`Attempting Google sign-in with redirectTo: ${redirectTo}`); // For debugging

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectTo,
        // Optional: Specify scopes if you need more than the default (email, profile)
        // scopes: 'email profile another_scope',
      },
    });

    if (error) {
      console.error('Supabase signInWithOAuth error:', error.message);
      // Log the full error object for more details if available
      console.error('Full OAuth Error:', error);
      throw error; // Re-throw so UI can handle it
    }

    // `data.url` is the URL to redirect the user to Google's sign-in page.
    // The browser will automatically navigate there.
    // Typically, you don't need to do anything with 'data' here as the redirect happens.
    console.log(
      'Supabase signInWithOAuth initiated. Redirecting to Google via:',
      data?.url
    );
    return data;
  } catch (error) {
    // This catches synchronous errors within this function or re-thrown errors
    console.error('Error in signInWithGoogle function wrapper:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Supabase signOut error:', error.message);
      throw error;
    }
  } catch (error) {
    console.error('Exception during signOut:', error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) {
      // Don't throw for "no user" as it's a valid state, but log for unexpected errors.
      console.warn(
        'Supabase getUser error (might be expected if not logged in):',
        error.message
      );
      return null;
    }
    return user;
  } catch (error) {
    console.error('Exception during getCurrentUser:', error);
    return null; // Or re-throw depending on how you want to handle it
  }
};

// Consider moving getUserProfile to a dedicated user profile service file.
export const getUserProfile = async (userId: string) => {
  if (!userId) {
    console.warn('getUserProfile called without userId');
    return null;
  }
  try {
    // Ensure your table is 'user_profiles' and the select statement is correct for your schema.
    // The nested select for achievements needs to be accurate.
    const { data, error } = await supabase
      .from('user_profiles')
      .select(
        `
        *,
        user_achievements_progress(*, achievements(name, description, points)) 
      `
      ) // Adjust this select based on your actual schema and desired fields
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Standard code for "No rows found"
        console.warn(
          `Profile not found for user ID: ${userId}. This might be expected.`
        );
        return null; // Return null if profile not found, it's not necessarily an "error"
      }
      console.error('Error fetching user profile:', error.message);
      throw error; // Throw for other unexpected database errors
    }
    return data;
  } catch (error) {
    console.error('Exception in getUserProfile:', error);
    throw error;
  }
};
