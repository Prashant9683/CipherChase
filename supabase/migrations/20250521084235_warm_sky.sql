/*
  # Enhance treasure hunt schema with additional features

  1. Changes
    - Add user preferences and settings
    - Add achievements tracking
    - Add social features
    - Enhance hunt attempts tracking
    - Add puzzle statistics

  2. New Tables
    - `user_profiles`
      - User preferences and statistics
      - Achievement tracking
      - Social connections
    
    - `achievements`
      - Predefined achievements that users can earn
      - Tracking completion criteria
    
    - `puzzle_statistics`
      - Track puzzle completion rates
      - Average attempts
      - Success rates
      
  3. Security
    - Enable RLS on all new tables
    - Add appropriate access policies
*/

-- Create user_profiles table
CREATE TABLE user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  display_name text,
  bio text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  total_hunts_completed integer DEFAULT 0,
  total_puzzles_solved integer DEFAULT 0,
  favorite_cipher_type text,
  achievements jsonb DEFAULT '[]'::jsonb,
  preferences jsonb DEFAULT '{}'::jsonb,
  is_public boolean DEFAULT true
);

-- Create achievements table
CREATE TABLE achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  icon_name text NOT NULL,
  criteria jsonb NOT NULL,
  points integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create puzzle_statistics table
CREATE TABLE puzzle_statistics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  puzzle_id uuid REFERENCES puzzles(id) ON DELETE CASCADE,
  total_attempts integer DEFAULT 0,
  successful_attempts integer DEFAULT 0,
  average_time interval,
  difficulty_rating numeric(3,2),
  updated_at timestamptz DEFAULT now()
);

-- Add new columns to existing tables
ALTER TABLE hunt_attempts
ADD COLUMN hints_used jsonb DEFAULT '[]'::jsonb,
ADD COLUMN total_time interval,
ADD COLUMN score integer DEFAULT 0;

ALTER TABLE puzzles
ADD COLUMN time_limit interval,
ADD COLUMN points integer DEFAULT 100,
ADD COLUMN prerequisites jsonb DEFAULT '[]'::jsonb;

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE puzzle_statistics ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
CREATE POLICY "Users can view public profiles"
  ON user_profiles
  FOR SELECT
  USING (is_public = true OR id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON user_profiles
  FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
  ON user_profiles
  FOR INSERT
  WITH CHECK (id = auth.uid());

-- Policies for achievements
CREATE POLICY "Achievements are viewable by everyone"
  ON achievements
  FOR SELECT
  USING (true);

-- Policies for puzzle_statistics
CREATE POLICY "Puzzle statistics are viewable by everyone"
  ON puzzle_statistics
  FOR SELECT
  USING (true);

CREATE POLICY "Only system can update puzzle statistics"
  ON puzzle_statistics
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- Insert some default achievements
INSERT INTO achievements (title, description, icon_name, criteria, points) VALUES
(
  'Novice Explorer',
  'Complete your first treasure hunt',
  'compass',
  '{"type": "hunt_complete", "count": 1}',
  100
),
(
  'Code Breaker',
  'Successfully solve 10 puzzles',
  'key',
  '{"type": "puzzles_solved", "count": 10}',
  200
),
(
  'Speed Demon',
  'Complete a hunt in under 10 minutes',
  'timer',
  '{"type": "hunt_complete", "time_limit": "10 minutes"}',
  300
),
(
  'Perfect Run',
  'Complete a hunt without using any hints',
  'target',
  '{"type": "hunt_complete", "no_hints": true}',
  500
);

-- Create function to update puzzle statistics
CREATE OR REPLACE FUNCTION update_puzzle_statistics()
RETURNS trigger AS $$
BEGIN
  INSERT INTO puzzle_statistics (puzzle_id)
  VALUES (NEW.id)
  ON CONFLICT (puzzle_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new puzzles
CREATE TRIGGER puzzle_statistics_trigger
AFTER INSERT ON puzzles
FOR EACH ROW
EXECUTE FUNCTION update_puzzle_statistics();

-- Create function to update user statistics
CREATE OR REPLACE FUNCTION update_user_statistics()
RETURNS trigger AS $$
BEGIN
  -- Update user profile when hunt is completed
  IF NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL THEN
    UPDATE user_profiles
    SET 
      total_hunts_completed = total_hunts_completed + 1,
      updated_at = now()
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for hunt completion
CREATE TRIGGER hunt_completion_trigger
AFTER UPDATE ON hunt_attempts
FOR EACH ROW
EXECUTE FUNCTION update_user_statistics();

-- Add indexes for better query performance
CREATE INDEX idx_hunt_attempts_user_id ON hunt_attempts(user_id);
CREATE INDEX idx_hunt_attempts_hunt_id ON hunt_attempts(hunt_id);
CREATE INDEX idx_puzzles_hunt_id ON puzzles(hunt_id);
CREATE INDEX idx_puzzle_statistics_puzzle_id ON puzzle_statistics(puzzle_id);