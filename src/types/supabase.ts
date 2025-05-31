export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      achievements: {
        Row: {
          id: string;
          title: string;
          description: string;
          icon_name: string;
          criteria: Json;
          points: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          icon_name: string;
          criteria: Json;
          points?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          icon_name?: string;
          criteria?: Json;
          points?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      hunt_attempts: {
        Row: {
          id: string;
          hunt_id: string;
          user_id: string;
          current_puzzle_index: number;
          started_at: string;
          completed_at: string | null;
          puzzle_attempts: Json;
          attempt_count: number;
          hints_used: Json;
          total_time: string | null;
          score: number;
        };
        Insert: {
          id?: string;
          hunt_id: string;
          user_id: string;
          current_puzzle_index?: number;
          started_at?: string;
          completed_at?: string | null;
          puzzle_attempts?: Json;
          attempt_count?: number;
          hints_used?: Json;
          total_time?: string | null;
          score?: number;
        };
        Update: {
          id?: string;
          hunt_id?: string;
          user_id?: string;
          current_puzzle_index?: number;
          started_at?: string;
          completed_at?: string | null;
          puzzle_attempts?: Json;
          attempt_count?: number;
          hints_used?: Json;
          total_time?: string | null;
          score?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'hunt_attempts_hunt_id_fkey';
            columns: ['hunt_id'];
            referencedRelation: 'hunts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'hunt_attempts_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      hunts: {
        Row: {
          id: string;
          title: string;
          description: string;
          created_at: string;
          is_public: boolean;
          creator_id: string;
          story_context: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string;
          created_at?: string;
          is_public?: boolean;
          creator_id: string;
          story_context?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          created_at?: string;
          is_public?: boolean;
          creator_id?: string;
          story_context?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'hunts_creator_id_fkey';
            columns: ['creator_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      puzzles: {
        Row: {
          id: string;
          hunt_id: string;
          title: string;
          description: string | null;
          cipher_type: string;
          plaintext: string;
          ciphertext: string;
          hint: string | null;
          difficulty: string;
          config: Json | null;
          sequence: number;
          created_at: string;
          first_hint: string | null;
          second_hint: string | null;
          time_limit: string | null;
          points: number;
          prerequisites: Json | null;
        };
        Insert: {
          id?: string;
          hunt_id: string;
          title: string;
          description?: string | null;
          cipher_type: string;
          plaintext: string;
          ciphertext: string;
          hint?: string | null;
          difficulty: string;
          config?: Json | null;
          sequence: number;
          created_at?: string;
          first_hint?: string | null;
          second_hint?: string | null;
          time_limit?: string | null;
          points?: number;
          prerequisites?: Json | null;
        };
        Update: {
          id?: string;
          hunt_id?: string;
          title?: string;
          description?: string | null;
          cipher_type?: string;
          plaintext?: string;
          ciphertext?: string;
          hint?: string | null;
          difficulty?: string;
          config?: Json | null;
          sequence?: number;
          created_at?: string;
          first_hint?: string | null;
          second_hint?: string | null;
          time_limit?: string | null;
          points?: number;
          prerequisites?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: 'puzzles_hunt_id_fkey';
            columns: ['hunt_id'];
            referencedRelation: 'hunts';
            referencedColumns: ['id'];
          }
        ];
      };
      puzzle_statistics: {
        Row: {
          id: string;
          puzzle_id: string;
          total_attempts: number;
          successful_attempts: number;
          average_time: string | null;
          difficulty_rating: number | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          puzzle_id: string;
          total_attempts?: number;
          successful_attempts?: number;
          average_time?: string | null;
          difficulty_rating?: number | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          puzzle_id?: string;
          total_attempts?: number;
          successful_attempts?: number;
          average_time?: string | null;
          difficulty_rating?: number | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'puzzle_statistics_puzzle_id_fkey';
            columns: ['puzzle_id'];
            referencedRelation: 'puzzles';
            referencedColumns: ['id'];
          }
        ];
      };
      user_achievements_progress: {
        Row: {
          id: string;
          user_id: string;
          achievement_id: string;
          progress: number;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          achievement_id: string;
          progress?: number;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          achievement_id?: string;
          progress?: number;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_achievements_progress_achievement_id_fkey';
            columns: ['achievement_id'];
            referencedRelation: 'achievements';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_achievements_progress_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      user_dashboard_settings: {
        Row: {
          id: string;
          user_id: string;
          layout: Json;
          theme: string;
          widgets_config: Json;
          notifications_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          layout?: Json;
          theme?: string;
          widgets_config?: Json;
          notifications_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          layout?: Json;
          theme?: string;
          widgets_config?: Json;
          notifications_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_dashboard_settings_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      user_profiles: {
        Row: {
          id: string;
          display_name: string | null;
          bio: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
          total_hunts_completed: number;
          total_puzzles_solved: number;
          favorite_cipher_type: string | null;
          achievements: Json;
          preferences: Json;
          is_public: boolean;
          oauth_provider: string | null;
          oauth_id: string | null;
          email: string | null;
          email_verified: boolean;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          total_hunts_completed?: number;
          total_puzzles_solved?: number;
          favorite_cipher_type?: string | null;
          achievements?: Json;
          preferences?: Json;
          is_public?: boolean;
          oauth_provider?: string | null;
          oauth_id?: string | null;
          email?: string | null;
          email_verified?: boolean;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          total_hunts_completed?: number;
          total_puzzles_solved?: number;
          favorite_cipher_type?: string | null;
          achievements?: Json;
          preferences?: Json;
          is_public?: boolean;
          oauth_provider?: string | null;
          oauth_id?: string | null;
          email?: string | null;
          email_verified?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: 'user_profiles_id_fkey';
            columns: ['id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
