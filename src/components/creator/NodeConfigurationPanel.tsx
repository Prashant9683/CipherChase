// src/components/creator/NodeConfigurationPanel.tsx
import React from 'react';
import {
  StoryNode,
  Puzzle as PuzzleData,
  HuntChoice,
  CipherType,
} from '../../types'; // Use PuzzleData alias
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Label from '../ui/Label';
import Button from '../ui/Button';
import Select from '../ui/Select'; // Assume you create this
import { PuzzleEditorModal } from './PuzzleEditorModal'; // Create this next
import { PlusCircle, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

type ClientStoryNode = Omit<StoryNode, 'id' | 'hunt_id' | 'created_at'> & {
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
};
type ClientPuzzle = Omit<PuzzleData, 'id' | 'created_at' | 'creator_id'> & {
  client_id: string;
};

interface NodeConfigurationPanelProps {
  node: ClientStoryNode;
  allNodes: ClientStoryNode[];
  allPuzzles: ClientPuzzle[];
  onUpdateNode: (clientId: string, updates: Partial<ClientStoryNode>) => void;
  onUpdateNodeContent: (
    clientId: string,
    contentUpdates: Partial<ClientStoryNode['content']>
  ) => void;
  onUpdateNodeChoices: (
    clientId: string,
    choices: ClientStoryNode['choices']
  ) => void;
  onSetAsStartingNode: (clientId: string) => void;
  onAddPuzzle: (newPuzzle: Omit<ClientPuzzle, 'client_id'>) => ClientPuzzle; // Returns the added puzzle with a client_id
}

export const NodeConfigurationPanel: React.FC<NodeConfigurationPanelProps> = ({
  node,
  allNodes,
  allPuzzles,
  onUpdateNodeContent,
  onUpdateNodeChoices,
  onSetAsStartingNode,
  onAddPuzzle,
}) => {
  const [showPuzzleModal, setShowPuzzleModal] = useState(false);

  const handleContentChange = (
    field: keyof StoryNode['content'],
    value: any
  ) => {
    onUpdateNodeContent(node.client_id, { [field]: value });
  };

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
    .filter((n) => n.client_id !== node.client_id) // Cannot link to self
    .map((n) => ({
      value: n.client_id,
      label: `Node ${n.display_order + 1}: ${n.node_type}`,
    }));

  const puzzleOptions = allPuzzles.map((p) => ({
    value: p.client_id,
    label: p.title || `Puzzle ${p.client_id.substring(0, 6)}`,
  }));

  // Choice management
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
    field: 'choice_text' | 'next_node_client_id',
    value: string
  ) => {
    const updatedChoices = (node.choices || []).map((c) =>
      c.client_id === choiceClientId ? { ...c, [field]: value } : c
    );
    onUpdateNodeChoices(node.client_id, updatedChoices);
  };

  const deleteChoice = (choiceClientId: string) => {
    const updatedChoices = (node.choices || []).filter(
      (c) => c.client_id !== choiceClientId
    );
    onUpdateNodeChoices(node.client_id, updatedChoices);
  };

  const renderContentFields = () => {
    switch (node.node_type) {
      case 'narrative_block':
      case 'story_update':
        return (
          <>
            <div>
              <Label htmlFor={`node-text-${node.client_id}`}>
                Narrative Text
              </Label>
              <Textarea
                id={`node-text-${node.client_id}`}
                value={node.content.text || ''}
                onChange={(e) => handleContentChange('text', e.target.value)}
                rows={5}
                placeholder="The story unfolds..."
              />
            </div>
            {node.node_type !== 'story_update' && ( // story_update usually doesn't have its own next_node_id, it's determined by puzzle success
              <div>
                <Label htmlFor={`node-next-${node.client_id}`}>
                  Next Node (if this is not an end)
                </Label>
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
          </>
        );
      case 'dialogue_message':
        return (
          <>
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
                placeholder="e.g., Alex or Narrator"
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
                placeholder="The message content..."
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
                placeholder="e.g., 9:22 PM"
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
                  { value: 'sms', label: 'SMS/Chat' },
                  { value: 'email', label: 'Email' },
                  { value: 'note', label: 'Handwritten Note' },
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
          </>
        );
      case 'visual_cue':
        return (
          <>
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
                placeholder="https://..."
              />
            </div>
            {/* TODO: Add ImageUploader component here later */}
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
          </>
        );
      case 'puzzle_interaction':
        return (
          <>
            <div>
              <Label htmlFor={`node-puzzleprompt-${node.client_id}`}>
                Prompt Text (before puzzle)
              </Label>
              <Textarea
                id={`node-puzzleprompt-${node.client_id}`}
                value={node.content.prompt_text || ''}
                onChange={(e) =>
                  handleContentChange('prompt_text', e.target.value)
                }
                rows={2}
                placeholder="e.g., You find a locked box with a strange inscription..."
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
                  onClick={() => setShowPuzzleModal(true)}
                >
                  Create New Puzzle
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor={`node-successnext-${node.client_id}`}>
                Next Node on Success
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
                Next Node on Failure (Optional)
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
          </>
        );
      case 'player_choice':
        return (
          <>
            <div>
              <Label htmlFor={`node-choiceprompt-${node.client_id}`}>
                Choice Prompt
              </Label>
              <Textarea
                id={`node-choiceprompt-${node.client_id}`}
                value={node.content.prompt || ''}
                onChange={(e) => handleContentChange('prompt', e.target.value)}
                rows={2}
                placeholder="e.g., What path do you choose?"
              />
            </div>
            <div className="space-y-3 mt-3">
              <Label>Choices:</Label>
              {(node.choices || []).map((choice, index) => (
                <div
                  key={choice.client_id}
                  className="p-3 border border-slate-200 rounded-md space-y-2"
                >
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
                  {/* Optional: Field for choice.story_state_update JSON */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteChoice(choice.client_id)}
                    className="text-red-500 hover:bg-red-50 float-right"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addChoice}
                icon={<PlusCircle size={16} />}
              >
                Add Choice Option
              </Button>
            </div>
          </>
        );
      case 'end_hunt':
        return (
          <>
            <div>
              <Label htmlFor={`node-endmessage-${node.client_id}`}>
                End Message
              </Label>
              <Textarea
                id={`node-endmessage-${node.client_id}`}
                value={node.content.message || ''}
                onChange={(e) => handleContentChange('message', e.target.value)}
                rows={3}
                placeholder="e.g., Congratulations, you solved the mystery!"
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
                  { value: 'failure', label: 'Failure' },
                ]}
              />
            </div>
          </>
        );
      // Add 'action_trigger' later
      default:
        return (
          <p className="text-sm text-slate-500">
            Configuration for '{node.node_type}' coming soon.
          </p>
        );
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-slate-200 space-y-4">
      <h4 className="text-md font-semibold text-slate-600">
        Configure Node:{' '}
        {node.node_type
          .replace('_', ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase())}
      </h4>
      {!node.is_starting_node && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSetAsStartingNode(node.client_id)}
        >
          Set as Starting Node
        </Button>
      )}
      {renderContentFields()}
      {showPuzzleModal && (
        <PuzzleEditorModal
          isOpen={showPuzzleModal}
          onClose={() => setShowPuzzleModal(false)}
          onSave={(puzzleData) => {
            const newPuzzleWithClientId = onAddPuzzle(puzzleData); // Add puzzle to global list, get its client_id
            onUpdateNodeContent(node.client_id, {
              puzzle_client_id: newPuzzleWithClientId.client_id,
            }); // Link it
            setShowPuzzleModal(false);
          }}
        />
      )}
    </div>
  );
};
