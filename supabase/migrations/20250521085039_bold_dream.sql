/*
  # Add authentication and user dashboard features

  1. Changes
    - Add OAuth providers configuration
    - Add user settings and preferences
    - Add dashboard-specific tables
    - Modify existing tables for better auth integration

  2. New Tables
    - `user_dashboard_settings`
      - User-specific dashboard preferences
      - Widget configurations
      - Theme settings
    
    - `user_achievements_progress`
      - Track individual progress towards achievements
      - Store completion dates
      
  3. Security
    - Update RLS policies for new auth flow
    - Add OAuth-specific policies
*/

-- Create user dashboard settings table
CREATE TABLE user_dashboard_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  layout jsonb DEFAULT '[]'::jsonb,
  theme text DEFAULT 'light',
  widgets_config jsonb DEFAULT '{}'::jsonb,
  notifications_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user achievements progress table
CREATE TABLE user_achievements_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id uuid REFERENCES achievements(id) ON DELETE CASCADE,
  progress integer DEFAULT 0,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Add OAuth related columns to user_profiles
ALTER TABLE user_profiles
ADD COLUMN oauth_provider text,
ADD COLUMN oauth_id text,
ADD COLUMN email text,
ADD COLUMN email_verified boolean DEFAULT false;

-- Enable RLS
ALTER TABLE user_dashboard_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements_progress ENABLE ROW LEVEL SECURITY;

-- Policies for user_dashboard_settings
CREATE POLICY "Users can manage their own dashboard settings"
  ON user_dashboard_settings
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policies for user_achievements_progress
CREATE POLICY "Users can view their own achievement progress"
  ON user_achievements_progress
  FOR SELECT
  USING (user_id = auth.uid());

-- Update existing hunt policies for better auth integration
DROP POLICY IF EXISTS "Public hunts are viewable by everyone" ON hunts;
CREATE POLICY "Public hunts and owned hunts are viewable"
  ON hunts
  FOR SELECT
  USING (is_public = true OR creator_id = auth.uid());

-- Add indexes for better query performance
CREATE INDEX idx_user_dashboard_settings_user_id ON user_dashboard_settings(user_id);
CREATE INDEX idx_user_achievements_progress_user_id ON user_achievements_progress(user_id);
CREATE INDEX idx_user_achievements_progress_achievement ON user_achievements_progress(achievement_id);

-- Create function to initialize user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_profiles (id, email, display_name, oauth_provider, oauth_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'provider',
    NEW.raw_user_meta_data->>'sub'
  );

  INSERT INTO user_dashboard_settings (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();