// src/components/hunt/HuntCreator.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

import Button from '../ui/Button';
// Other UI imports as needed by sub-components

import { FullHuntDataForCreation, saveFullHunt } from '../../services/creatorService';
import { TreasureHunt, StoryNode, Puzzle, HuntChoice } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import { AlertTriangle, CheckCircle, PenTool as SectionIcon } from 'lucide-react';

import { HuntMetadataEditor } from './HuntMetadataEditor';
import { StoryNodeListEditor } from './StoryNodeListEditor';

// Client-side types (ensure these are consistent with your project)
export type ClientStoryNode = Omit<StoryNode, 'id' | 'hunt_id' | 'created_at' | 'story_node_choices'> & {
  client_id: string;
  choices?: Array<Omit<HuntChoice, 'id' | 'story_node_id' | 'created_at' | 'display_order'> & {
    client_id: string;
    next_node_client_id: string;
    display_order: number;
    story_state_update?: Record<string, any> | null;
  }>;
  content: StoryNode['content'] & {
    puzzle_client_id?: string;
    next_node_client_id?: string;
    success_node_client_id?: string;
    failure_node_client_id?: string;
  };
};

export type ClientPuzzle = Omit<Puzzle, 'id' | 'created_at' | 'creator_id' | 'post_solve_story_node_id'> & {
  client_id: string;
  post_solve_story_node_client_id?: string;
};

// Initial state for hunt metadata, using story_context
const initialHuntMetadata: Partial<Omit<TreasureHunt, 'id' | 'creator' | 'puzzles_count' | 'story_nodes' | 'starting_node_id' | 'average_rating' | 'total_ratings' | 'completions_count' | 'created_at' | 'updated_at' >> = {
  title: '',
  description: '',
  story_context: '', // <<< CHANGED from story_prologue to match your DB and types/index.ts
  is_public: true,
  difficulty: 'medium',
  tags: [],
  cover_image_url: '',
  estimated_time_minutes: 60,
};

const HuntCreator: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [huntMetadata, setHuntMetadata] = useState(initialHuntMetadata);
  const [storyNodes, setStoryNodes] = useState<ClientStoryNode[]>([]);
  const [puzzles, setPuzzles] = useState<ClientPuzzle[]>([]);

  const handleMetadataChange = (
      field: keyof typeof initialHuntMetadata,
      value: any
  ) => {
    setHuntMetadata(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveHunt = async () => {
    if (!user) { setError("User session not found. Please log in again."); return; }
    if (!huntMetadata.title?.trim()) { setError("Hunt title is required."); return; }
    if (storyNodes.length === 0) { setError("At least one story node is required."); return; }
    const startingNodes = storyNodes.filter(node => node.is_starting_node);
    if (startingNodes.length !== 1) { setError("Each hunt must have exactly one starting node."); return; }

    setIsLoading(true); setError(null); setSuccessMessage(null);

    // Construct fullHuntData using story_context
    const fullHuntData: FullHuntDataForCreation = {
      title: huntMetadata.title!,
      description: huntMetadata.description || null,
      story_context: huntMetadata.story_context || null, // <<< CHANGED to story_context
      cover_image_url: huntMetadata.cover_image_url || null,
      is_public: huntMetadata.is_public !== undefined ? huntMetadata.is_public : true,
      difficulty: huntMetadata.difficulty || 'medium',
      estimated_time_minutes: huntMetadata.estimated_time_minutes || null,
      tags: huntMetadata.tags?.length ? huntMetadata.tags : null,
      creator_id: user.id,
      nodes: storyNodes,
      puzzles: puzzles,
    };

    try {
      console.log("Attempting to save hunt data (client-side):", JSON.stringify(fullHuntData, null, 2)); // Log before sending
      const result = await saveFullHunt(fullHuntData);
      setSuccessMessage(`Adventure "${huntMetadata.title}" crafted! ID: ${result.hunt_id}`);
      setHuntMetadata(initialHuntMetadata);
      setStoryNodes([]);
      setPuzzles([]);
    } catch (err: any) {
      setError(err.message || "Failed to save adventure. Check console for details.");
      console.error("Save Hunt Error:", err); // Full error object
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="space-y-8">
        <header className="text-center py-6 bg-white shadow-md rounded-lg">
          <SectionIcon className="mx-auto h-12 w-12 text-blue-500 mb-3" strokeWidth={1.5} />
          <h2 className="text-3xl font-bold text-slate-700 font-serif">
            Adventure Weaver
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Fill in the details below to bring your story to life.
          </p>
        </header>

        {error && (
            <div className="my-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm flex items-center">
              <AlertTriangle size={18} className="mr-2"/> {error}
            </div>
        )}
        {successMessage && (
            <div className="my-4 p-3 bg-green-100 text-green-700 border border-green-300 rounded-md text-sm flex items-center">
              <CheckCircle size={18} className="mr-2"/> {successMessage}
            </div>
        )}

        <HuntMetadataEditor
            metadata={huntMetadata}
            onMetadataChange={handleMetadataChange}
        />

        <StoryNodeListEditor
            nodes={storyNodes}
            setNodes={setStoryNodes}
            puzzles={puzzles}
            setPuzzles={setPuzzles}
        />

        <div className="pt-6 border-t border-slate-300 flex justify-end mt-8">
          <Button
              variant="primary"
              size="lg"
              onClick={handleSaveHunt}
              isLoading={isLoading}
              disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Publish Adventure'}
          </Button>
        </div>
      </div>
  );
};

export default HuntCreator;
