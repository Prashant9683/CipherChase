// src/types/index.ts

// --- Core Cipher and Puzzle Types ---
export type CipherType =
    | 'caesar'
    | 'atbash'
    | 'substitution'
    | 'transposition'
    | 'anagram'
    | 'mirror'
    | 'riddle'
    | 'binary'
    | 'morse';

export interface CipherInfo {
  name: string;
  description: string;
}

export const cipherInfo: Record<CipherType, CipherInfo> = {
  caesar: { name: "Caesar Cipher", description: "Shifts letters by a fixed number." },
  atbash: { name: "Atbash Cipher", description: "Reverses the alphabet (A=Z, B=Y)." },
  substitution: { name: "Simple Substitution", description: "Each letter is replaced by another." },
  transposition: { name: "Transposition Cipher", description: "Letters are rearranged." },
  anagram: { name: "Anagram", description: "Rearrange letters to form new words/phrases." },
  mirror: { name: "Mirror Writing", description: "Text is reversed, like in a mirror." },
  riddle: { name: "Riddle", description: "A question or statement phrased puzzlingly." },
  binary: { name: "Binary Code", description: "Text encoded as sequences of 0s and 1s." },
  morse: { name: "Morse Code", description: "Text encoded as dots and dashes." },
};

export interface CipherExample {
  original: string;
  key?: string | number;
  encrypted: string;
  jumbled?: string;
  riddleText?: string;
}

export interface CipherData {
  history?: string;
  example?: CipherExample;
  tips?: string;
}

export type CipherConfig = {
  shift?: number;
  key?: string | number;
  advanced?: boolean;
  jumbled_letters?: string;
  riddle_question?: string;
};

// --- Hunt, Story Node, and Puzzle Types ---
export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface Puzzle {
  id: string;
  hunt_id?: string;
  sequence?: number;  // Add sequence field
  title?: string;
  description?: string | null;
  clue_text: string;
  solution: string;
  cipher_type: CipherType;
  cipher_config?: CipherConfig | null;
  points: number;
  hints?: { hint1?: string; hint2?: string; cost1?: number; cost2?: number; [key: string]: any } | null;
  difficulty?: Difficulty | null;
  creator_id?: string | null;
  created_at: string;
}

interface NarrativeContent {
  text: string;
  character_pov?: 'protagonist' | 'narrator' | string;
  character_pov_name?: string;
  next_node_id?: string;
}

interface DialogueMessageContent {
  sender_name: string;
  message_text: string;
  timestamp?: string;
  visual_style?: 'sms' | 'email' | 'note';
  next_node_id?: string;
  is_part_of_sequence?: boolean;
}

interface VisualCueContent {
  image_url?: string;
  audio_url?: string;
  caption?: string;
  alt_text?: string;
  next_node_id?: string;
}

interface PuzzleInteractionContent {
  puzzle_id: string;
  prompt_text?: string;
  success_node_id: string;
  failure_node_id?: string | null;
}

interface PlayerChoiceContent {
  prompt: string;
}

interface ActionTriggerContent {
  action_label: string;
  target_item_id?: string;
  success_node_id: string;
  required_story_state?: Record<string, any>;
}

interface StoryUpdateContent {
  text: string;
  next_node_id?: string;
}

interface HuntEndContent {
  message: string;
  outcome: 'success' | 'failure' | 'neutral';
}

export type StoryNodeContent =
    | NarrativeContent
    | DialogueMessageContent
    | VisualCueContent
    | PuzzleInteractionContent
    | PlayerChoiceContent
    | ActionTriggerContent
    | StoryUpdateContent
    | HuntEndContent
    | { [key: string]: any };

export interface StoryNode {
  id: string;
  hunt_id: string;
  node_type:
      | 'narrative_block'
      | 'dialogue_message'
      | 'visual_cue'
      | 'puzzle_interaction'
      | 'player_choice'
      | 'story_update'
      | 'action_trigger'
      | 'end_hunt';
  content: StoryNodeContent;
  display_order: number;
  is_starting_node: boolean;
  created_at: string;
  story_node_choices?: HuntChoice[];
  narrative_style?: string | null;
  emotional_context?: Record<string, any> | null;
  required_inventory_items?: string[] | Record<string, any> | null;
}

export interface HuntChoice {
  id: string;
  story_node_id: string;
  choice_text: string;
  next_story_node_id: string;
  feedback_text?: string | null;
  display_order: number;
  story_state_update?: Record<string, any> | null;
  created_at: string;
}

export interface TreasureHunt {
  id: string;
  title: string;
  description?: string | null;
  cover_image_url?: string | null;
  story_context?: string | null;
  creator_id: string;
  is_public: boolean;
  difficulty?: Difficulty | null;
  estimated_time_minutes?: number | null;
  tags?: string[] | null;
  created_at: string;
  updated_at?: string | null;
  starting_node_id?: string | null;
  puzzles_count?: number;
  creator?: { display_name?: string | null; avatar_url?: string | null };
}

// --- User Progress & Profile Types ---
export interface UserProfile {
  id: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  email?: string | null;
  created_at: string;
  updated_at: string;
  total_hunts_completed: number;
  total_puzzles_solved: number;
  total_points?: number;
  favorite_cipher_type?: CipherType | string | null;
  preferences?: Record<string, any> | null;
  is_public_profile?: boolean;
}

export interface UserHuntProgress {
  id: string;
  user_id: string;
  hunt_id: string;
  current_story_node_id: string | null;
  completed_puzzle_ids: string[];
  story_state: Record<string, any>;
  score: number;
  status: 'started' | 'in_progress' | 'completed' | 'abandoned';
  started_at: string;
  last_played_at: string;
  completed_at?: string | null;
}

export interface UserEvidenceLockerItem {
  EvidenceID: string;
  UserHuntProgressID: string;
  StoryNodeID_FoundAt: string;
  EvidenceName: string;
  EvidenceContent: string;
  EvidenceVisualURL?: string | null;
  TimestampFound: string;
  EvidenceType?: 'TextSnippet' | 'ImageURL' | 'ItemName' | 'AudioLog';
}

// --- Achievement & Dashboard Types ---
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon_name: string;
  criteria: Record<string, any>;
  points_reward?: number;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  achieved_at: string;
}

export interface UserDashboardSettings {
  id: string;
  user_id: string;
  layout_config: any;
  theme_preference: string;
  widget_visibility: Record<string, boolean>;
  notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
}
