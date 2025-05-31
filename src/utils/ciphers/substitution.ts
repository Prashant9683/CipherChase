/**
 * Substitution Cipher implementation
 * Replaces each letter with another letter according to a given key
 */

const DEFAULT_KEY = 'PHQGIUMEAYLNOFDXJKRCVSTZWB'; // Example substitution key

export const generateSubstitutionKey = (): string => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  
  // Fisher-Yates shuffle
  for (let i = alphabet.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [alphabet[i], alphabet[j]] = [alphabet[j], alphabet[i]];
  }
  
  return alphabet.join('');
};

export const encryptSubstitution = (text: string, key: string = DEFAULT_KEY): string => {
  const normalizedKey = key.toUpperCase();
  
  return text.split('').map(char => {
    // Check if character is a letter
    if (char.match(/[a-z]/i)) {
      const isUpperCase = char === char.toUpperCase();
      const alphabetIndex = char.toUpperCase().charCodeAt(0) - 65;
      
      // Only substitute if it's a valid English letter
      if (alphabetIndex >= 0 && alphabetIndex < 26) {
        const substitutedChar = normalizedKey[alphabetIndex];
        return isUpperCase ? substitutedChar : substitutedChar.toLowerCase();
      }
    }
    
    // Return non-alphabetic characters unchanged
    return char;
  }).join('');
};

export const decryptSubstitution = (text: string, key: string = DEFAULT_KEY): string => {
  const normalizedKey = key.toUpperCase();
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
  return text.split('').map(char => {
    // Check if character is a letter
    if (char.match(/[a-z]/i)) {
      const isUpperCase = char === char.toUpperCase();
      const keyIndex = normalizedKey.indexOf(char.toUpperCase());
      
      // Only substitute if the character is in the key
      if (keyIndex >= 0) {
        const originalChar = alphabet[keyIndex];
        return isUpperCase ? originalChar : originalChar.toLowerCase();
      }
    }
    
    // Return non-alphabetic characters unchanged
    return char;
  }).join('');
};