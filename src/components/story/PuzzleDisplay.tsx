// src/components/story/PuzzleDisplay.tsx
import React, { useState } from 'react';
import { Puzzle as PuzzleData, UserHuntProgress, cipherInfo } from '../../types'; // Assuming cipherInfo is in types
import Button from '../ui/Button';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea'; // Assuming you want Textarea for solution input
import { Label } from '../ui/Label';
// import PuzzleCard from '../puzzle/PuzzleCard'; // <<< REMOVE THIS IMPORT
import { Brain, Send, HelpCircle, Lightbulb, CheckCircle, XCircle } from 'lucide-react';
import ExpandableText from '../ui/ExpandableText'; // Keep if used for description/hints

interface PuzzleDisplayProps {
    puzzle: PuzzleData; // The active puzzle to display and solve
    storyState: UserHuntProgress['story_state']; // Current story state (e.g., for conditional hints)
    onSubmitAttempt: (attempt: string) => Promise<{ isCorrect: boolean; feedback?: string }>;
    // Optional: If hints are managed and revealed via a service call
    onRevealHint?: (puzzleId: string, hintKey: 'hint1' | 'hint2') => Promise<{ text: string; newScore?: number } | null>;
}

const PuzzleDisplay: React.FC<PuzzleDisplayProps> = ({
                                                         puzzle,
                                                         storyState,
                                                         onSubmitAttempt,
                                                         onRevealHint,
                                                     }) => {
    const [attempt, setAttempt] = useState('');
    const [feedback, setFeedback] = useState<{
        text: string;
        type: 'success' | 'error' | 'info'; // Added 'info' for general messages
    } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [revealedHints, setRevealedHints] = useState<Record<string, string>>({});
    const [hintLoading, setHintLoading] = useState<Record<string, boolean>>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!attempt.trim()) {
            setFeedback({ text: 'Please enter your solution.', type: 'error' });
            return;
        }
        setIsLoading(true);
        setFeedback(null); // Clear previous feedback
        try {
            const result = await onSubmitAttempt(attempt);
            setFeedback({
                text: result.feedback || (result.isCorrect ? 'Correct!' : 'Not quite right...'),
                type: result.isCorrect ? 'success' : 'error',
            });
            if (result.isCorrect) {
                // Attempt is cleared by HuntPlayerPage moving to next node usually
            }
        } catch (error) {
            console.error("Error submitting puzzle attempt:", error);
            setFeedback({ text: "An error occurred while submitting your answer.", type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRevealHintClick = async (hintKey: 'hint1' | 'hint2') => {
        if (!onRevealHint || revealedHints[hintKey] || hintLoading[hintKey]) return;

        setHintLoading((prev) => ({ ...prev, [hintKey]: true }));
        try {
            const result = await onRevealHint(puzzle.id, hintKey);
            if (result?.text) {
                setRevealedHints((prev) => ({ ...prev, [hintKey]: result.text }));
                // Optionally update score if hint costs points (handle in HuntPlayerPage)
            } else {
                setFeedback({ text: `Hint '${hintKey}' is not available.`, type: 'info'});
            }
        } catch (error) {
            console.error('Error revealing hint:', error);
            setFeedback({ text: 'Failed to reveal hint.', type: 'error' });
        } finally {
            setHintLoading((prev) => ({ ...prev, [hintKey]: false }));
        }
    };

    const currentCipherInfo = cipherInfo[puzzle.cipher_type];

    return (
        <div className="puzzle-display space-y-6 p-4 md:p-6 bg-slate-50 dark:bg-slate-800 rounded-lg shadow">
            {puzzle.title && (
                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-100 font-serif border-b border-slate-200 dark:border-slate-700 pb-2 mb-3">
                    {puzzle.title}
                </h3>
            )}

            {puzzle.description && (
                <div className="text-sm text-slate-600 dark:text-slate-300 prose prose-sm dark:prose-invert max-w-none">
                    <p className="font-medium text-xs uppercase text-slate-500 dark:text-slate-400">Context:</p>
                    <ExpandableText text={puzzle.description} initialLineClamp={3} />
                </div>
            )}

            <div className="p-3 bg-slate-100 dark:bg-slate-700/50 rounded-md">
                <Label htmlFor={`puzzle-clue-${puzzle.id}`} className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase block mb-1">
                    The Enigma:
                </Label>
                <p id={`puzzle-clue-${puzzle.id}`} className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap text-sm md:text-base">
                    {puzzle.clue_text}
                </p>
                {currentCipherInfo && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                        Type: <span className="font-medium">{currentCipherInfo.name}</span>
                    </p>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label htmlFor={`solution-attempt-${puzzle.id}`} className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                        Your Solution:
                    </Label>
                    <Textarea // Using Textarea for potentially multi-line solutions
                        id={`solution-attempt-${puzzle.id}`}
                        value={attempt}
                        onChange={(e) => setAttempt(e.target.value)}
                        placeholder="Decipher the message..."
                        className="mt-1 min-h-[80px]" // Assuming your Textarea takes className
                        rows={3}
                        disabled={isLoading}
                    />
                </div>

                {feedback && (
                    <div
                        className={`p-3 text-sm rounded-md flex items-center gap-2 ${
                            feedback.type === 'success' ? 'bg-green-100 dark:bg-green-800/30 text-green-700 dark:text-green-300' :
                                feedback.type === 'error' ? 'bg-red-100 dark:bg-red-800/30 text-red-700 dark:text-red-300' :
                                    'bg-blue-100 dark:bg-blue-800/30 text-blue-700 dark:text-blue-300' // Info type
                        }`}
                    >
                        {feedback.type === 'success' && <CheckCircle size={20} />}
                        {feedback.type === 'error' && <XCircle size={20} />}
                        {feedback.type === 'info' && <HelpCircle size={20} />}
                        <span>{feedback.text}</span>
                    </div>
                )}

                <Button type="submit" fullWidth size="lg" icon={<Send size={18} />} disabled={isLoading || !attempt.trim()}>
                    {isLoading ? 'Verifying...' : 'Submit Solution'}
                </Button>
            </form>

            {/* Hints Section */}
            {(puzzle.hints?.hint1 || puzzle.hints?.hint2) && (
                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Need a nudge?</p>
                    {puzzle.hints?.hint1 && (
                        <div>
                            {!revealedHints['hint1'] ? (
                                <Button
                                    variant="ghost" size="sm"
                                    onClick={() => handleRevealHintClick('hint1')}
                                    disabled={hintLoading['hint1']}
                                    icon={<Lightbulb size={14} />}
                                    className="text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
                                >
                                    {hintLoading['hint1'] ? 'Revealing...' : `Reveal Hint 1 ${puzzle.hints.cost1 ? `(-${puzzle.hints.cost1} pts)` : ''}`}
                                </Button>
                            ) : (
                                <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-md text-xs text-amber-700 dark:text-amber-300">
                                    <strong>Hint 1:</strong> {revealedHints['hint1']}
                                </div>
                            )}
                        </div>
                    )}
                    {puzzle.hints?.hint2 && revealedHints['hint1'] && ( // Show Hint 2 button only if Hint 1 is revealed
                        <div>
                            {!revealedHints['hint2'] ? (
                                <Button
                                    variant="ghost" size="sm"
                                    onClick={() => handleRevealHintClick('hint2')}
                                    disabled={hintLoading['hint2']}
                                    icon={<Lightbulb size={14} />}
                                    className="text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
                                >
                                    {hintLoading['hint2'] ? 'Revealing...' : `Reveal Hint 2 ${puzzle.hints.cost2 ? `(-${puzzle.hints.cost2} pts)` : ''}`}
                                </Button>
                            ) : (
                                <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-md text-xs text-amber-700 dark:text-amber-300">
                                    <strong>Hint 2:</strong> {revealedHints['hint2']}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PuzzleDisplay;
