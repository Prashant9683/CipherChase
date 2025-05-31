// src/components/ciphers/CipherConfig.tsx
import React from 'react';
import { CipherType } from '../../types';
import { Input } from '../ui/Input'; // Assuming you have a themed Input component
import { Textarea } from '../ui/Textarea'; // Assuming a themed Textarea component
import { Label } from '../ui/Label'; // Assuming a themed Label component
import { Settings2 } from 'lucide-react';

interface CipherConfigProps {
  cipherType: CipherType | null;
  config: any; // Consider defining specific config types per cipher
  onConfigChange: (field: string, value: any) => void;
}

const CipherConfig: React.FC<CipherConfigProps> = ({ cipherType, config, onConfigChange }) => {
  if (!cipherType) {
    return null; // Or a placeholder asking to select a cipher
  }

  const renderConfigFields = () => {
    switch (cipherType) {
      case 'caesar':
        return (
            <div>
              <Label htmlFor="caesar-shift" className="text-sm font-medium text-slate-700">Shift Amount</Label>
              <Input
                  id="caesar-shift"
                  type="number"
                  min="1"
                  max="25"
                  value={config.shift || ''}
                  onChange={(e) => onConfigChange('shift', parseInt(e.target.value, 10))}
                  placeholder="e.g., 3"
                  className="mt-1 w-full"
              />
              <p className="text-xs text-slate-500 mt-1">How many positions to shift each letter (1-25).</p>
            </div>
        );
      case 'substitution':
        return (
            <div>
              <Label htmlFor="substitution-key" className="text-sm font-medium text-slate-700">Substitution Key</Label>
              <Input
                  id="substitution-key"
                  type="text"
                  maxLength={26} // Enforce 26 letters
                  value={config.key || ''}
                  onChange={(e) => onConfigChange('key', e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
                  placeholder="e.g., QWERTYUIOPASDFGHJKLZXCVBNM"
                  className="mt-1 w-full font-mono tracking-wider" // Monospace for keys
              />
              <p className="text-xs text-slate-500 mt-1">A 26-letter key representing the new alphabet (A → 1st letter, B → 2nd, etc.).</p>
            </div>
        );
      case 'transposition':
        return (
            <div>
              <Label htmlFor="transposition-columns" className="text-sm font-medium text-slate-700">Number of Columns</Label>
              <Input
                  id="transposition-columns"
                  type="number"
                  min="2"
                  max="10" // Reasonable max for manual transposition
                  value={config.columns || ''}
                  onChange={(e) => onConfigChange('columns', parseInt(e.target.value, 10))}
                  placeholder="e.g., 5"
                  className="mt-1 w-full"
              />
              <p className="text-xs text-slate-500 mt-1">Number of columns for the transposition grid (2-10).</p>
            </div>
        );
      case 'riddle':
      case 'anagram': // Anagrams might not need specific config but might need expected answer
        return (
            <div>
              <Label htmlFor={`${cipherType}-answer`} className="text-sm font-medium text-slate-700">Expected Answer</Label>
              <Input
                  id={`${cipherType}-answer`}
                  type="text"
                  value={config.answer || ''}
                  onChange={(e) => onConfigChange('answer', e.target.value)}
                  placeholder="The exact correct answer"
                  className="mt-1 w-full"
              />
              <p className="text-xs text-slate-500 mt-1">The exact answer that will be considered correct.</p>
            </div>
        );
        // For binary, morse, atbash, mirror: often no specific config needed by the user for the *type* itself
        // but you might want to specify an expected answer if it's a puzzle.
      case 'atbash':
      case 'mirror':
      case 'binary':
      case 'morse':
        return (
            <p className="text-sm text-slate-600 p-3 bg-blue-50 border border-blue-200 rounded-md">
              No additional configuration needed for this cipher type beyond the text to encrypt/decrypt.
              If this is part of a puzzle, ensure you have a clear expected answer.
            </p>
        );
      default:
        return <p className="text-sm text-slate-500">Select a cipher to see its configuration options.</p>;
    }
  };

  return (
      <div className="p-6 bg-white rounded-xl shadow-lg border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center font-serif">
          <Settings2 size={20} className="mr-2 text-blue-600" />
          Configure <span className="text-blue-600 ml-1">{cipherInfo[cipherType]?.name || 'Cipher'}</span>
        </h3>
        <div className="space-y-4">
          {renderConfigFields()}
        </div>
      </div>
  );
};

export default CipherConfig;
