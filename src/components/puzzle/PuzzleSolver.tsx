import React, { useState } from 'react';
import { Puzzle } from '../../types';
import Button from '../ui/Button';
import { validateSolution } from '../../utils/ciphers';
import { Send, RotateCcw, HelpCircle, AlertTriangle } from 'lucide-react';

interface PuzzleSolverProps {
  puzzle: Puzzle;
  onSolved: () => void;
  onCancel: () => void;
  huntTitle: string;
}

const PuzzleSolver: React.FC<PuzzleSolverProps> = ({
  puzzle,
  onSolved,
  onCancel,
  huntTitle,
}) => {
  const [solution, setSolution] = useState('');
  const [feedback, setFeedback] = useState<{ message: string; success: boolean } | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [showFirstHint, setShowFirstHint] = useState(false);
  const [showSecondHint, setShowSecondHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [askingForHint, setAskingForHint] = useState(false);
  
  const getFailureMessage = () => {
    if (huntTitle === 'The Lost Library of Alexandria') {
      return "The ancient knowledge slips through your fingers. The secrets of Alexandria remain hidden in the sands of time.";
    } else if (huntTitle === 'Digital Shadows') {
      return "The hackers have outmaneuvered us. The digital trail goes cold, and their plan proceeds unchecked.";
    }
    return "Your quest ends here, but the mystery remains unsolved.";
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!solution.trim()) return;
    
    const isCorrect = validateSolution(
      puzzle.ciphertext, 
      solution, 
      puzzle.cipherType, 
      { ...puzzle.config, plaintext: puzzle.plaintext }
    );
    
    setAttempts(attempts + 1);
    
    if (isCorrect) {
      setFeedback({
        message: 'Success! The puzzle reveals its secrets!',
        success: true
      });
      
      setTimeout(() => {
        onSolved();
      }, 1500);
    } else {
      if (attempts + 1 >= 5) {
        setShowSolution(true);
        setFeedback({
          message: getFailureMessage(),
          success: false
        });
      } else if (attempts + 1 >= 3 && !showFirstHint) {
        setAskingForHint(true);
        setFeedback({
          message: 'Still not correct. Would you like a hint?',
          success: false
        });
      } else if (attempts + 1 >= 4 && !showSecondHint) {
        setAskingForHint(true);
        setFeedback({
          message: 'Would you like another hint?',
          success: false
        });
      } else {
        setFeedback({
          message: 'The solution remains elusive. Try again!',
          success: false
        });
      }
    }
  };
  
  const handleShowHint = () => {
    setAskingForHint(false);
    if (!showFirstHint) {
      setShowFirstHint(true);
    } else {
      setShowSecondHint(true);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border p-4 md:p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-serif text-[#1A3A5A] mb-2">
          {puzzle.title}
        </h2>
        <p className="text-gray-600">{puzzle.description}</p>
      </div>

      <div className="bg-[#F5DEB3]/20 p-3 md:p-4 rounded-md border border-[#D4AF37]/30 mb-6">
        <div className="text-sm text-gray-500 mb-2">Encrypted message:</div>
        <div className="font-mono text-[#1A3A5A] break-words p-3 bg-white rounded border border-[#D4AF37]/20">
          {puzzle.ciphertext}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your Solution
          </label>
          <textarea
            value={solution}
            onChange={(e) => setSolution(e.target.value)}
            placeholder="Enter your solution here..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md min-h-[100px]"
          />
        </div>

        {askingForHint && (
          <div className="bg-[#FEFCE8] p-4 rounded-md border border-[#FEF08A]">
            <p className="text-[#844D0F] mb-3">{feedback?.message}</p>
            <Button
              variant="outline"
              onClick={handleShowHint}
              icon={<HelpCircle size={16} />}
            >
              Show Hint
            </Button>
          </div>
        )}
        
        {!askingForHint && feedback && (
          <div className={`p-4 rounded-md ${
            feedback.success 
              ? 'bg-green-50 border border-green-100' 
              : showSolution 
                ? 'bg-red-50 border border-red-100'
                : 'bg-yellow-50 border border-yellow-100'
          }`}>
            <p className={`flex items-start ${
              feedback.success 
                ? 'text-green-800'
                : showSolution
                  ? 'text-red-800'
                  : 'text-yellow-800'
            }`}>
              {feedback.success ? null : <AlertTriangle size={18} className="mr-2 mt-1 flex-shrink-0" />}
              {feedback.message}
            </p>
          </div>
        )}
        
        {showFirstHint && (
          <div className="bg-[#EEF6FF] p-4 rounded-md border border-[#BFDBFE]">
            <div className="font-medium text-[#1C4ED8] text-sm mb-1">First Hint:</div>
            <p className="text-[#1C4ED8]">{puzzle.first_hint}</p>
          </div>
        )}
        
        {showSecondHint && (
          <div className="bg-[#EEF6FF] p-4 rounded-md border border-[#BFDBFE] mt-2">
            <div className="font-medium text-[#1C4ED8] text-sm mb-1">Second Hint:</div>
            <p className="text-[#1C4ED8]">{puzzle.second_hint}</p>
          </div>
        )}
        
        {showSolution && (
          <div className="mt-6 space-y-4">
            <div className="bg-[#EEF6FF] p-4 rounded-md border border-[#BFDBFE]">
              <div className="font-medium text-[#1C4ED8] text-sm mb-1">Solution:</div>
              <p className="text-[#1C4ED8]">{puzzle.plaintext}</p>
            </div>
            
            <div className="bg-red-50 p-4 rounded-md border border-red-100">
              <p className="text-red-800 text-sm">
                Don't worry! Every failed attempt brings new learning. Why not try another puzzle or start a new hunt?
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
          <Button
            variant="outline"
            onClick={onCancel}
            icon={<RotateCcw size={16} />}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Go Back
          </Button>

          <Button
            type="submit"
            disabled={!solution.trim() || showSolution}
            icon={<Send size={16} />}
            className="w-full sm:w-auto order-1 sm:order-2"
          >
            Submit Solution
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PuzzleSolver;