// src/services/huntService.ts
import { supabase } from '../lib/supabase'; // Assuming your Supabase client is here
import { TreasureHunt, StoryNode } from '../types'; // Ensure your types are correctly defined

// Function to fetch all public hunts for display on SolveHuntPage
export const fetchPublicHuntsForListing = async (): Promise<TreasureHunt[]> => {
  const { data, error } = await supabase
    .from('hunts') // Your 'hunts' table
    .select(
      `
      id,
      title,
      description,
      cover_image_url,
      difficulty,
      story_introduction, 
      puzzles_count, 
      created_at,
      creator:creator_id ( 
        display_name, 
        avatar_url 
      )
    `
    )
    .eq('is_public', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching public hunts for listing:', error);
    throw error;
  }
  // The 'creator' field will be an object if the join is successful
  return (data || []) as TreasureHunt[];
};

// Function to fetch details for a single hunt, including its starting node ID
// This will be used by HuntPlayerPage
export const fetchHuntDetailsForPlaying = async (
  huntId: string
): Promise<TreasureHunt | null> => {
  const { data, error } = await supabase
    .from('hunts')
    .select(
      `
      *, 
      creator:creator_id (display_name, avatar_url),
      story_nodes (id, is_starting_node) 
    `
    ) // Fetch associated story_nodes to find the starting one
    .eq('id', huntId)
    .single();

  if (error) {
    console.error(
      `Error fetching hunt details for playing (ID: ${huntId}):`,
      error
    );
    if (error.code === 'PGRST116') return null; // 'No rows found' is a valid scenario
    throw error;
  }

  if (!data) return null;

  // Find the starting node ID from the fetched story_nodes
  const startingNode = data.story_nodes?.find(
    (node: Partial<StoryNode>) => node.is_starting_node
  );

  return {
    ...data,
    starting_node_id: startingNode?.id, // Add starting_node_id to the hunt object
    story_nodes: undefined, // Remove the array of story_nodes from the top-level hunt object if not needed further
  } as TreasureHunt;
};
