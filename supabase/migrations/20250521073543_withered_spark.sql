/*
  # Create tables for treasure hunts and puzzles

  1. New Tables
    - `hunts`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `created_at` (timestamptz)
      - `is_public` (boolean)
      - `creator_id` (uuid, references auth.users)
      
    - `puzzles`
      - `id` (uuid, primary key)
      - `hunt_id` (uuid, references hunts)
      - `title` (text)
      - `description` (text)
      - `cipher_type` (text)
      - `plaintext` (text)
      - `ciphertext` (text)
      - `hint` (text)
      - `difficulty` (text)
      - `config` (jsonb)
      - `sequence` (integer)
      - `created_at` (timestamptz)

    - `hunt_attempts`
      - `id` (uuid, primary key)
      - `hunt_id` (uuid, references hunts)
      - `user_id` (uuid, references auth.users)
      - `current_puzzle_index` (integer)
      - `started_at` (timestamptz)
      - `completed_at` (timestamptz)
      - `puzzle_attempts` (jsonb)

  2. Security
    - Enable RLS on all tables
    - Add policies for public access to hunts
    - Add policies for puzzle access
    - Add policies for tracking attempts
*/

-- Create hunts table
CREATE TABLE hunts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  is_public boolean DEFAULT true,
  creator_id uuid REFERENCES auth.users(id)
);

-- Create puzzles table
CREATE TABLE puzzles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hunt_id uuid REFERENCES hunts(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  cipher_type text NOT NULL,
  plaintext text NOT NULL,
  ciphertext text NOT NULL,
  hint text,
  difficulty text NOT NULL,
  config jsonb,
  sequence integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create hunt_attempts table
CREATE TABLE hunt_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hunt_id uuid REFERENCES hunts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  current_puzzle_index integer DEFAULT 0,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  puzzle_attempts jsonb DEFAULT '[]'::jsonb
);

-- Enable Row Level Security
ALTER TABLE hunts ENABLE ROW LEVEL SECURITY;
ALTER TABLE puzzles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hunt_attempts ENABLE ROW LEVEL SECURITY;

-- Policies for hunts
CREATE POLICY "Public hunts are viewable by everyone"
  ON hunts
  FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can create hunts"
  ON hunts
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Creators can update their own hunts"
  ON hunts
  FOR UPDATE
  USING (creator_id = auth.uid());

CREATE POLICY "Creators can delete their own hunts"
  ON hunts
  FOR DELETE
  USING (creator_id = auth.uid());

-- Policies for puzzles
CREATE POLICY "Puzzles are viewable with their hunts"
  ON puzzles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM hunts
      WHERE hunts.id = hunt_id
      AND (hunts.is_public = true OR hunts.creator_id = auth.uid())
    )
  );

CREATE POLICY "Users can create puzzles"
  ON puzzles
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Creators can update their puzzles"
  ON puzzles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM hunts
      WHERE hunts.id = hunt_id
      AND hunts.creator_id = auth.uid()
    )
  );

CREATE POLICY "Creators can delete their puzzles"
  ON puzzles
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM hunts
      WHERE hunts.id = hunt_id
      AND hunts.creator_id = auth.uid()
    )
  );

-- Policies for hunt_attempts
CREATE POLICY "Users can view their own attempts"
  ON hunt_attempts
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create attempts"
  ON hunt_attempts
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own attempts"
  ON hunt_attempts
  FOR UPDATE
  USING (user_id = auth.uid());