/*
  # Fix user profile creation trigger

  1. Changes
    - Add better error handling to user profile creation
    - Make trigger more robust against missing data
    - Add EXCEPTION handling block
*/

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert with more robust handling of null values and data types
  INSERT INTO user_profiles (
    id,
    email,
    display_name,
    oauth_provider,
    oauth_id,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(COALESCE(NEW.email, ''), '@', 1),
      'User_' || substr(NEW.id::text, 1, 8)
    ),
    COALESCE(NEW.raw_user_meta_data->>'provider', 'google'),
    COALESCE(NEW.raw_user_meta_data->>'sub', NEW.id::text),
    now(),
    now()
  );

  -- Create default dashboard settings
  INSERT INTO user_dashboard_settings (
    user_id,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    now(),
    now()
  );

  RETURN NEW;
EXCEPTION WHEN others THEN
  -- Log the error (Supabase will capture this in the database logs)
  RAISE LOG 'Error in handle_new_user trigger: %', SQLERRM;
  
  -- Still return NEW to allow the auth.users insert to succeed
  -- This prevents the user from getting an error even if profile creation fails
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;