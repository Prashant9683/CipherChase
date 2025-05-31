// src/services/creatorService.ts

import { supabase } from '../lib/supabase';
import { TreasureHunt, StoryNode, Puzzle, HuntChoice } from '../types';

export interface FullHuntDataForCreation {
    title: string;
    description?: string | null;
    story_context?: string | null;
    cover_image_url?: string | null;
    is_public: boolean;
    difficulty: TreasureHunt['difficulty'];
    estimated_time_minutes?: number | null;
    tags?: string[] | null;
    creator_id: string;
    nodes: Array<Omit<StoryNode, 'id' | 'hunt_id' | 'created_at'> & {
        client_id: string;
        choices?: Array<Omit<HuntChoice, 'id' | 'story_node_id' | 'created_at'> & {
            client_id: string;
            next_node_client_id: string;
        }>;
        content: StoryNode['content'] & {
            puzzle_client_id?: string;
            next_node_client_id?: string;
            success_node_client_id?: string;
            failure_node_client_id?: string;
        };
    }>;
    puzzles: Array<Omit<Puzzle, 'id' | 'created_at'> & { client_id: string }>;
}

export const saveFullHunt = async (huntData: FullHuntDataForCreation): Promise<{ hunt_id: string }> => {
    const { nodes, puzzles, ...huntMetadataToInsert } = huntData;

    console.log("Data being sent to insert into 'hunts' table:", JSON.stringify(huntMetadataToInsert, null, 2));

    // Create the hunt first
    const { data: newHunt, error: huntError } = await supabase
        .from('hunts')
        .insert(huntMetadataToInsert)
        .select('id')
        .single();

    if (huntError || !newHunt) {
        console.error('Error creating hunt in DB:', huntError);
        throw huntError || new Error('Failed to create hunt metadata in DB.');
    }

    const dbHuntId = newHunt.id;
    let dbStartingNodeId: string | null = null;

    // Save Puzzles - ONLY USE INSERT, NO UPSERT
    const puzzleIdMap = new Map<string, string>();
    if (puzzles && puzzles.length > 0) {
        for (let i = 0; i < puzzles.length; i++) {
            const puz = puzzles[i];
            const { client_id, ...puzzleDetails } = puz;

            // Map your puzzle fields to match the database schema
            const puzzleToInsert = {
                hunt_id: dbHuntId,
                creator_id: huntData.creator_id,
                sequence: i + 1,
                title: puzzleDetails.title || `Puzzle ${i + 1}`,
                description: puzzleDetails.description,
                cipher_type: puzzleDetails.cipher_type,
                clue_text: puzzleDetails.clue_text,
                solution: puzzleDetails.solution,
                points: puzzleDetails.points || 100,
                cipher_config: puzzleDetails.cipher_config,
                hints: puzzleDetails.hints,
                difficulty: puzzleDetails.difficulty
            };

            console.log(`Inserting puzzle ${i + 1}:`, puzzleToInsert);

            const { data: newPuzzle, error: pError } = await supabase
                .from('puzzles')
                .insert(puzzleToInsert)
                .select('id')
                .single();

            if (pError) {
                console.error("Puzzle save error:", pError);
                throw pError;
            }

            if (newPuzzle) {
                puzzleIdMap.set(client_id, newPuzzle.id);
            }
        }
    }

    // Save Story Nodes (first pass - basic insert, map client_id to db_id)
    const nodeIdMap = new Map<string, string>();
    const finalNodesData = [];

    for (const node of nodes) {
        const { client_id, choices, content, is_starting_node, ...nodeDetails } = node;
        const finalContent: any = { ...content };

        // Map puzzle client IDs to database IDs
        if (content.puzzle_client_id && puzzleIdMap.has(content.puzzle_client_id)) {
            finalContent.puzzle_id = puzzleIdMap.get(content.puzzle_client_id);
        }

        // Remove client-side only fields
        delete finalContent.puzzle_client_id;
        delete finalContent.next_node_client_id;
        delete finalContent.success_node_client_id;
        delete finalContent.failure_node_client_id;

        finalNodesData.push({
            ...nodeDetails,
            hunt_id: dbHuntId,
            content: finalContent,
            is_starting_node: is_starting_node,
            client_id_temp: client_id
        });
    }

    // Insert story nodes - USE INSERT ONLY
    const insertedNodeResults = [];
    for (const nodeToInsert of finalNodesData) {
        const { client_id_temp, ...dbNodeData } = nodeToInsert;

        console.log(`Inserting story node:`, dbNodeData);

        const { data: insertedNode, error: nError } = await supabase
            .from('story_nodes')
            .insert(dbNodeData)
            .select('id, is_starting_node')
            .single();

        if (nError) {
            console.error("Story node save error:", nError);
            throw nError;
        }

        if (insertedNode) {
            nodeIdMap.set(client_id_temp, insertedNode.id);
            if (insertedNode.is_starting_node) {
                dbStartingNodeId = insertedNode.id;
            }
            insertedNodeResults.push({ ...dbNodeData, id: insertedNode.id, client_id_temp });
        }
    }

    // Update the hunt with the starting_node_id
    if (dbStartingNodeId) {
        const { error: updateHuntError } = await supabase
            .from('hunts')
            .update({ starting_node_id: dbStartingNodeId })
            .eq('id', dbHuntId);

        if (updateHuntError) {
            console.error("Error updating hunt with starting node:", updateHuntError);
        }
    }

    // Second pass for Story Nodes: Update links and save choices
    for (const originalNode of nodes) {
        const dbNodeId = nodeIdMap.get(originalNode.client_id);
        if (!dbNodeId) continue;

        const contentUpdates: Partial<StoryNode['content']> = {};
        let needsLinkUpdate = false;

        // Map node links
        if (originalNode.content.next_node_client_id && nodeIdMap.has(originalNode.content.next_node_client_id)) {
            contentUpdates.next_node_id = nodeIdMap.get(originalNode.content.next_node_client_id);
            needsLinkUpdate = true;
        }

        if (originalNode.content.success_node_client_id && nodeIdMap.has(originalNode.content.success_node_client_id)) {
            contentUpdates.success_node_id = nodeIdMap.get(originalNode.content.success_node_client_id);
            needsLinkUpdate = true;
        }

        if (originalNode.content.failure_node_client_id && nodeIdMap.has(originalNode.content.failure_node_client_id)) {
            contentUpdates.failure_node_id = nodeIdMap.get(originalNode.content.failure_node_client_id);
            needsLinkUpdate = true;
        }

        // Update node content with links if needed
        if (needsLinkUpdate) {
            const nodeToUpdate = insertedNodeResults.find(n => n.client_id_temp === originalNode.client_id);
            if (nodeToUpdate) {
                const finalContentForLinkUpdate = { ...nodeToUpdate.content, ...contentUpdates };
                const { error: linkUpdateError } = await supabase
                    .from('story_nodes')
                    .update({ content: finalContentForLinkUpdate })
                    .eq('id', dbNodeId);

                if (linkUpdateError) {
                    console.error("Error updating node links:", linkUpdateError);
                }
            }
        }

        // Save choices for this node - USE INSERT ONLY
        if (originalNode.choices && originalNode.choices.length > 0) {
            const choicesToInsert = originalNode.choices
                .map(choice => ({
                    story_node_id: dbNodeId,
                    choice_text: choice.choice_text,
                    next_story_node_id: nodeIdMap.get(choice.next_node_client_id),
                    feedback_text: choice.feedback_text || null,
                    display_order: choice.display_order,
                    story_state_update: choice.story_state_update || null
                }))
                .filter(c => c.next_story_node_id);

            if (choicesToInsert.length > 0) {
                console.log(`Inserting ${choicesToInsert.length} choices for node ${dbNodeId}`);

                const { error: choiceError } = await supabase
                    .from('story_node_choices')
                    .insert(choicesToInsert);

                if (choiceError) {
                    console.error("Error saving choices:", choiceError);
                }
            }
        }
    }

    return { hunt_id: dbHuntId };
};
