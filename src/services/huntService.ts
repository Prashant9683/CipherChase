// src/services/huntService.ts
import { supabase } from '../lib/supabase'; // Ensure this path is correct for your Supabase client
import { TreasureHunt, StoryNode } from '../types';

export const fetchPublicHuntsForListing = async (): Promise<TreasureHunt[]> => {
    // This function seems to be working based on previous iterations,
    // ensure it selects all necessary fields for SolveHuntPage.tsx display.
    const selectString = `
      id,
      title,
      description,
      cover_image_url,
      difficulty,
      story_context,
      created_at,
      starting_node_id,  
      creator:creator_id ( 
        display_name, 
        avatar_url 
      )
      // If you still need puzzles_count and it's not a direct column, 
      // you might need to calculate it client-side after fetching 'puzzles(*)'
      // or add it as a denormalized column.
      // For now, assuming starting_node_id is the key for playability.
    `;

    const { data, error } = await supabase
        .from('hunts')
        .select(selectString.replace(/\s+/g, ' ').trim())
        .eq('is_public', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching public hunts for listing:', error);
        throw error;
    }
    return (data || []) as TreasureHunt[];
};

export const fetchHuntDetailsForPlaying = async (huntId: string): Promise<TreasureHunt | null> => {
    // Use the identified foreign key constraint name as the hint for the relationship.
    // This tells PostgREST to use the link where story_nodes.hunt_id = hunts.id.
    const relationshipHint = 'story_nodes_hunt_id_fkey';

    const { data, error } = await supabase
        .from('hunts')
        .select(`
      *, 
      creator:creator_id (display_name, avatar_url),
      story_nodes!${relationshipHint} (id, is_starting_node) -- <<< CORRECTED DISAMBIGUATION
    `)
        .eq('id', huntId)
        .single();

    if (error) {
        console.error(`Error fetching hunt details for playing (ID: ${huntId}):`, error);
        // Log the details array if the error persists; it lists available relationships.
        if (error.code === 'PGRST201' && error.details) {
            console.error("Available relationships from PostgREST error details:", error.details);
        }
        if (error.code === 'PGRST116') return null; // No rows found
        throw error;
    }

    if (!data) return null;

    // When using table!hint(columns), the embedded data should be directly under the 'story_nodes' key.
    const storyNodesFromRelationship = data.story_nodes as Partial<StoryNode>[] | undefined;
    const startingNode = storyNodesFromRelationship?.find(node => node.is_starting_node);

    // The 'story_nodes' property on the fetched 'data' object now contains the embedded nodes.
    // We don't need to pass the full list to the client if HuntPlayerPage fetches nodes individually,
    // but we use it here to determine the starting_node_id.
    return {
        ...data,
        story_nodes: undefined, // Clear the array as HuntPlayerPage will fetch nodes one by one
        starting_node_id: startingNode?.id || data.starting_node_id, // Prefer newly found, fallback to already set
    } as TreasureHunt;
};
