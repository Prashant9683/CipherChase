// src/components/hunt/PuzzleEditorModal.tsx
import React, { useState, useEffect } from 'react';
import { Puzzle as PuzzleData, CipherType, CipherConfig, cipherInfo } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Label from '../ui/Label';
import Select from '../ui/Select';
import Card, { CardContent, CardHeader, CardTitle, CardFooter } from '../ui/Card'; // For modal structure

type ClientPuzzleNoId = Omit<PuzzleData, 'id' | 'created_at' | 'creator_id'>;

interface PuzzleEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (puzzleData: ClientPuzzleNoId, existingPuzzleClientId?: string) => void;
    existingPuzzleData?: ClientPuzzleNoId & { client_id?: string }; // client_id for editing
}

const initialPuzzleState: ClientPuzzleNoId = {
    title: '',
    description: '',
    clue_text: '',
    cipher_type: 'caesar', // Default
    solution: '',
    points: 10,
    hints: { hint1: '', hint2: '' },
    cipher_config: { shift: 3 }, // Default for Caesar
    // post_solve_story_node_id removed, as it's handled by puzzle_gate's success_node_id
};

export const PuzzleEditorModal: React.FC<PuzzleEditorModalProps> = ({ isOpen, onClose, onSave, existingPuzzleData }) => {
    const [puzzle, setPuzzle] = useState<ClientPuzzleNoId>(initialPuzzleState);
    const [currentPuzzleClientId, setCurrentPuzzleClientId] = useState<string | undefined>(undefined);


    useEffect(() => {
        if (isOpen) {
            if (existingPuzzleData) {
                const {client_id, ...dataToEdit} = existingPuzzleData;
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
        // Ensure value is number if expected for specific configs
        let processedValue = value;
        if ((configField === 'shift' || (puzzle.cipher_type === 'transposition' && configField === 'key')) && value !== '') {
            processedValue = parseInt(value, 10);
            if (isNaN(processedValue)) processedValue = undefined; // Or handle error
        } else if (configField === 'key' && puzzle.cipher_type === 'substitution' && typeof value === 'string') {
            processedValue = value.toUpperCase().replace(/[^A-Z]/g, '');
        }

        setPuzzle(prev => ({ ...prev, cipher_config: { ...(prev.cipher_config || {}), [configField]: processedValue } }));
    };

    const handleSubmit = () => {
        if (!puzzle.clue_text || !puzzle.solution || !puzzle.cipher_type) {
            alert("Puzzle Clue, Solution, and Cipher Type are required.");
            return;
        }
        onSave(puzzle, currentPuzzleClientId); // Pass client_id if editing
        onClose(); // Close modal after saving
    };

    if (!isOpen) return null;

    // Get available cipher types for the dropdown
    const cipherTypeOptions = Object.entries(cipherInfo).map(([key, info]) => ({ value: key, label: info.name }));

    return (
        // Basic modal structure using div. Your app might have a dedicated Modal component.
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]"> {/* Higher z-index */}
            <Card className="w-full max-w-lg bg-white shadow-xl max-h-[90vh] flex flex-col"> {/* White card */}
                <CardHeader className="border-b">
                    <CardTitle className="text-lg font-semibold text-slate-700">{currentPuzzleClientId ? 'Edit Puzzle' : 'Create New Puzzle'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 py-4 px-6 overflow-y-auto flex-grow">
                    <div><Label htmlFor="puzzle-modal-title">Title (Optional)</Label><Input id="puzzle-modal-title" value={puzzle.title || ''} onChange={e => handleChange('title', e.target.value)} /></div>
                    <div><Label htmlFor="puzzle-modal-desc">Narrative Context for Clue (Optional)</Label><Textarea id="puzzle-modal-desc" value={puzzle.description || ''} onChange={e => handleChange('description', e.target.value)} rows={2} placeholder="e.g., The inscription on the pedestal reads..." /></div>
                    <div><Label htmlFor="puzzle-modal-clue">Clue / Encrypted Text / Riddle <span className="text-red-500">*</span></Label><Textarea id="puzzle-modal-clue" value={puzzle.clue_text} onChange={e => handleChange('clue_text', e.target.value)} rows={3} required /></div>
                    <div><Label htmlFor="puzzle-modal-solution">Solution <span className="text-red-500">*</span></Label><Input id="puzzle-modal-solution" value={puzzle.solution} onChange={e => handleChange('solution', e.target.value)} required /></div>
                    <div>
                        <Label htmlFor="puzzle-modal-cipher-type">Cipher Type <span className="text-red-500">*</span></Label>
                        <Select id="puzzle-modal-cipher-type" value={puzzle.cipher_type}
                                onChange={e => {
                                    const newType = e.target.value as CipherType;
                                    handleChange('cipher_type', newType);
                                    let newConfig: CipherConfig = {}; // Reset/default config
                                    if (newType === 'caesar') newConfig.shift = 3;
                                    if (newType === 'transposition') newConfig.key = 5; // Default columns
                                    // Add other defaults as needed
                                    handleChange('cipher_config', newConfig);
                                }}
                                options={cipherTypeOptions} required
                        />
                    </div>
                    {/* --- Cipher Specific Config Inputs --- */}
                    {/* These use your existing Input components and will inherit their white theme */}
                    {puzzle.cipher_type === 'caesar' && (
                        <div><Label htmlFor="config-modal-shift">Shift Amount (1-25)</Label><Input id="config-modal-shift" type="number" min="1" max="25" value={(puzzle.cipher_config as CipherConfig)?.shift || ''} onChange={e => handleConfigChange('shift', e.target.value)} /></div>
                    )}
                    {puzzle.cipher_type === 'substitution' && (
                        <div><Label htmlFor="config-modal-key-sub">Substitution Key (26 unique letters)</Label><Input id="config-modal-key-sub" value={(puzzle.cipher_config as CipherConfig)?.key as string || ''} onChange={e => handleConfigChange('key', e.target.value)} maxLength={26} className="font-mono"/></div>
                    )}
                    {puzzle.cipher_type === 'transposition' && (
                        <div><Label htmlFor="config-modal-key-trans">Number of Columns (e.g., for Columnar Transposition)</Label><Input id="config-modal-key-trans" type="number" min="2" max="20" value={(puzzle.cipher_config as CipherConfig)?.key as number || ''} onChange={e => handleConfigChange('key', e.target.value)} /></div>
                    )}
                    {/* Add more cipher-specific config inputs here */}
                    <div><Label htmlFor="puzzle-modal-points">Points</Label><Input id="puzzle-modal-points" type="number" value={puzzle.points} onChange={e => handleChange('points', parseInt(e.target.value))} min="0" /></div>
                    <div><Label htmlFor="puzzle-modal-hint1">Hint 1 (Optional)</Label><Input id="puzzle-modal-hint1" value={(puzzle.hints as any)?.hint1 || ''} onChange={e => handleChange('hints', { ...(puzzle.hints || {}), hint1: e.target.value })} /></div>
                    <div><Label htmlFor="puzzle-modal-hint2">Hint 2 (Optional)</Label><Input id="puzzle-modal-hint2" value={(puzzle.hints as any)?.hint2 || ''} onChange={e => handleChange('hints', { ...(puzzle.hints || {}), hint2: e.target.value })} /></div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-2 border-t pt-3 px-6">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button variant="primary" onClick={handleSubmit}>Save Puzzle</Button>
                </CardFooter>
            </Card>
        </div>
    );
};
