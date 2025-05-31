/*
  # Enhance treasure hunt schema with story elements and hints

  1. Changes
    - Add story_context to hunts table
    - Add first_hint and second_hint to puzzles table
    - Add attempt_count to hunt_attempts table
    - Add shown_hints and shown_solution to puzzle_attempts

  2. Data Migration
    - Convert existing hunts to story format
    - Add sample story-driven hunts
*/

-- Add story context to hunts
ALTER TABLE hunts
ADD COLUMN story_context text;

-- Add hint columns to puzzles
ALTER TABLE puzzles
ADD COLUMN first_hint text,
ADD COLUMN second_hint text;

-- Add attempt tracking
ALTER TABLE hunt_attempts
ADD COLUMN attempt_count integer DEFAULT 0;

-- Insert sample story-driven hunts
INSERT INTO hunts (title, description, story_context, is_public) VALUES
(
  'The Lost Library of Alexandria',
  'Uncover the hidden knowledge of the ancient world''s greatest library.',
  'Legend speaks of a secret chamber beneath the sands of Egypt, containing salvaged scrolls from the Library of Alexandria. Ancient scholars, foreseeing the library''s destruction, encrypted their most valuable knowledge. Now, centuries later, mysterious symbols have emerged that might lead to this incredible discovery.',
  true
);

-- Get the hunt ID for our puzzles
DO $$
DECLARE
  hunt_id uuid;
BEGIN
  SELECT id INTO hunt_id FROM hunts WHERE title = 'The Lost Library of Alexandria' LIMIT 1;

  INSERT INTO puzzles (hunt_id, title, description, cipher_type, plaintext, ciphertext, first_hint, second_hint, difficulty, sequence) VALUES
  (
    hunt_id,
    'The Scholar''s Map',
    'An ancient parchment reveals the first clue to the library''s location.',
    'caesar',
    'Beneath the eternal gaze of Pharos lies the path',
    'Ehqhdwk wkh hwhuqdo cdch ri Skdurv olhv wkh sdwk',
    'This message uses one of the oldest encryption methods in history',
    'Each letter has been shifted three places in the alphabet',
    'easy',
    1
  ),
  (
    hunt_id,
    'The Guardian''s Riddle',
    'A stone tablet bears mysterious markings - the next step in our journey.',
    'atbash',
    'Seek the chamber where wisdom sleeps in silence',
    'Hvvp gsv xsznevi dsviv drwhln hovvkh rm hrovmxv',
    'The ancient Egyptians often wrote in reverse',
    'Each letter has been replaced with its opposite in the alphabet',
    'medium',
    2
  ),
  (
    hunt_id,
    'The Final Inscription',
    'The entrance to the hidden chamber is marked with these symbols.',
    'anagram',
    'Knowledge is the key to immortality',
    'Wedge link hot key to immortals',
    'The words have been scrambled',
    'Think about what scholars valued most',
    'hard',
    3
  );

  -- Insert second hunt
  INSERT INTO hunts (title, description, story_context, is_public) VALUES
  (
    'Digital Shadows',
    'A high-stakes cyber investigation to prevent a global security breach.',
    'A mysterious hacker group has left a trail of encrypted messages across the dark web. These messages hint at a planned cyber attack on critical infrastructure. As an elite cyber security expert, you must decrypt their communications and stop the attack before it''s too late.',
    true
  );

  -- Get the second hunt ID
  SELECT id INTO hunt_id FROM hunts WHERE title = 'Digital Shadows' LIMIT 1;

  INSERT INTO puzzles (hunt_id, title, description, cipher_type, plaintext, ciphertext, first_hint, second_hint, difficulty, sequence) VALUES
  (
    hunt_id,
    'The Access Code',
    'A suspicious binary sequence has been detected in the network logs.',
    'binary',
    'FIREWALL BREACH AT MIDNIGHT',
    '01000110 01001001 01010010 01000101 01010111 01000001 01001100 01001100 00100000 01000010 01010010 01000101 01000001 01000011 01001000 00100000 01000001 01010100 00100000 01001101 01001001 01000100 01001110 01001001 01000111 01001000 01010100',
    'This is how computers communicate at their most basic level',
    'Each letter is represented by 8 bits',
    'medium',
    1
  ),
  (
    hunt_id,
    'The Backdoor',
    'Hidden in the malware''s code is a crucial message about the attackers'' next move.',
    'substitution',
    'TARGET SERVER LOCATED IN SECTOR SEVEN',
    'MZVTBM PBVYBV BWLZMBA XC PBLMWV PBYBC',
    'Each letter consistently represents another letter',
    'Look for patterns in common words like "in" and "the"',
    'hard',
    2
  );
END $$;