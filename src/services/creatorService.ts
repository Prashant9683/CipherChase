// src/services/creatorService.ts
import { supabase } from '../lib/supabase'; // Corrected path if it was '../lib/supabase'
import { TreasureHunt, StoryNode, Puzzle, HuntChoice } from '../types';

export interface FullHuntDataForCreation {
  title: string;
  description?: string | null;
  story_context?: string | null; // <<< CHANGED from story_prologue
  cover_image_url?: string | null;
  is_public: boolean;
  difficulty: TreasureHunt['difficulty'];
  estimated_time_minutes?: number | null;
  tags?: string[] | null;
  creator_id: string;
  // Fields for nodes and puzzles remain the same
  nodes: Array<
    Omit<StoryNode, 'id' | 'hunt_id' | 'created_at'> & {
      client_id: string;
      choices?: Array<
        Omit<HuntChoice, 'id' | 'story_node_id' | 'created_at'> & {
          client_id: string;
          next_node_client_id: string;
        }
      >;
      content: StoryNode['content'] & {
        puzzle_client_id?: string;
        next_node_client_id?: string;
        success_node_client_id?: string;
        failure_node_client_id?: string;
      };
    }
  >;
  puzzles: Array<
    Omit<Puzzle, 'id' | 'created_at' | 'creator_id'> & { client_id: string }
  >;
}

export const saveFullHunt = async (
  huntData: FullHuntDataForCreation
): Promise<{ hunt_id: string }> => {
  const { nodes, puzzles, ...huntMetadataToInsert } = huntData;

  // This console log will show exactly what's being passed to the .insert() method for the 'hunts' table
  console.log(
    "Data being sent to insert into 'hunts' table:",
    JSON.stringify(huntMetadataToInsert, null, 2)
  );

  const { data: newHunt, error: huntError } = await supabase
    .from('hunts')
    .insert(huntMetadataToInsert) // This object now contains story_context
    .select('id')
    .single();

  if (huntError || !newHunt) {
    console.error('Error creating hunt in DB:', huntError);
    // The huntError object will contain the code: 'PGRST204' and message if the column mismatch persists
    throw huntError || new Error('Failed to create hunt metadata in DB.');
  }

  const dbHuntId = newHunt.id;

  // Logic for saving puzzles and nodes (ensure this part is also correct from previous responses)
  const puzzleIdMap = new Map<string, string>();
  if (puzzles && puzzles.length > 0) {
    for (const puz of puzzles) {
      const { client_id, ...puzzleDetails } = puz;
      const { data: newPuzzle, error: pError } = await supabase
        .from('puzzles')
        .insert({ ...puzzleDetails, creator_id: huntData.creator_id })
        .select('id')
        .single();
      if (pError) {
        console.error('Puzzle save error:', pError);
        throw pError;
      }
      if (newPuzzle) puzzleIdMap.set(client_id, newPuzzle.id);
    }
  }

  const nodeIdMap = new Map<string, string>();
  const finalNodesData = []; // Nodes with DB hunt_id and resolved puzzle_id in content

  for (const node of nodes) {
    const { client_id, choices, content, ...nodeDetails } = node;
    const finalContent: any = { ...content }; // Use 'any' temporarily for easier manipulation
    if (content.puzzle_client_id && puzzleIdMap.has(content.puzzle_client_id)) {
      finalContent.puzzle_id = puzzleIdMap.get(content.puzzle_client_id);
    }
    // Remove client-specific IDs from content before saving
    delete finalContent.puzzle_client_id;
    delete finalContent.next_node_client_id;
    delete finalContent.success_node_client_id;
    delete finalContent.failure_node_client_id;

    finalNodesData.push({
      ...nodeDetails,
      hunt_id: dbHuntId,
      content: finalContent,
      client_id_temp: client_id, // Keep temp ID for linking pass
    });
  }

  const insertedNodeResults = [];
  for (const nodeToInsert of finalNodesData) {
    const { client_id_temp, ...dbNodeData } = nodeToInsert;
    const { data: insertedNode, error: nError } = await supabase
      .from('story_nodes')
      .insert(dbNodeData)
      .select('id')
      .single();
    if (nError) {
      console.error('Story node save error:', nError);
      throw nError;
    }
    if (insertedNode) {
      nodeIdMap.set(client_id_temp, insertedNode.id);
      insertedNodeResults.push({
        ...dbNodeData,
        id: insertedNode.id,
        client_id_temp,
      });
    }
  }

  // Second pass to update node links and save choices
  for (const originalNode of nodes) {
    const dbNodeId = nodeIdMap.get(originalNode.client_id);
    if (!dbNodeId) continue;

    const contentUpdates: Partial<StoryNode['content']> = {};
    let needsLinkUpdate = false;

    if (
      originalNode.content.next_node_client_id &&
      nodeIdMap.has(originalNode.content.next_node_client_id)
    ) {
      contentUpdates.next_node_id = nodeIdMap.get(
        originalNode.content.next_node_client_id
      );
      needsLinkUpdate = true;
    }
    if (
      originalNode.content.success_node_client_id &&
      nodeIdMap.has(originalNode.content.success_node_client_id)
    ) {
      contentUpdates.success_node_id = nodeIdMap.get(
        originalNode.content.success_node_client_id
      );
      needsLinkUpdate = true;
    }
    if (
      originalNode.content.failure_node_client_id &&
      nodeIdMap.has(originalNode.content.failure_node_client_id)
    ) {
      contentUpdates.failure_node_id = nodeIdMap.get(
        originalNode.content.failure_node_client_id
      );
      needsLinkUpdate = true;
    }

    if (needsLinkUpdate) {
      const nodeToUpdate = insertedNodeResults.find(
        (n) => n.client_id_temp === originalNode.client_id
      );
      if (nodeToUpdate) {
        const finalContentForLinkUpdate = {
          ...nodeToUpdate.content,
          ...contentUpdates,
        };
        const { error: linkUpdateError } = await supabase
          .from('story_nodes')
          .update({ content: finalContentForLinkUpdate })
          .eq('id', dbNodeId);
        if (linkUpdateError)
          console.error('Error updating node links:', linkUpdateError);
      }
    }

    if (originalNode.choices && originalNode.choices.length > 0) {
      const choicesToInsert = originalNode.choices.map((choice) => ({
        story_node_id: dbNodeId,
        choice_text: choice.choice_text,
        next_story_node_id: nodeIdMap.get(choice.next_node_client_id)!, // Assert that this ID will exist
        feedback_text: choice.feedback_text,
        display_order: choice.display_order,
        story_state_update: choice.story_state_update,
      }));
      const { error: choiceError } = await supabase
        .from('story_node_choices')
        .insert(choicesToInsert);
      if (choiceError) console.error('Error saving choices:', choiceError);
    }
  }

  return { hunt_id: dbHuntId };
};
