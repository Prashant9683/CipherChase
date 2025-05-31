/**
 * Atbash Cipher implementation
 * Replaces each letter with its reverse in the alphabet (A→Z, B→Y, etc.)
 */

export const atbashCipher = (text: string): string => {
  return text.split('').map(char => {
    // Check if character is a letter
    if (char.match(/[a-z]/i)) {
      const code = char.charCodeAt(0);
      
      // Handle uppercase letters (A=65, Z=90)
      if (code >= 65 && code <= 90) {
        return String.fromCharCode(155 - code); // 155 = 65 + 90
      }
      
      // Handle lowercase letters (a=97, z=122)
      else if (code >= 97 && code <= 122) {
        return String.fromCharCode(219 - code); // 219 = 97 + 122
      }
    }
    
    // Return non-alphabetic characters unchanged
    return char;
  }).join('');
};

// Since Atbash is its own inverse, encryption and decryption are the same
export const encryptAtbash = atbashCipher;
export const decryptAtbash = atbashCipher;