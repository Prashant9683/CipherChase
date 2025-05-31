import React, { useState, useEffect } from 'react';
import { TreasureHunt } from '../../types';
import PuzzleCard from '../puzzle/PuzzleCard';
import PuzzleSolver from '../puzzle/PuzzleSolver';
import Button from '../ui/Button';
import { ArrowLeft, Map, Trophy, Clock, Target, Book } from 'lucide-react';

interface HuntSolverProps {
  hunt: TreasureHunt;
  onBack: () => void;
}

const HuntSolver: React.FC<HuntSolverProps> = ({ hunt, onBack }) => {
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [solvingActive, setSolvingActive] = useState(false);
  const [solvedPuzzles, setSolvedPuzzles] = useState<string[]>([]);
  const [huntCompleted, setHuntCompleted] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [showStory, setShowStory] = useState(true);
  
  useEffect(() => {
    if (!startTime) {
      setStartTime(new Date());
    }
    
    if (solvedPuzzles.length === hunt.puzzles.length && !huntCompleted) {
      setHuntCompleted(true);
      setEndTime(new Date());
    }
  }, [solvedPuzzles, hunt.puzzles.length, huntCompleted, startTime]);
  
  const handleStartSolving = () => {
    setSolvingActive(true);
    setShowStory(false);
  };
  
  const handlePuzzleSolved = () => {
    const solvedPuzzleId = hunt.puzzles[currentPuzzleIndex].id;
    setSolvedPuzzles([...solvedPuzzles, solvedPuzzleId]);
    setSolvingActive(false);
    
    if (currentPuzzleIndex < hunt.puzzles.length - 1) {
      setCurrentPuzzleIndex(currentPuzzleIndex + 1);
      setShowStory(true);
    }
  };
  
  const calculateCompletionTime = () => {
    if (!startTime || !endTime) return '';
    
    const timeDiff = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
    const hours = Math.floor(timeDiff / 3600);
    const minutes = Math.floor((timeDiff % 3600) / 60);
    const seconds = timeDiff % 60;
    
    return `${hours > 0 ? `${hours}h ` : ''}${minutes}m ${seconds}s`;
  };
  
  const getCurrentStory = () => {
    const puzzle = hunt.puzzles[currentPuzzleIndex];
    let story = '';
    
    if (currentPuzzleIndex === 0) {
      story = hunt.story_context || '';
    } else {
      // Add transition story based on the previous puzzle solution
      const prevPuzzle = hunt.puzzles[currentPuzzleIndex - 1];
      story = `Having solved ${prevPuzzle.title}, you've discovered that ${puzzle.description}`;
    }
    
    return story;
  };
  
  const getSuccessMessage = () => {
    if (hunt.title === 'The Lost Library of Alexandria') {
      return "The ancient chamber opens before you, revealing countless scrolls preserved through the ages. The lost knowledge of Alexandria is finally rediscovered, and with it, the wisdom of antiquity flows back into the world.";
    } else if (hunt.title === 'Digital Shadows') {
      return "With seconds to spare, you've cracked their final encryption. The cyber attack has been thwarted, and the digital infrastructure remains secure. Your name will be whispered in awe through the cyber security community.";
    }
    return "Congratulations on completing this treasure hunt!";
  };
  
  if (huntCompleted) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-lg border">
        <div className="mb-6">
          <Trophy className="w-16 h-16 mx-auto text-[#D4AF37]" />
        </div>
        
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-serif text-[#1A3A5A] mb-4">
            Victory!
          </h2>
          
          <p className="text-xl text-gray-700 mb-6">
            {getSuccessMessage()}
          </p>
          
          <div className="flex justify-center space-x-8 mb-8">
            <div className="text-center">
              <Clock className="w-8 h-8 mx-auto text-[#1A3A5A] mb-2" />
              <p className="text-sm text-gray-500">Time to Complete</p>
              <p className="font-medium text-[#1A3A5A]">{calculateCompletionTime()}</p>
            </div>
            
            <div className="text-center">
              <Target className="w-8 h-8 mx-auto text-[#1A3A5A] mb-2" />
              <p className="text-sm text-gray-500">Challenges Overcome</p>
              <p className="font-medium text-[#1A3A5A]">{hunt.puzzles.length}</p>
            </div>
          </div>
          
          <div className="bg-[#F5DEB3]/20 p-6 rounded-md border border-[#D4AF37]/30 mb-8">
            <h3 className="font-medium text-[#1A3A5A] mb-4">Your Journey:</h3>
            <div className="space-y-3">
              {hunt.puzzles.map((puzzle, index) => (
                <div key={puzzle.id} className="flex items-center bg-white p-3 rounded border border-[#D4AF37]/20">
                  <span className="w-8 h-8 flex items-center justify-center bg-[#D4AF37]/10 rounded-full text-[#D4AF37] font-medium mr-3">
                    {index + 1}
                  </span>
                  <div className="flex-1 text-left">
                    <h4 className="font-medium text-[#1A3A5A]">{puzzle.title}</h4>
                    <p className="text-sm text-gray-600">{puzzle.description}</p>
                  </div>
                  <span className="text-green-500 ml-3">✓</span>
                </div>
              ))}
            </div>
          </div>
          
          <Button 
            variant="primary" 
            onClick={onBack}
            size="lg"
          >
            Seek Another Adventure
          </Button>
        </div>
      </div>
    );
  }
  
  if (solvingActive) {
    return (
      <PuzzleSolver
        puzzle={hunt.puzzles[currentPuzzleIndex]}
        onSolved={handlePuzzleSolved}
        onCancel={() => {
          setSolvingActive(false);
          setShowStory(true);
        }}
        huntTitle={hunt.title}
      />
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="bg-[#1A3A5A] text-white p-6 rounded-lg shadow-md">
        <button 
          onClick={onBack} 
          className="inline-flex items-center text-gray-300 hover:text-white mb-4"
        >
          <ArrowLeft size={16} className="mr-1" /> Back to hunts
        </button>
        
        <h2 className="text-3xl font-serif mb-4">{hunt.title}</h2>
        
        {showStory && (
          <div className="bg-black/20 p-4 rounded-md mb-4">
            <div className="flex items-center mb-2">
              <Book className="h-5 w-5 mr-2 text-[#D4AF37]" />
              <span className="text-[#D4AF37] font-medium">Story Update</span>
            </div>
            <p className="text-gray-200 italic leading-relaxed">
              {getCurrentStory()}
            </p>
          </div>
        )}
        
        <div className="flex items-center text-sm">
          <div className="mr-6">
            <Map className="inline-block mr-1 h-4 w-4" />
            <span>Progress: {Math.round((solvedPuzzles.length / hunt.puzzles.length) * 100)}%</span>
          </div>
          <div>
            <Clock className="inline-block mr-1 h-4 w-4" />
            <span>Time: {calculateCompletionTime() || '00:00'}</span>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h3 className="text-xl font-medium text-[#1A3A5A] mb-4">
          Current Challenge ({currentPuzzleIndex + 1} of {hunt.puzzles.length})
        </h3>
        
        <PuzzleCard
          puzzle={hunt.puzzles[currentPuzzleIndex]}
          onSolve={handleStartSolving}
        />
      </div>
      
      {solvedPuzzles.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-xl font-medium text-[#1A3A5A] mb-4">Journey Log</h3>
          
          <div className="space-y-3">
            {hunt.puzzles.filter(puzzle => solvedPuzzles.includes(puzzle.id)).map((puzzle, index) => (
              <div key={puzzle.id} className="flex items-center bg-gray-50 p-3 rounded border border-gray-100">
                <span className="w-8 h-8 flex items-center justify-center bg-green-100 rounded-full text-green-600 font-medium mr-3">
                  {index + 1}
                </span>
                <div>
                  <h4 className="font-medium text-[#1A3A5A]">{puzzle.title}</h4>
                  <p className="text-sm text-gray-600">{puzzle.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HuntSolver;