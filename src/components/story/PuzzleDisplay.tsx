// src/components/story/PuzzleDisplay.tsx
import React, { useState } from 'react';
import { Puzzle as PuzzleData, UserHuntProgress } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Label } from '../ui/Label';
import Card from '../ui/Card'; // Assuming Card has no internal padding if used directly
import {
  Puzzle as PuzzleIcon,
  Lightbulb,
  Send,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import ExpandableText from '../ui/ExpandableText';
import { motion, AnimatePresence } from 'framer-motion';

interface PuzzleDisplayProps {
  puzzle: PuzzleData;
  storyState: UserHuntProgress['story_state'];
  onSubmitAttempt: (
    attempt: string
  ) => Promise<{ isCorrect: boolean; feedback?: string }>;
  onRevealHint?: (
    puzzleId: string,
    hintKey: 'hint1' | 'hint2'
  ) => Promise<{ text: string; newScore?: number } | null>;
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
    type: 'success' | 'error';
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [revealedHints, setRevealedHints] = useState<Record<string, string>>(
    {}
  );
  const [hintLoading, setHintLoading] = useState<Record<string, boolean>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attempt.trim()) {
      setFeedback({ text: 'Please enter an answer.', type: 'error' });
      return;
    }
    setIsLoading(true);
    setFeedback(null);
    const result = await onSubmitAttempt(attempt);
    setFeedback({
      text:
        result.feedback ||
        (result.isCorrect
          ? 'Correct! Proceeding...'
          : "That's not quite right."),
      type: result.isCorrect ? 'success' : 'error',
    });
    if (result.isCorrect) {
      // Parent (HuntPlayerPage) handles navigation.
      // Consider not clearing attempt on correct immediately to show the answer they got right.
    }
    setIsLoading(false);
  };

  const handleRevealHintClick = async (hintKey: 'hint1' | 'hint2') => {
    if (!onRevealHint || revealedHints[hintKey]) return;
    setHintLoading((prev) => ({ ...prev, [hintKey]: true }));
    try {
      const result = await onRevealHint(puzzle.id, hintKey);
      if (result?.text) {
        setRevealedHints((prev) => ({ ...prev, [hintKey]: result.text }));
      } else {
        setFeedback({
          text: 'Could not reveal hint (perhaps not enough points?).',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Error revealing hint:', error);
      setFeedback({ text: 'Error revealing hint.', type: 'error' });
    } finally {
      setHintLoading((prev) => ({ ...prev, [hintKey]: false }));
    }
  };

  const getHintData = (
    hintKey: 'hint1' | 'hint2'
  ): { text: string; cost?: number } | null => {
    if (
      puzzle.hints &&
      typeof puzzle.hints === 'object' &&
      puzzle.hints !== null
    ) {
      return (puzzle.hints as any)[hintKey] || null;
    }
    return null;
  };
  const hint1Data = getHintData('hint1');
  const hint2Data = getHintData('hint2');

  return (
    <div className="bg-white dark:bg-slate-800 p-5 md:p-6 rounded-lg border border-blue-200 dark:border-blue-700/50 shadow-lg">
      <div className="space-y-5">
        {puzzle.title && (
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 font-serif flex items-center">
            <PuzzleIcon
              size={22}
              className="mr-2.5 text-blue-600 dark:text-blue-400"
            />
            {puzzle.title}
          </h2>
        )}

        {puzzle.description && (
          <div className="text-sm text-slate-600 dark:text-slate-300 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md border border-slate-200 dark:border-slate-600">
            <ExpandableText
              text={puzzle.description}
              initialLineClamp={3}
              textClassName="italic"
            />
          </div>
        )}

        <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700 shadow-inner">
          <Label className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
            The Challenge:
          </Label>
          <p className="text-md text-slate-800 dark:text-slate-100 whitespace-pre-wrap font-medium mt-1">
            {puzzle.clue_text}
          </p>
        </div>

        {(hint1Data || hint2Data) && (
          <div className="space-y-2 pt-2">
            {/* ... Hint rendering logic with motion.div for reveal animation ... */}
            {hint1Data && !revealedHints.hint1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRevealHintClick('hint1')}
                icon={<Lightbulb size={14} />}
                className="text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/50"
                isLoading={hintLoading.hint1}
                disabled={hintLoading.hint1 || isLoading}
              >
                Reveal Hint 1 {hint1Data.cost ? `(${hint1Data.cost} pts)` : ''}
              </Button>
            )}
            <AnimatePresence>
              {revealedHints.hint1 && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 p-2.5 rounded border border-amber-200 dark:border-amber-700 shadow-sm overflow-hidden"
                >
                  <strong>Hint 1:</strong> {revealedHints.hint1}
                </motion.p>
              )}
            </AnimatePresence>
            {/* Similar logic for Hint 2 */}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 pt-3">
          <div>
            <Label
              htmlFor={`puzzle-solution-${puzzle.id}`}
              className="text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Your Solution:
            </Label>
            <Input
              id={`puzzle-solution-${puzzle.id}`}
              type="text"
              value={attempt}
              onChange={(e) => setAttempt(e.target.value)}
              className="mt-1 w-full text-base"
              placeholder="Decipher the message..."
              required
              disabled={isLoading}
            />
          </div>
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex items-center text-sm font-medium p-2.5 rounded-md ${
                  feedback.type === 'success'
                    ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-700'
                    : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-700'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle size={18} className="mr-2" />
                ) : (
                  <XCircle size={18} className="mr-2" />
                )}
                {feedback.text}
              </motion.div>
            )}
          </AnimatePresence>
          <Button
            type="submit"
            variant="primary"
            fullWidth
            size="lg"
            icon={<Send size={18} />}
            isLoading={isLoading}
            disabled={isLoading}
          >
            Submit Solution
          </Button>
        </form>
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center pt-2">
          Points for this puzzle: {puzzle.points || 0}
        </p>
      </div>
    </div>
  );
};

export default PuzzleDisplay;
