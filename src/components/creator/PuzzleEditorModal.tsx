// src/components/creator/PuzzleEditorModal.tsx
import React, { useState } from 'react';
import { Puzzle as PuzzleData, CipherType, CipherConfig } from '../../types'; // Use PuzzleData alias
import Button from '../ui/Button';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Label from '../ui/Label';
import Select from '../ui/Select';
import Card, {
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '../ui/Card';
import { cipherInfo } from '../../types'; // Assuming cipherInfo is in types for names
// You'll need a CipherConfiguratorUI component similar to the one in LibraryPage
// For simplicity here, we'll use basic inputs.
// import CipherSpecificConfigInputs from './CipherSpecificConfigInputs';

// Define initial empty puzzle state matching Omit<ClientPuzzle, 'client_id'>
const initialPuzzleState: Omit<ClientPuzzle, 'client_id'> = {
  title: '',
  description: '',
  clue_text: '',
  cipher_type: 'caesar', // Default
  solution: '',
  points: 10,
  hints: { hint1: '', hint2: '' },
  cipher_config: { shift: 3 }, // Default for Caesar
  post_solve_story_node_id: undefined, // Add this to your Puzzle type if not there
};

interface PuzzleEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (puzzleData: Omit<ClientPuzzle, 'client_id'>) => void; // Pass data without client_id
  existingPuzzle?: Omit<ClientPuzzle, 'client_id'>; // For editing
}

export const PuzzleEditorModal: React.FC<PuzzleEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingPuzzle,
}) => {
  const [puzzle, setPuzzle] = useState<Omit<ClientPuzzle, 'client_id'>>(
    existingPuzzle || initialPuzzleState
  );

  const handleChange = (
    field: keyof Omit<ClientPuzzle, 'client_id'>,
    value: any
  ) => {
    setPuzzle((prev) => ({ ...prev, [field]: value }));
  };

  const handleConfigChange = (configField: keyof CipherConfig, value: any) => {
    setPuzzle((prev) => ({
      ...prev,
      cipher_config: { ...(prev.cipher_config || {}), [configField]: value },
    }));
  };

  const handleSubmit = () => {
    // Basic validation
    if (!puzzle.clue_text || !puzzle.solution || !puzzle.cipher_type) {
      alert('Clue, Solution, and Cipher Type are required for a puzzle.');
      return;
    }
    onSave(puzzle);
    setPuzzle(initialPuzzleState); // Reset form
  };

  React.useEffect(() => {
    if (existingPuzzle) {
      setPuzzle(existingPuzzle);
    } else {
      setPuzzle(initialPuzzleState);
    }
  }, [existingPuzzle, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg bg-white shadow-2xl max-h-[90vh] flex flex-col">
        <CardHeader className="border-b">
          <CardTitle className="text-xl font-serif">
            {existingPuzzle ? 'Edit Puzzle' : 'Create New Puzzle'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 py-6 px-6 overflow-y-auto flex-grow">
          <div>
            <Label htmlFor="puzzle-title">Title (Optional)</Label>
            <Input
              id="puzzle-title"
              value={puzzle.title || ''}
              onChange={(e) => handleChange('title', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="puzzle-desc">
              Narrative Context for Clue (Optional)
            </Label>
            <Textarea
              id="puzzle-desc"
              value={puzzle.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={2}
              placeholder="e.g., You find a strange note tucked in a book..."
            />
          </div>
          <div>
            <Label htmlFor="puzzle-clue">
              Clue / Encrypted Text / Riddle{' '}
              <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="puzzle-clue"
              value={puzzle.clue_text}
              onChange={(e) => handleChange('clue_text', e.target.value)}
              rows={3}
              required
            />
          </div>
          <div>
            <Label htmlFor="puzzle-solution">
              Solution <span className="text-red-500">*</span>
            </Label>
            <Input
              id="puzzle-solution"
              value={puzzle.solution}
              onChange={(e) => handleChange('solution', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="puzzle-cipher-type">
              Cipher Type <span className="text-red-500">*</span>
            </Label>
            <Select
              id="puzzle-cipher-type"
              value={puzzle.cipher_type}
              onChange={(e) => {
                const newType = e.target.value as CipherType;
                handleChange('cipher_type', newType);
                // Reset config for new type, or set defaults
                let newConfig: CipherConfig = {};
                if (newType === 'caesar') newConfig.shift = 3;
                if (newType === 'transposition') newConfig.key = 5; // Assuming key is columns
                handleChange('cipher_config', newConfig);
              }}
              options={Object.entries(cipherInfo).map(([key, info]) => ({
                value: key,
                label: info.name,
              }))}
              required
            />
          </div>
          {/* --- Cipher Specific Config Inputs --- */}
          {puzzle.cipher_type === 'caesar' && (
            <div>
              <Label htmlFor="config-shift">Shift Amount (1-25)</Label>
              <Input
                id="config-shift"
                type="number"
                min="1"
                max="25"
                value={(puzzle.cipher_config as CipherConfig)?.shift || ''}
                onChange={(e) =>
                  handleConfigChange(
                    'shift',
                    e.target.value === '' ? undefined : parseInt(e.target.value)
                  )
                }
              />
            </div>
          )}
          {puzzle.cipher_type === 'substitution' && (
            <div>
              <Label htmlFor="config-key-sub">
                Substitution Key (26 unique letters)
              </Label>
              <Input
                id="config-key-sub"
                value={
                  ((puzzle.cipher_config as CipherConfig)?.key as string) || ''
                }
                onChange={(e) =>
                  handleConfigChange(
                    'key',
                    e.target.value.toUpperCase().replace(/[^A-Z]/g, '')
                  )
                }
                maxLength={26}
                className="font-mono"
              />
            </div>
          )}
          {puzzle.cipher_type === 'transposition' && (
            <div>
              <Label htmlFor="config-key-trans">Number of Columns (2-10)</Label>
              <Input
                id="config-key-trans"
                type="number"
                min="2"
                max="10"
                value={
                  ((puzzle.cipher_config as CipherConfig)?.key as number) || ''
                }
                onChange={(e) =>
                  handleConfigChange(
                    'key',
                    e.target.value === '' ? undefined : parseInt(e.target.value)
                  )
                }
              />
            </div>
          )}
          {/* Add more specific config inputs for other cipher types as needed */}

          <div>
            <Label htmlFor="puzzle-points">Points</Label>
            <Input
              id="puzzle-points"
              type="number"
              value={puzzle.points}
              onChange={(e) => handleChange('points', parseInt(e.target.value))}
              min="0"
            />
          </div>
          <div>
            <Label htmlFor="puzzle-hint1">Hint 1 (Optional)</Label>
            <Input
              id="puzzle-hint1"
              value={(puzzle.hints as any)?.hint1 || ''}
              onChange={(e) =>
                handleChange('hints', {
                  ...(puzzle.hints || {}),
                  hint1: e.target.value,
                })
              }
            />
          </div>
          <div>
            <Label htmlFor="puzzle-hint2">Hint 2 (Optional)</Label>
            <Input
              id="puzzle-hint2"
              value={(puzzle.hints as any)?.hint2 || ''}
              onChange={(e) =>
                handleChange('hints', {
                  ...(puzzle.hints || {}),
                  hint2: e.target.value,
                })
              }
            />
          </div>

          {/* Optional: Field for puzzle.post_solve_story_node_id (dropdown to link to another node) */}
          {/* This might be better handled in the NodeConfigurationPanel when linking a puzzle_gate success node */}
        </CardContent>
        <CardFooter className="flex justify-end space-x-3 border-t pt-4 px-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Save Puzzle
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
