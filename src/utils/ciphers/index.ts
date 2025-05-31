import { encryptCaesar, decryptCaesar } from './caesar';
import { encryptAtbash, decryptAtbash } from './atbash';
import { createAnagram, verifyAnagram } from './anagram';
import { encryptSubstitution, decryptSubstitution, generateSubstitutionKey } from './substitution';
import { encryptTransposition, decryptTransposition } from './transposition';
import { mirrorText, mirrorTextAdvanced } from './mirror';
import { textToMorse, morseToText } from './morse';
import { textToBinary, binaryToText } from './binary';
import { CipherType } from '../../types';

export const encryptText = (
  plaintext: string, 
  cipherType: CipherType, 
  config?: Record<string, any>
): string => {
  switch (cipherType) {
    case 'caesar':
      return encryptCaesar(plaintext, config?.shift || 3);
    case 'atbash':
      return encryptAtbash(plaintext);
    case 'anagram':
      return createAnagram(plaintext);
    case 'substitution':
      return encryptSubstitution(plaintext, config?.key || generateSubstitutionKey());
    case 'transposition':
      return encryptTransposition(plaintext, config?.key || 5);
    case 'mirror':
      return config?.advanced ? mirrorTextAdvanced(plaintext) : mirrorText(plaintext);
    case 'morse':
      return textToMorse(plaintext);
    case 'binary':
      return textToBinary(plaintext);
    case 'riddle':
      // Riddles don't need encryption, they're already the puzzle
      return plaintext;
    default:
      return plaintext;
  }
};

export const decryptText = (
  ciphertext: string, 
  cipherType: CipherType, 
  config?: Record<string, any>
): string => {
  switch (cipherType) {
    case 'caesar':
      return decryptCaesar(ciphertext, config?.shift || 3);
    case 'atbash':
      return decryptAtbash(ciphertext);
    case 'anagram':
      // For anagrams, we can't automatically decrypt without knowing the solution
      return config?.solution || ciphertext;
    case 'substitution':
      return decryptSubstitution(ciphertext, config?.key);
    case 'transposition':
      return decryptTransposition(ciphertext, config?.key || 5);
    case 'mirror':
      return config?.advanced ? mirrorTextAdvanced(ciphertext) : mirrorText(ciphertext);
    case 'morse':
      return morseToText(ciphertext);
    case 'binary':
      return binaryToText(ciphertext);
    case 'riddle':
      // Riddles don't need decryption
      return config?.solution || ciphertext;
    default:
      return ciphertext;
  }
};

export const validateSolution = (
  ciphertext: string,
  solution: string,
  cipherType: CipherType,
  config?: Record<string, any>
): boolean => {
  switch (cipherType) {
    case 'anagram':
      return verifyAnagram(ciphertext, solution);
    case 'riddle':
      // For riddles, check against the predefined solution
      return solution.toLowerCase() === (config?.solution || '').toLowerCase();
    default:
      // For other ciphers, decrypt and compare
      const expectedPlaintext = config?.plaintext || '';
      return solution.toLowerCase() === expectedPlaintext.toLowerCase();
  }
};