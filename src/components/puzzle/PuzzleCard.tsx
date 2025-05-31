import React from 'react';
import { Puzzle } from '../../types';
import Card, { CardContent, CardHeader, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import { Key, Brain, AlertTriangle } from 'lucide-react';

interface PuzzleCardProps {
  puzzle: Puzzle;
  onClick?: () => void;
  showSolution?: boolean;
  onSolve?: () => void;
}

const difficultyColors = {
  easy: 'text-green-600',
  medium: 'text-yellow-600',
  hard: 'text-orange-600',
  expert: 'text-red-600'
};

const PuzzleCard: React.FC<PuzzleCardProps> = ({ 
  puzzle, 
  onClick, 
  showSolution = false,
  onSolve
}) => {
  const { title, description, cipherType, ciphertext, hint, difficulty } = puzzle;
  
  const cipherTypeMap: Record<string, string> = {
    caesar: 'Caesar Cipher',
    atbash: 'Atbash Cipher',
    substitution: 'Substitution Cipher',
    transposition: 'Transposition Cipher',
    anagram: 'Anagram',
    mirror: 'Mirror Writing',
    riddle: 'Riddle',
    binary: 'Binary Code',
    morse: 'Morse Code'
  };
  
  const [showHint, setShowHint] = React.useState(false);
  
  return (
    <Card 
      className="bg-[#F5DEB3]/10 border border-[#D4AF37]/30 hover:border-[#D4AF37]"
      hover
      onClick={onClick}
    >
      <CardHeader className="border-b border-[#D4AF37]/20">
        <div className="flex justify-between items-center">
          <h3 className="font-serif text-xl text-[#1A3A5A]">{title}</h3>
          <span className={`text-sm font-medium ${difficultyColors[difficulty]}`}>
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-gray-700">{description}</p>
        
        <div className="bg-[#1A3A5A]/5 p-3 rounded">
          <div className="text-sm text-gray-500 mb-1">Encrypted message:</div>
          <div className="font-mono text-[#1A3A5A] break-words">{ciphertext}</div>
        </div>
        
        <div className="flex items-center text-sm text-gray-500">
          <Key size={16} className="mr-1" />
          <span>Cipher Type: {cipherTypeMap[cipherType]}</span>
        </div>
        
        {hint && (
          <div className={`transition-opacity duration-300 ${showHint ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
            <div className="bg-yellow-50 border border-yellow-100 p-3 rounded flex items-start">
              <AlertTriangle size={18} className="text-yellow-600 mr-2 mt-0.5" />
              <div>
                <div className="font-medium text-yellow-800 text-sm">Hint:</div>
                <p className="text-yellow-700 text-sm">{hint}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="border-t border-[#D4AF37]/20 flex justify-between items-center">
        {hint && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setShowHint(!showHint);
            }}
          >
            {showHint ? 'Hide Hint' : 'Show Hint'}
          </Button>
        )}
        
        {onSolve && (
          <Button
            variant="primary"
            size="sm"
            icon={<Brain size={18} />}
            onClick={(e) => {
              e.stopPropagation();
              onSolve();
            }}
          >
            Solve Puzzle
          </Button>
        )}
        
        {showSolution && puzzle.plaintext && (
          <div className="w-full mt-4">
            <div className="text-sm text-gray-500 mb-1">Solution:</div>
            <div className="font-medium text-[#1A3A5A] bg-white p-2 rounded border">{puzzle.plaintext}</div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default PuzzleCard;