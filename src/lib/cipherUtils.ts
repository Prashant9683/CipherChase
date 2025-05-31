// src/lib/cipherUtils.ts
import { CipherType, CipherConfig } from '../types'; // Corrected import path for CipherType

// Import functions from your individual cipher files
// Ensure these paths are correct relative to src/lib/
import { encryptCaesar, decryptCaesar } from '../utils/ciphers/caesar';           // File [4]
import { encryptAtbash, decryptAtbash } from '../utils/ciphers/atbash';           // File [2]
import { createAnagram, verifyAnagram } from '../utils/ciphers/anagram';         // File [1]
import { encryptSubstitution, decryptSubstitution, generateSubstitutionKey } from '../utils/ciphers/substitution'; // File [8]
import { encryptTransposition, decryptTransposition } from '../utils/ciphers/transposition'; // File [9]
import { mirrorText, mirrorTextAdvanced } from '../utils/ciphers/mirror';         // File [6]
import { textToMorse, morseToText } from '../utils/ciphers/morse';               // File [7]
import { textToBinary, binaryToText } from '../utils/ciphers/binary';             // File [3]

export const encryptText = (
    plaintext: string,
    cipherType: CipherType,
    config?: CipherConfig // Using the CipherConfig type
): string => {
    switch (cipherType) {
        case 'caesar':
            // Default shift to 3 if not provided, as in your index.ts
            return encryptCaesar(plaintext, config?.shift !== undefined ? config.shift : 3);
        case 'atbash':
            return encryptAtbash(plaintext);
        case 'anagram':
            // createAnagram in your file doesn't use config, it scrambles the plaintext.
            // If the puzzle creator provides the jumbled text, that's different.
            // For the library, creating an anagram from input is fine.
            return createAnagram(plaintext);
        case 'substitution':
            // Use provided key or generate a new one if none, as in your index.ts
            return encryptSubstitution(plaintext, config?.key as string || generateSubstitutionKey());
        case 'transposition':
            // Default key (columns) to 5 if not provided, as in your index.ts
            return encryptTransposition(plaintext, config?.key as number !== undefined ? config.key as number : 5);
        case 'mirror':
            return config?.advanced ? mirrorTextAdvanced(plaintext) : mirrorText(plaintext);
        case 'morse':
            return textToMorse(plaintext);
        case 'binary':
            return textToBinary(plaintext);
        case 'riddle':
            // For "encryption" in the library, just return the text as is.
            // The "riddleText" would be set when creating a puzzle.
            return plaintext; // Or config?.riddleText if that's how you want the library to behave
        default:
            console.warn(`Encryption not supported for cipher type: ${cipherType}`);
            return plaintext; // Fallback
    }
};

export const decryptText = (
    ciphertext: string,
    cipherType: CipherType,
    config?: CipherConfig // Using the CipherConfig type
): string => {
    switch (cipherType) {
        case 'caesar':
            return decryptCaesar(ciphertext, config?.shift !== undefined ? config.shift : 3);
        case 'atbash':
            return decryptAtbash(ciphertext);
        case 'anagram':
            // Decryption for an anagram in the library context is tricky.
            // `verifyAnagram` is for checking a solution.
            // If `config.solution` is the original unscrambled word:
            return `Anagram of: "${ciphertext}". Solution might be: "${config?.solution || 'Not provided'}". Use 'Verify Anagram' for checking.`;
        case 'substitution':
            // Requires the key. If no key in config, it uses default from substitution.ts
            return decryptSubstitution(ciphertext, config?.key as string);
        case 'transposition':
            return decryptTransposition(ciphertext, config?.key as number !== undefined ? config.key as number : 5);
        case 'mirror':
            // Mirror text is its own inverse for simple reverse, but not for advanced
            return config?.advanced ? mirrorTextAdvanced(ciphertext) : mirrorText(ciphertext);
        case 'morse':
            return morseToText(ciphertext);
        case 'binary':
            return binaryToText(ciphertext);
        case 'riddle':
            return `Riddle: "${ciphertext}". Solution might be: "${config?.solution || 'Not provided'}".`;
        default:
            console.warn(`Decryption not supported for cipher type: ${cipherType}`);
            return ciphertext; // Fallback
    }
};

// This function is more for puzzle solving than generic library decryption
export const validateSolution = (
    puzzleCiphertext: string, // The original encrypted/jumbled text of the puzzle
    userInputSolution: string,
    cipherType: CipherType,
    config?: CipherConfig // This config should contain the *correct solution* for riddle/anagram
): boolean => {
    switch (cipherType) {
        case 'anagram':
            // verifyAnagram checks if userInputSolution is an anagram of puzzleCiphertext.
            // If the puzzle is "solve this anagram: LEPMAS", and solution is "SAMPLE",
            // then puzzleCiphertext = "LEPMAS", userInputSolution = "SAMPLE".
            // If config.solution is the *original word* that was jumbled to make puzzleCiphertext, that's different.
            // Assuming verifyAnagram from your file checks if the letters match:
            return verifyAnagram(puzzleCiphertext, userInputSolution);
        case 'riddle':
            // For riddles, check against the predefined solution in config
            return userInputSolution.trim().toLowerCase() === (config?.solution || '').trim().toLowerCase();
        default:
            // For other ciphers, decrypt the puzzle's ciphertext and compare with user's input solution
            try {
                const decryptedOriginal = decryptText(puzzleCiphertext, cipherType, config);
                return userInputSolution.trim().toLowerCase() === decryptedOriginal.trim().toLowerCase();
            } catch (e) {
                console.error("Error during validation decryption:", e);
                return false;
            }
    }
};
