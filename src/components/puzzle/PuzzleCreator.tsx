import React, { useState } from 'react';
import { CipherType, Puzzle } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import CipherSelector from '../cipher/CipherSelector';
import CipherConfig from '../cipher/CipherConfig';
import Button from '../ui/Button';
import { encryptText } from '../../utils/ciphers';

interface PuzzleCreatorProps {
  onSave: (puzzle: Puzzle) => void;
}

const PuzzleCreator: React.FC<PuzzleCreatorProps> = ({ onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [plaintext, setPlaintext] = useState('');
  const [hint, setHint] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'expert'>('medium');
  const [selectedCipher, setSelectedCipher] = useState<CipherType | null>(null);
  const [cipherConfig, setCipherConfig] = useState<Record<string, any>>({});
  const [ciphertext, setCiphertext] = useState('');
  
  const handleCipherSelect = (cipher: CipherType) => {
    setSelectedCipher(cipher);
    // Reset config when changing cipher type
    setCipherConfig({});
  };
  
  const handleConfigChange = (config: Record<string, any>) => {
    setCipherConfig(config);
  };
  
  const handleEncrypt = () => {
    if (!selectedCipher || !plaintext) return;
    
    const encrypted = encryptText(plaintext, selectedCipher, cipherConfig);
    setCiphertext(encrypted);
  };
  
  const handleSave = () => {
    if (!selectedCipher || !title || !plaintext || !ciphertext) return;
    
    const newPuzzle: Puzzle = {
      id: uuidv4(),
      title,
      description,
      cipherType: selectedCipher,
      plaintext,
      ciphertext,
      hint: hint || undefined,
      difficulty,
      config: cipherConfig
    };
    
    onSave(newPuzzle);
    
    // Reset form
    setTitle('');
    setDescription('');
    setPlaintext('');
    setHint('');
    setDifficulty('medium');
    setSelectedCipher(null);
    setCipherConfig({});
    setCiphertext('');
  };
  
  const isFormValid = () => {
    return (
      title.trim() !== '' &&
      plaintext.trim() !== '' &&
      selectedCipher !== null &&
      ciphertext.trim() !== ''
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-2xl font-serif text-[#1A3A5A] mb-4">Create New Puzzle</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Puzzle Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for your puzzle"
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide context or a clue to help solvers"
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              rows={2}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plaintext Message
            </label>
            <textarea
              value={plaintext}
              onChange={(e) => setPlaintext(e.target.value)}
              placeholder="The original message that will be encrypted"
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hint (Optional)
            </label>
            <input
              type="text"
              value={hint}
              onChange={(e) => setHint(e.target.value)}
              placeholder="Provide a hint for solvers who get stuck"
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="expert">Expert</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-xl font-medium text-[#1A3A5A] mb-4">Select Cipher Type</h3>
        <CipherSelector
          selectedCipher={selectedCipher}
          onSelect={handleCipherSelect}
        />
      </div>
      
      {selectedCipher && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-xl font-medium text-[#1A3A5A] mb-4">Configure Cipher</h3>
          <CipherConfig
            cipherType={selectedCipher}
            onChange={handleConfigChange}
            initialConfig={cipherConfig}
          />
          
          <div className="mt-6">
            <Button
              onClick={handleEncrypt}
              disabled={!plaintext || !selectedCipher}
              className="mb-4"
            >
              Encrypt Message
            </Button>
            
            {ciphertext && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Encrypted Result
                </label>
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200 font-mono break-words">
                  {ciphertext}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="flex justify-end">
        <Button
          variant="primary"
          size="lg"
          onClick={handleSave}
          disabled={!isFormValid()}
        >
          Save Puzzle
        </Button>
      </div>
    </div>
  );
};

export default PuzzleCreator;