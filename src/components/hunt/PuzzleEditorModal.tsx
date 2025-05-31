// src/components/hunt/PuzzleEditorModal.tsx

import React, { useState, useEffect } from 'react';
import { Puzzle as PuzzleData, CipherType, CipherConfig, cipherInfo } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Label from '../ui/Label';
import Select from '../ui/Select';
import Card, { CardContent, CardHeader, CardTitle, CardFooter } from '../ui/Card';

type ClientPuzzleNoId = Omit<PuzzleData, 'id' | 'created_at'>;

interface PuzzleEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (puzzleData: ClientPuzzleNoId, existingPuzzleClientId?: string) => void;
    existingPuzzleData?: ClientPuzzleNoId & { client_id?: string };
}

const initialPuzzleState: ClientPuzzleNoId = {
    title: '',
    description: '',
    clue_text: '',
    cipher_type: 'caesar',
    solution: '',
    points: 10,
    sequence: 1,  // Add default sequence
    hints: { hint1: '', hint2: '' },
    cipher_config: { shift: 3 },
};

export const PuzzleEditorModal: React.FC<PuzzleEditorModalProps> = ({
                                                                        isOpen,
                                                                        onClose,
                                                                        onSave,
                                                                        existingPuzzleData
                                                                    }) => {
    const [puzzle, setPuzzle] = useState<ClientPuzzleNoId>(initialPuzzleState);
    const [currentPuzzleClientId, setCurrentPuzzleClientId] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (isOpen) {
            if (existingPuzzleData) {
                const { client_id, ...dataToEdit } = existingPuzzleData;
                setPuzzle(dataToEdit);
                setCurrentPuzzleClientId(client_id);
            } else {
                setPuzzle(initialPuzzleState);
                setCurrentPuzzleClientId(undefined);
            }
        }
    }, [isOpen, existingPuzzleData]);

    const handleChange = (field: keyof ClientPuzzleNoId, value: any) => {
        setPuzzle(prev => ({ ...prev, [field]: value }));
    };

    const handleConfigChange = (configField: keyof CipherConfig, value: any) => {
        let processedValue = value;
        if ((configField === 'shift' || (puzzle.cipher_type === 'transposition' && configField === 'key')) && value !== '') {
            processedValue = parseInt(value, 10);
            if (isNaN(processedValue)) processedValue = undefined;
        } else if (configField === 'key' && puzzle.cipher_type === 'substitution' && typeof value === 'string') {
            processedValue = value.toUpperCase().replace(/[^A-Z]/g, '');
        }

        setPuzzle(prev => ({
            ...prev,
            cipher_config: { ...(prev.cipher_config || {}), [configField]: processedValue }
        }));
    };

    const handleSubmit = () => {
        if (!puzzle.clue_text || !puzzle.solution || !puzzle.cipher_type) {
            alert("Puzzle Clue, Solution, and Cipher Type are required.");
            return;
        }

        onSave(puzzle, currentPuzzleClientId);
        onClose();
    };

    if (!isOpen) return null;

    const cipherTypeOptions = Object.entries(cipherInfo).map(([key, info]) => ({
        value: key,
        label: info.name
    }));

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {currentPuzzleClientId ? 'Edit Puzzle' : 'Create New Puzzle'}
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="title">Title (Optional)</Label>
                            <Input
                                id="title"
                                value={puzzle.title || ''}
                                onChange={(e) => handleChange('title', e.target.value)}
                            />
                        </div>

                        <div>
                            <Label htmlFor="description">Narrative Context for Clue (Optional)</Label>
                            <Textarea
                                id="description"
                                value={puzzle.description || ''}
                                onChange={(e) => handleChange('description', e.target.value)}
                                rows={2}
                                placeholder="e.g., The inscription on the pedestal reads..."
                            />
                        </div>

                        <div>
                            <Label htmlFor="clue_text">Clue / Encrypted Text / Riddle *</Label>
                            <Textarea
                                id="clue_text"
                                value={puzzle.clue_text}
                                onChange={(e) => handleChange('clue_text', e.target.value)}
                                rows={3}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="solution">Solution *</Label>
                            <Input
                                id="solution"
                                value={puzzle.solution}
                                onChange={(e) => handleChange('solution', e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="cipher_type">Cipher Type *</Label>
                            <Select
                                value={puzzle.cipher_type}
                                onValueChange={(value) => {
                                    const newType = value as CipherType;
                                    handleChange('cipher_type', newType);
                                    let newConfig: CipherConfig = {};
                                    if (newType === 'caesar') newConfig.shift = 3;
                                    if (newType === 'transposition') newConfig.key = 5;
                                    handleChange('cipher_config', newConfig);
                                }}
                                options={cipherTypeOptions}
                                required
                            />
                        </div>

                        {/* Cipher Specific Config Inputs */}
                        {puzzle.cipher_type === 'caesar' && (
                            <div>
                                <Label htmlFor="shift">Shift Amount (1-25)</Label>
                                <Input
                                    id="shift"
                                    type="number"
                                    min="1"
                                    max="25"
                                    value={puzzle.cipher_config?.shift || ''}
                                    onChange={(e) => handleConfigChange('shift', e.target.value)}
                                />
                            </div>
                        )}

                        {puzzle.cipher_type === 'substitution' && (
                            <div>
                                <Label htmlFor="substitution_key">Substitution Key (26 unique letters)</Label>
                                <Input
                                    id="substitution_key"
                                    value={puzzle.cipher_config?.key || ''}
                                    onChange={(e) => handleConfigChange('key', e.target.value)}
                                    maxLength={26}
                                    className="font-mono"
                                />
                            </div>
                        )}

                        {puzzle.cipher_type === 'transposition' && (
                            <div>
                                <Label htmlFor="columns">Number of Columns (e.g., for Columnar Transposition)</Label>
                                <Input
                                    id="columns"
                                    type="number"
                                    min="2"
                                    max="10"
                                    value={puzzle.cipher_config?.key || ''}
                                    onChange={(e) => handleConfigChange('key', e.target.value)}
                                />
                            </div>
                        )}

                        <div>
                            <Label htmlFor="points">Points</Label>
                            <Input
                                id="points"
                                type="number"
                                min="0"
                                value={puzzle.points}
                                onChange={(e) => handleChange('points', parseInt(e.target.value))}
                            />
                        </div>

                        <div>
                            <Label htmlFor="sequence">Sequence (Order in Hunt)</Label>
                            <Input
                                id="sequence"
                                type="number"
                                min="1"
                                value={puzzle.sequence || 1}
                                onChange={(e) => handleChange('sequence', parseInt(e.target.value))}
                            />
                        </div>

                        <div>
                            <Label htmlFor="hint1">Hint 1 (Optional)</Label>
                            <Textarea
                                id="hint1"
                                value={puzzle.hints?.hint1 || ''}
                                onChange={(e) => handleChange('hints', { ...(puzzle.hints || {}), hint1: e.target.value })}
                            />
                        </div>

                        <div>
                            <Label htmlFor="hint2">Hint 2 (Optional)</Label>
                            <Textarea
                                id="hint2"
                                value={puzzle.hints?.hint2 || ''}
                                onChange={(e) => handleChange('hints', { ...(puzzle.hints || {}), hint2: e.target.value })}
                            />
                        </div>
                    </CardContent>

                    <CardFooter className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit}>
                            Save Puzzle
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};
