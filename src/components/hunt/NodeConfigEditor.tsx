// src/components/hunt/NodeConfigEditor.tsx
import React, { useState } from 'react';
// ... other imports (Input, Textarea, Label, Button, Select, PuzzleEditorModal, etc.) ...
import {
  StoryNode,
  Puzzle as PuzzleData,
  HuntChoice,
  CipherType,
  CipherConfig,
  cipherInfo,
} from '../../types';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Label from '../ui/Label';
import Button from '../ui/Button';
import Select from '../ui/Select';
import { PuzzleEditorModal } from './PuzzleEditorModal';
import { PlusCircle, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

// Using Client types defined in HuntCreator.tsx
type ClientStoryNode = import('./HuntCreator').ClientStoryNode;
type ClientPuzzle = import('./HuntCreator').ClientPuzzle;

interface NodeConfigEditorProps {
  node: ClientStoryNode;
  allNodes: ClientStoryNode[];
  allPuzzles: ClientPuzzle[];
  onUpdateNodeContent: (
    clientId: string,
    contentUpdates: Partial<ClientStoryNode['content']>
  ) => void;
  onUpdateNodeChoices: (
    clientId: string,
    choices: ClientStoryNode['choices']
  ) => void;
  onSetAsStartingNode: (clientId: string) => void;
  onAddPuzzle: (newPuzzle: Omit<ClientPuzzle, 'client_id'>) => ClientPuzzle;
}

export const NodeConfigEditor: React.FC<NodeConfigEditorProps> = ({
  node,
  allNodes,
  allPuzzles,
  onUpdateNodeContent,
  onUpdateNodeChoices,
  onSetAsStartingNode,
  onAddPuzzle,
}) => {
  const [showPuzzleModal, setShowPuzzleModal] = useState(false);
  const [editingPuzzle, setEditingPuzzle] = useState<
    Omit<ClientPuzzle, 'client_id'> | undefined
  >(undefined);

  const handleContentChange = (
    field: keyof ClientStoryNode['content'],
    value: any
  ) => {
    onUpdateNodeContent(node.client_id, { [field]: value });
  };

  const handleDBFieldChange = (
    field: 'narrative_style' | 'emotional_context' | 'required_inventory_items',
    value: any
  ) => {
    // These fields are directly on the node, not in 'content' by default in my ClientStoryNode type
    // To handle this, you could either:
    // 1. Add them to ClientStoryNode['content'] if that's how you want to structure it.
    // 2. Or, pass a more general update function like onUpdateNode(clientId, { [field]: value })
    // For now, assuming they might be part of content for simplicity if not directly on ClientStoryNode
    onUpdateNodeContent(node.client_id, { [field]: value });
  };

  // ... (handleLinkChange, nodeOptions, puzzleOptions, choice management - from your existing file, seems fine) ...
  const handleLinkChange = (
    field:
      | 'next_node_client_id'
      | 'success_node_client_id'
      | 'failure_node_client_id',
    value: string | undefined
  ) => {
    onUpdateNodeContent(node.client_id, {
      [field]: value === '' ? undefined : value,
    });
  };

  const nodeOptions = allNodes
    .filter((n) => n.client_id !== node.client_id)
    .map((n) => ({
      value: n.client_id,
      label: `${n.display_order + 1}. ${n.node_type.replace('_', ' ')}`,
    }));

  const puzzleOptions = allPuzzles.map((p) => ({
    value: p.client_id,
    label: p.title || `Puzzle (${p.client_id.substring(0, 6)})`,
  }));

  const addChoice = () => {
    const newChoice = {
      client_id: uuidv4(),
      choice_text: '',
      next_node_client_id: '',
      display_order: node.choices?.length || 0,
    };
    onUpdateNodeChoices(node.client_id, [...(node.choices || []), newChoice]);
  };

  const updateChoice = (
    choiceClientId: string,
    field: 'choice_text' | 'next_node_client_id' | 'story_state_update',
    value: any
  ) => {
    const updatedChoices = (node.choices || [])
      .map((c) =>
        c.client_id === choiceClientId ? { ...c, [field]: value } : c
      )
      .map((c, i) => ({ ...c, display_order: i }));
    onUpdateNodeChoices(node.client_id, updatedChoices);
  };

  const deleteChoice = (choiceClientId: string) => {
    const updatedChoices = (node.choices || [])
      .filter((c) => c.client_id !== choiceClientId)
      .map((c, i) => ({ ...c, display_order: i }));
    onUpdateNodeChoices(node.client_id, updatedChoices);
  };

  const handleOpenNewPuzzleModal = () => {
    setEditingPuzzle(undefined);
    setShowPuzzleModal(true);
  };

  const handleOpenEditPuzzleModal = (puzzleClientId?: string) => {
    if (!puzzleClientId) return;
    const puzzleToEdit = allPuzzles.find((p) => p.client_id === puzzleClientId);
    if (puzzleToEdit) {
      setEditingPuzzle(puzzleToEdit);
      setShowPuzzleModal(true);
    }
  };

  const renderContentFields = () => {
    switch (node.node_type) {
      // ... (cases for narrative_block, dialogue_message, visual_cue, puzzle_interaction, player_choice, end_hunt from your file) ...
      // Your existing cases seem mostly okay, just ensure `handleContentChange` keys match the properties in your Content interfaces in types/index.ts
      // Example for narrative_block using the new DB fields (optional, add if needed)
      case 'narrative_block': // Combined with story_update for now for simplicity
      case 'story_update':
        return (
          <div className="space-y-3">
            <div>
              <Label htmlFor={`node-text-${node.client_id}`}>
                Narrative Text
              </Label>
              <Textarea
                id={`node-text-${node.client_id}`}
                value={node.content.text || ''}
                onChange={(e) => handleContentChange('text', e.target.value)}
                rows={6}
                placeholder="The story continues..."
              />
            </div>
            {/* Optional fields from your DB schema */}
            <div>
              <Label htmlFor={`node-narrative-style-${node.client_id}`}>
                Narrative Style (e.g., first-person, third-person)
              </Label>
              <Input
                id={`node-narrative-style-${node.client_id}`}
                value={node.content.narrative_style || ''}
                onChange={(e) =>
                  handleDBFieldChange('narrative_style', e.target.value)
                }
              />
            </div>
            <div>
              <Label htmlFor={`node-emotional-context-${node.client_id}`}>
                Emotional Context (JSON)
              </Label>
              <Textarea
                id={`node-emotional-context-${node.client_id}`}
                value={
                  node.content.emotional_context
                    ? JSON.stringify(node.content.emotional_context, null, 2)
                    : '{}'
                }
                onChange={(e) => {
                  try {
                    handleDBFieldChange(
                      'emotional_context',
                      JSON.parse(e.target.value)
                    );
                  } catch {
                    /* ignore */
                  }
                }}
                rows={2}
                placeholder='e.g., { "mood": "tense", "weather": "stormy" }'
              />
            </div>
            <div>
              <Label htmlFor={`node-req-inv-${node.client_id}`}>
                Required Inventory Items (JSON array of strings)
              </Label>
              <Textarea
                id={`node-req-inv-${node.client_id}`}
                value={
                  node.content.required_inventory_items
                    ? JSON.stringify(
                        node.content.required_inventory_items,
                        null,
                        2
                      )
                    : '[]'
                }
                onChange={(e) => {
                  try {
                    handleDBFieldChange(
                      'required_inventory_items',
                      JSON.parse(e.target.value)
                    );
                  } catch {
                    /* ignore */
                  }
                }}
                rows={2}
                placeholder='e.g., ["red_key", "old_map"]'
              />
            </div>

            {(node.node_type === 'narrative_block' ||
              node.node_type === 'story_update') && (
              <div>
                <Label htmlFor={`node-next-${node.client_id}`}>Next Node</Label>
                <Select
                  id={`node-next-${node.client_id}`}
                  value={node.content.next_node_client_id || ''}
                  onChange={(e) =>
                    handleLinkChange('next_node_client_id', e.target.value)
                  }
                  options={[
                    { value: '', label: 'Select next node or END' },
                    ...nodeOptions,
                  ]}
                />
              </div>
            )}
          </div>
        );

      case 'action_trigger': // NEW CASE
        return (
          <div className="space-y-3">
            <div>
              <Label htmlFor={`node-actionlabel-${node.client_id}`}>
                Action Label (Button Text)
              </Label>
              <Input
                id={`node-actionlabel-${node.client_id}`}
                value={node.content.action_label || ''}
                onChange={(e) =>
                  handleContentChange('action_label', e.target.value)
                }
                placeholder="e.g., Examine the desk"
              />
            </div>
            <div>
              <Label htmlFor={`node-targetitem-${node.client_id}`}>
                Target Item ID (Optional)
              </Label>
              <Input
                id={`node-targetitem-${node.client_id}`}
                value={node.content.target_item_id || ''}
                onChange={(e) =>
                  handleContentChange('target_item_id', e.target.value)
                }
                placeholder="e.g., desk_drawer_01"
              />
            </div>
            <div>
              <Label htmlFor={`node-action-successnext-${node.client_id}`}>
                Node on Action Trigger/Success
              </Label>
              <Select
                id={`node-action-successnext-${node.client_id}`}
                value={node.content.success_node_client_id || ''}
                onChange={(e) =>
                  handleLinkChange('success_node_client_id', e.target.value)
                }
                options={[
                  { value: '', label: 'Select target node' },
                  ...nodeOptions,
                ]}
              />
            </div>
            {/* Optional: Field for required_story_state for this action */}
          </div>
        );
      case 'dialogue_message': // from your file
        return (
          <div className="space-y-3">
            <div>
              <Label htmlFor={`node-sender-${node.client_id}`}>
                Sender Name
              </Label>
              <Input
                id={`node-sender-${node.client_id}`}
                value={node.content.sender_name || ''}
                onChange={(e) =>
                  handleContentChange('sender_name', e.target.value)
                }
                placeholder="e.g., Alex, Protagonist, Mysterious Note"
              />
            </div>
            <div>
              <Label htmlFor={`node-message-${node.client_id}`}>
                Message Text
              </Label>
              <Textarea
                id={`node-message-${node.client_id}`}
                value={node.content.message_text || ''}
                onChange={(e) =>
                  handleContentChange('message_text', e.target.value)
                }
                rows={3}
                placeholder="The dialogue or message content..."
              />
            </div>
            <div>
              <Label htmlFor={`node-timestamp-${node.client_id}`}>
                Timestamp (Optional)
              </Label>
              <Input
                id={`node-timestamp-${node.client_id}`}
                value={node.content.timestamp || ''}
                onChange={(e) =>
                  handleContentChange('timestamp', e.target.value)
                }
                placeholder="e.g., 10:38 PM"
              />
            </div>
            <div>
              <Label htmlFor={`node-dialogue-style-${node.client_id}`}>
                Visual Style
              </Label>
              <Select
                id={`node-dialogue-style-${node.client_id}`}
                value={node.content.visual_style || 'sms'}
                onChange={(e) =>
                  handleContentChange('visual_style', e.target.value)
                }
                options={[
                  { value: 'sms', label: 'SMS/Chat Bubble' },
                  { value: 'email', label: 'Email Format' },
                  { value: 'note', label: 'Handwritten Note Style' },
                ]}
              />
            </div>
            <div>
              <Label htmlFor={`node-next-${node.client_id}`}>Next Node</Label>
              <Select
                id={`node-next-${node.client_id}`}
                value={node.content.next_node_client_id || ''}
                onChange={(e) =>
                  handleLinkChange('next_node_client_id', e.target.value)
                }
                options={[
                  { value: '', label: 'Select next node or END' },
                  ...nodeOptions,
                ]}
              />
            </div>
          </div>
        );
      case 'visual_cue': // from your file
        return (
          <div className="space-y-3">
            <div>
              <Label htmlFor={`node-imageurl-${node.client_id}`}>
                Image URL
              </Label>
              <Input
                id={`node-imageurl-${node.client_id}`}
                type="url"
                value={node.content.image_url || ''}
                onChange={(e) =>
                  handleContentChange('image_url', e.target.value)
                }
                placeholder="https://example.com/image.png"
              />
            </div>
            <div>
              <Label htmlFor={`node-audiourl-${node.client_id}`}>
                Audio URL (Optional)
              </Label>
              <Input
                id={`node-audiourl-${node.client_id}`}
                type="url"
                value={node.content.audio_url || ''}
                onChange={(e) =>
                  handleContentChange('audio_url', e.target.value)
                }
                placeholder="https://example.com/sound.mp3"
              />
            </div>
            <div>
              <Label htmlFor={`node-caption-${node.client_id}`}>
                Caption (Optional)
              </Label>
              <Input
                id={`node-caption-${node.client_id}`}
                value={node.content.caption || ''}
                onChange={(e) => handleContentChange('caption', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor={`node-next-${node.client_id}`}>Next Node</Label>
              <Select
                id={`node-next-${node.client_id}`}
                value={node.content.next_node_client_id || ''}
                onChange={(e) =>
                  handleLinkChange('next_node_client_id', e.target.value)
                }
                options={[
                  { value: '', label: 'Select next node or END' },
                  ...nodeOptions,
                ]}
              />
            </div>
          </div>
        );
      case 'puzzle_interaction': // from your file
        return (
          <div className="space-y-3">
            <div>
              <Label htmlFor={`node-puzzleprompt-${node.client_id}`}>
                Prompt Text (leading into the puzzle)
              </Label>
              <Textarea
                id={`node-puzzleprompt-${node.client_id}`}
                value={node.content.prompt_text || ''}
                onChange={(e) =>
                  handleContentChange('prompt_text', e.target.value)
                }
                rows={2}
                placeholder="e.g., The old chest is locked with a cipher..."
              />
            </div>
            <div>
              <Label htmlFor={`node-puzzleid-${node.client_id}`}>
                Linked Puzzle
              </Label>
              <div className="flex items-center space-x-2">
                <Select
                  id={`node-puzzleid-${node.client_id}`}
                  value={node.content.puzzle_client_id || ''}
                  onChange={(e) =>
                    handleContentChange('puzzle_client_id', e.target.value)
                  }
                  options={[
                    { value: '', label: 'Select a puzzle' },
                    ...puzzleOptions,
                  ]}
                  className="flex-grow"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleOpenNewPuzzleModal}
                >
                  New Puzzle
                </Button>
                {node.content.puzzle_client_id && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleOpenEditPuzzleModal(node.content.puzzle_client_id)
                    }
                  >
                    Edit Selected
                  </Button>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor={`node-successnext-${node.client_id}`}>
                Node on Puzzle Success
              </Label>
              <Select
                id={`node-successnext-${node.client_id}`}
                value={node.content.success_node_client_id || ''}
                onChange={(e) =>
                  handleLinkChange('success_node_client_id', e.target.value)
                }
                options={[
                  { value: '', label: 'Select success node' },
                  ...nodeOptions,
                ]}
              />
            </div>
            <div>
              <Label htmlFor={`node-failnext-${node.client_id}`}>
                Node on Puzzle Failure (Optional)
              </Label>
              <Select
                id={`node-failnext-${node.client_id}`}
                value={node.content.failure_node_client_id || ''}
                onChange={(e) =>
                  handleLinkChange('failure_node_client_id', e.target.value)
                }
                options={[
                  { value: '', label: 'Select failure node or END' },
                  ...nodeOptions,
                ]}
              />
            </div>
          </div>
        );
      case 'player_choice': // from your file
        return (
          <div className="space-y-3">
            <div>
              <Label htmlFor={`node-choiceprompt-${node.client_id}`}>
                Choice Prompt (Question for player)
              </Label>
              <Textarea
                id={`node-choiceprompt-${node.client_id}`}
                value={node.content.prompt || ''}
                onChange={(e) => handleContentChange('prompt', e.target.value)}
                rows={2}
                placeholder="e.g., Do you open the left door or the right door?"
              />
            </div>
            <div className="space-y-3 mt-2">
              <Label className="text-sm font-medium">Choice Options:</Label>
              {(node.choices || []).map((choice, index) => (
                <Card
                  key={choice.client_id}
                  className="p-3 border-slate-200 bg-slate-50"
                >
                  <div className="space-y-2">
                    <div>
                      <Label htmlFor={`choice-text-${choice.client_id}`}>
                        Choice {index + 1} Text
                      </Label>
                      <Input
                        id={`choice-text-${choice.client_id}`}
                        value={choice.choice_text}
                        onChange={(e) =>
                          updateChoice(
                            choice.client_id,
                            'choice_text',
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor={`choice-nextnode-${choice.client_id}`}>
                        Leads to Node
                      </Label>
                      <Select
                        id={`choice-nextnode-${choice.client_id}`}
                        value={choice.next_node_client_id}
                        onChange={(e) =>
                          updateChoice(
                            choice.client_id,
                            'next_node_client_id',
                            e.target.value
                          )
                        }
                        options={[
                          { value: '', label: 'Select target node' },
                          ...nodeOptions,
                        ]}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`choice-stateupdate-${choice.client_id}`}>
                        Story State Update (JSON - Optional)
                      </Label>
                      <Textarea
                        id={`choice-stateupdate-${choice.client_id}`}
                        value={
                          choice.story_state_update
                            ? JSON.stringify(choice.story_state_update, null, 2)
                            : ''
                        }
                        onChange={(e) => {
                          try {
                            updateChoice(
                              choice.client_id,
                              'story_state_update',
                              e.target.value
                                ? JSON.parse(e.target.value)
                                : undefined
                            );
                          } catch {
                            /* ignore parse error while typing */
                          }
                        }}
                        rows={2}
                        placeholder='e.g., { "has_red_key": true }'
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteChoice(choice.client_id)}
                      className="text-red-500 hover:bg-red-100 float-right"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </Card>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addChoice}
                icon={<PlusCircle size={16} />}
                className="mt-1"
              >
                Add Choice Option
              </Button>
            </div>
          </div>
        );
      case 'end_hunt': // from your file
        return (
          <div className="space-y-3">
            <div>
              <Label htmlFor={`node-endmessage-${node.client_id}`}>
                End Message
              </Label>
              <Textarea
                id={`node-endmessage-${node.client_id}`}
                value={node.content.message || ''}
                onChange={(e) => handleContentChange('message', e.target.value)}
                rows={3}
                placeholder="e.g., Congratulations, you've solved the mystery!"
              />
            </div>
            <div>
              <Label htmlFor={`node-endoutcome-${node.client_id}`}>
                Outcome
              </Label>
              <Select
                id={`node-endoutcome-${node.client_id}`}
                value={node.content.outcome || 'success'}
                onChange={(e) => handleContentChange('outcome', e.target.value)}
                options={[
                  { value: 'success', label: 'Success' },
                  { value: 'failure', label: 'Failure (e.g., time ran out)' },
                  { value: 'neutral', label: 'Neutral Ending' },
                ]}
              />
            </div>
          </div>
        );

      default:
        return (
          <p className="text-sm text-slate-500">
            Configure fields for: '{node.node_type}'
          </p>
        );
    }
  };

  return (
    <div className="space-y-3 py-3">
      <h4 className="text-sm font-semibold text-slate-600">
        Configure:{' '}
        {node.node_type
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase())}
      </h4>
      {!node.is_starting_node && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSetAsStartingNode(node.client_id)}
          className="text-xs"
        >
          Set as Starting Node
        </Button>
      )}
      {renderContentFields()}
      {showPuzzleModal && (
        <PuzzleEditorModal
          isOpen={showPuzzleModal}
          onClose={() => setShowPuzzleModal(false)}
          existingPuzzleData={editingPuzzle}
          onSave={(puzzleData, existingPuzzleClientId) => {
            if (existingPuzzleClientId) {
              setPuzzles((prev) =>
                prev.map((p) =>
                  p.client_id === existingPuzzleClientId
                    ? { ...p, ...puzzleData, client_id: existingPuzzleClientId }
                    : p
                )
              ); // Ensure client_id is preserved
            } else {
              const newPuzzleWithId = onAddPuzzle(puzzleData);
              onUpdateNodeContent(node.client_id, {
                puzzle_client_id: newPuzzleWithId.client_id,
              });
            }
            setShowPuzzleModal(false);
          }}
        />
      )}
    </div>
  );
};
