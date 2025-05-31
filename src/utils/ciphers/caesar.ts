/**
 * Caesar Cipher implementation
 * Shifts each letter in the plaintext by a specified number of places down the alphabet
 */

export const encryptCaesar = (text: string, shift: number): string => {
  // Normalize shift value to be within 0-25
  shift = ((shift % 26) + 26) % 26;
  
  return text.split('').map(char => {
    // Check if character is a letter
    if (char.match(/[a-z]/i)) {
      const code = char.charCodeAt(0);
      
      // Handle uppercase letters
      if (code >= 65 && code <= 90) {
        return String.fromCharCode(((code - 65 + shift) % 26) + 65);
      }
      
      // Handle lowercase letters
      else if (code >= 97 && code <= 122) {
        return String.fromCharCode(((code - 97 + shift) % 26) + 97);
      }
    }
    
    // Return non-alphabetic characters unchanged
    return char;
  }).join('');
};

export const decryptCaesar = (text: string, shift: number): string => {
  // Decryption is just a Caesar cipher with a negative shift
  return encryptCaesar(text, 26 - (shift % 26));
};