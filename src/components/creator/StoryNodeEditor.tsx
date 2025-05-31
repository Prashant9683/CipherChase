// src/components/creator/StoryNodeEditor.tsx
import React, { useState } from 'react';
import { StoryNode, Puzzle as PuzzleData, HuntChoice, CipherType, CipherConfig } from '../../types'; // Use aliased Puzzle
import Button from '../ui/Button';
import Card, { CardContent, CardHeader, CardTitle } from '../ui/Card';
import { NodeConfigurationPanel } from './NodeConfigurationPanel'; // Create this next
import { v4 as uuidv4 } from 'uuid';
import { PlusCircle, Trash2, GripVertical, ArrowDown, ArrowUp, AlertTriangle } from 'lucide-react';
// For drag and drop, you might use a library like react-beautiful-dnd or dnd-kit
// For simplicity, we'll use basic up/down arrows for reordering.

type ClientStoryNode = Omit<StoryNode, 'id' | 'hunt_id' | 'created_at'> & {
    client_id: string;
    choices?: Array<Omit<HuntChoice, 'id' | 'story_node_id' | 'created_at'> & { client_id: string; next_node_client_id: string }>;
    content: StoryNode['content'] & {
        puzzle_client_id?: string;
        next_node_client_id?: string;
        success_node_client_id?: string;
        failure_node_client_id?: string;
    };
};
type ClientPuzzle = Omit<PuzzleData, 'id' | 'created_at' | 'creator_id'> & { client_id: string };


interface StoryNodeEditorProps {
    nodes: ClientStoryNode[];
    setNodes: React.Dispatch<React.SetStateAction<ClientStoryNode[]>>;
    puzzles: ClientPuzzle[]; // Pass puzzles down for selection
    setPuzzles: React.Dispatch<React.SetStateAction<ClientPuzzle[]>>; // To add new puzzles
}

const StoryNodeEditor: React.FC<StoryNodeEditorProps> = ({ nodes, setNodes, puzzles, setPuzzles }) => {
    const [editingNodeClientId, setEditingNodeClientId] = useState<string | null>(null);

    const addNode = (type: StoryNode['node_type']) => {
        const newNodeClientId = uuidv4();
        const newNode: ClientStoryNode = {
            client_id: newNodeClientId,
            node_type: type,
            content: {}, // Default empty content
            display_order: nodes.length,
            is_starting_node: nodes.length === 0, // First node is starting node by default
            // Choices will be added via NodeConfigurationPanel if type is 'choice'
        };
        setNodes(prev => [...prev, newNode]);
        setEditingNodeClientId(newNodeClientId); // Open new node for editing
    };

    const updateNode = (clientId: string, updates: Partial<ClientStoryNode>) => {
        setNodes(prev => prev.map(node => node.client_id === clientId ? { ...node, ...updates } : node));
    };

    const updateNodeContent = (clientId: string, contentUpdates: Partial<ClientStoryNode['content']>) => {
        setNodes(prev => prev.map(node =>
            node.client_id === clientId ? { ...node, content: { ...node.content, ...contentUpdates } } : node
        ));
    };

    const updateNodeChoices = (clientId: string, choices: ClientStoryNode['choices']) => {
        setNodes(prev => prev.map(node =>
            node.client_id === clientId ? { ...node, choices: choices } : node
        ));
    };

    const deleteNode = (clientId: string) => {
        const nodeToDelete = nodes.find(n => n.client_id === clientId);
        if (nodeToDelete && nodeToDelete.is_starting_node && nodes.length > 1) {
            alert("Cannot delete the starting node if other nodes exist. Please designate another starting node first.");
            return;
        }
        // Also need to handle if this node is a target of any links (next_node_id, etc.)
        // For simplicity, just deleting now. Production app needs more robust checks or auto-relinking UI.
        setNodes(prev => prev.filter(node => node.client_id !== clientId).map((n, i) => ({...n, display_order: i})));
        if (editingNodeClientId === clientId) {
            setEditingNodeClientId(null);
        }
    };

    const moveNode = (index: number, direction: 'up' | 'down') => {
        const newNodes = [...nodes];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newNodes.length) return;

        [newNodes[index], newNodes[targetIndex]] = [newNodes[targetIndex], newNodes[index]];
        // Update display_order for all nodes after moving
        setNodes(newNodes.map((node, idx) => ({ ...node, display_order: idx })));
    };

    const setAsStartingNode = (clientId: string) => {
        setNodes(prev => prev.map(node => ({
            ...node,
            is_starting_node: node.client_id === clientId
        })));
    };

    const editingNode = nodes.find(node => node.client_id === editingNodeClientId);
    const startingNodeExists = nodes.some(node => node.is_starting_node);

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="text-2xl font-serif text-slate-700">Story Weaver</CardTitle>
                    <div className="flex space-x-2">
                        {(['narrative_block', 'dialogue_message', 'visual_cue', 'puzzle_interaction', 'player_choice', 'action_trigger', 'end_hunt'] as StoryNode['node_type'][]).map(type => (
                            <Button key={type} size="sm" variant="outline" onClick={() => addNode(type)}>
                                + {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Button>
                        ))}
                    </div>
                </div>
                {!startingNodeExists && nodes.length > 0 && (
                    <p className="text-sm text-red-600 mt-2 flex items-center"><AlertTriangle size={16} className="mr-1.5"/> Warning: No starting node designated for this hunt!</p>
                )}
            </CardHeader>
            <CardContent>
                {nodes.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">No story nodes yet. Add one to begin crafting your narrative!</p>
                ) : (
                    <ul className="space-y-3">
                        {nodes.sort((a,b) => a.display_order - b.display_order).map((node, index) => (
                            <li key={node.client_id} className={`p-4 border rounded-lg ${editingNodeClientId === node.client_id ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <GripVertical size={20} className="text-slate-400 mr-2 cursor-grab" /> {/* Placeholder for drag handle */}
                                        <span className="font-semibold text-slate-700">
                      Node {node.display_order + 1}: {node.node_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            {node.is_starting_node && <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">STARTING NODE</span>}
                    </span>
                                    </div>
                                    <div className="flex items-center space-x-1.5">
                                        <Button size="sm" variant="ghost" onClick={() => moveNode(index, 'up')} disabled={index === 0}><ArrowUp size={16}/></Button>
                                        <Button size="sm" variant="ghost" onClick={() => moveNode(index, 'down')} disabled={index === nodes.length - 1}><ArrowDown size={16}/></Button>
                                        <Button size="sm" variant="outline" onClick={() => setEditingNodeClientId(node.client_id === editingNodeClientId ? null : node.client_id)}>
                                            {editingNodeClientId === node.client_id ? 'Close' : 'Edit'}
                                        </Button>
                                        <Button size="sm" variant="ghost" onClick={() => deleteNode(node.client_id)} className="text-red-500 hover:bg-red-50"><Trash2 size={16}/></Button>
                                    </div>
                                </div>
                                {editingNodeClientId === node.client_id && editingNode && (
                                    <NodeConfigurationPanel
                                        node={editingNode}
                                        allNodes={nodes} // For linking dropdowns
                                        allPuzzles={puzzles} // For puzzle selection
                                        onUpdateNode={updateNode}
                                        onUpdateNodeContent={updateNodeContent}
                                        onUpdateNodeChoices={updateNodeChoices}
                                        onSetAsStartingNode={setAsStartingNode}
                                        onAddPuzzle={(newPuzzle) => setPuzzles(prev => [...prev, {...newPuzzle, client_id: uuidv4()}])} // Add new puzzle to global list
                                    />
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
};

export default StoryNodeEditor;
