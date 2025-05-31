// src/components/hunt/StoryNodeListEditor.tsx
import React, { useState } from 'react';
import { StoryNode, Puzzle as PuzzleData } from '../../types'; // Aliased Puzzle
import Button from '../ui/Button';
import Card, { CardContent, CardHeader, CardTitle } from '../ui/Card';
import { v4 as uuidv4 } from 'uuid';
import { PlusCircle, Trash2, Edit3, GripVertical, ArrowUp, ArrowDown, AlertTriangle } from 'lucide-react';
import { NodeConfigEditor } from './NodeConfigEditor';

// Using Client types defined in HuntCreator.tsx
type ClientStoryNode = import('./HuntCreator').ClientStoryNode; // Or ensure HuntCreator exports this type
type ClientPuzzle = import('./HuntCreator').ClientPuzzle;     // Or ensure HuntCreator exports this type

interface StoryNodeListEditorProps {
    nodes: ClientStoryNode[];
    setNodes: React.Dispatch<React.SetStateAction<ClientStoryNode[]>>;
    puzzles: ClientPuzzle[];
    setPuzzles: React.Dispatch<React.SetStateAction<ClientPuzzle[]>>;
}

export const StoryNodeListEditor: React.FC<StoryNodeListEditorProps> = ({ nodes, setNodes, puzzles, setPuzzles }) => {
    const [editingNodeClientId, setEditingNodeClientId] = useState<string | null>(null);

    // This array now drives the button creation and the types passed to addNode
    const availableNodeTypes: StoryNode['node_type'][] = [
        'narrative_block',
        'dialogue_message',
        'visual_cue',
        'puzzle_interaction',
        'player_choice',
        'story_update',     // Added
        'action_trigger',   // Added
        'end_hunt'
    ];

    const addNode = (type: StoryNode['node_type']) => {
        const newNodeClientId = uuidv4();
        const newNodeBase: Omit<ClientStoryNode, 'content'> = {
            client_id: newNodeClientId,
            node_type: type,
            display_order: nodes.length,
            is_starting_node: nodes.length === 0,
        };

        let content: ClientStoryNode['content'] = {};
        // Set default content structure based on node_type
        // Ensure all types in availableNodeTypes have a default content structure here
        if (type === 'narrative_block' || type === 'story_update') content = { text: '' };
        else if (type === 'dialogue_message') content = { sender_name: '', message_text: '' };
        else if (type === 'visual_cue') content = { image_url: '' }; // Or relevant defaults
        else if (type === 'player_choice') content = { prompt: '' };
        else if (type === 'puzzle_interaction') content = { puzzle_id: '', success_node_id: '' };
        else if (type === 'action_trigger') content = { action_label: '', success_node_id: ''}; // Default for action_trigger
        else if (type === 'end_hunt') content = { message: '', outcome: 'success' };

        // Add defaults for new DB columns if needed from the start
        // content.narrative_style = null;
        // content.emotional_context = {};
        // content.required_inventory_items = [];


        const newNode: ClientStoryNode = { ...newNodeBase, content };

        setNodes(prev => [...prev, newNode]);
        setEditingNodeClientId(newNodeClientId);
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
        // ... (your existing deleteNode logic - seems fine)
        const nodeToDelete = nodes.find(n => n.client_id === clientId);
        if (nodeToDelete && nodeToDelete.is_starting_node && nodes.length > 1) {
            alert("Cannot delete the starting node if other nodes exist. Designate another starting node first or delete all other nodes.");
            return;
        }
        const isLinked = nodes.some(n =>
            n.content.next_node_client_id === clientId ||
            n.content.success_node_client_id === clientId ||
            n.content.failure_node_client_id === clientId ||
            (n.choices || []).some(c => c.next_node_client_id === clientId)
        );
        if (isLinked) {
            if (!window.confirm("Warning: Other nodes or choices link to this node. Deleting it may break story flow. Are you sure?")) {
                return;
            }
        }
        setNodes(prev => prev.filter(node => node.client_id !== clientId).map((n, i) => ({...n, display_order: i})));
        if (editingNodeClientId === clientId) {
            setEditingNodeClientId(null);
        }
    };

    const moveNode = (index: number, direction: 'up' | 'down') => {
        // ... (your existing moveNode logic - seems fine)
        const newNodes = [...nodes];
        const item = newNodes[index];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newNodes.length) return;
        newNodes.splice(index, 1);
        newNodes.splice(targetIndex, 0, item);
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
        <Card className="bg-white shadow-lg">
            <CardHeader className="flex flex-wrap justify-between items-center gap-2">
                <CardTitle className="text-xl font-semibold text-slate-700">Story Weaver</CardTitle>
                <div className="flex flex-wrap gap-2">
                    {/* Use the availableNodeTypes array to generate buttons */}
                    {availableNodeTypes.map(type => (
                        <Button key={type} size="sm" variant="outline" onClick={() => addNode(type)} className="text-xs">
                            + {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Button>
                    ))}
                </div>
                {!startingNodeExists && nodes.length > 0 && (
                    <p className="w-full text-xs text-red-500 mt-2 flex items-center"><AlertTriangle size={14} className="mr-1"/> Warning: No starting node designated!</p>
                )}
            </CardHeader>
            <CardContent>
                {nodes.length === 0 ? (
                    <p className="text-slate-500 text-center py-6">No story nodes yet. Add one to begin!</p>
                ) : (
                    <ul className="space-y-2">
                        {nodes.sort((a,b) => a.display_order - b.display_order).map((node, index) => (
                            <li key={node.client_id} className={`p-3 border rounded-md ${editingNodeClientId === node.client_id ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <GripVertical size={18} className="text-slate-400 mr-1.5 cursor-move" />
                                        <span className="font-medium text-sm text-slate-700">
                      {node.display_order + 1}. {node.node_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            {node.is_starting_node && <span className="ml-2 text-xs text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full">START</span>}
                    </span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <Button size="icon" variant="ghost" onClick={() => moveNode(index, 'up')} disabled={index === 0} className="h-7 w-7 p-1"><ArrowUp size={14}/></Button>
                                        <Button size="icon" variant="ghost" onClick={() => moveNode(index, 'down')} disabled={index === nodes.length - 1} className="h-7 w-7 p-1"><ArrowDown size={14}/></Button>
                                        <Button size="sm" variant="outline" onClick={() => setEditingNodeClientId(node.client_id === editingNodeClientId ? null : node.client_id)} className="text-xs h-7 px-2">
                                            {editingNodeClientId === node.client_id ? 'Close' : 'Edit'}
                                        </Button>
                                        <Button size="icon" variant="ghost" onClick={() => deleteNode(node.client_id)} className="text-red-500 hover:bg-red-100 h-7 w-7 p-1"><Trash2 size={14}/></Button>
                                    </div>
                                </div>
                                {editingNodeClientId === node.client_id && editingNode && (
                                    <div className="mt-3 pt-3 border-t border-slate-200">
                                        <NodeConfigEditor
                                            node={editingNode}
                                            allNodes={nodes}
                                            allPuzzles={puzzles}
                                            onUpdateNodeContent={updateNodeContent}
                                            onUpdateNodeChoices={updateNodeChoices}
                                            onSetAsStartingNode={setAsStartingNode}
                                            onAddPuzzle={(newPuzzleData) => {
                                                const newPuzzleWithId = {...newPuzzleData, client_id: uuidv4()};
                                                setPuzzles(prev => [...prev, newPuzzleWithId]);
                                                return newPuzzleWithId;
                                            }}
                                        />
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
};
