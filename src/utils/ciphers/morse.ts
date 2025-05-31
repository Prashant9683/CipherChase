/**
 * Morse Code implementation
 * Converts text to/from Morse code
 */

const MORSE_CODE_MAP: Record<string, string> = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.', 
  'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..', 
  'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.', 
  'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-', 
  'Y': '-.--', 'Z': '--..', 
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-', 
  '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.', 
  '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--', 
  '/': '-..-.', '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...', 
  ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '-': '-....-', '_': '..--.-', 
  '"': '.-..-.', '$': '...-..-', '@': '.--.-.'
};

// Create reverse mapping for decoding
const REVERSE_MORSE_CODE_MAP: Record<string, string> = Object.entries(MORSE_CODE_MAP)
  .reduce((acc, [char, code]) => ({...acc, [code]: char}), {});

export const textToMorse = (text: string): string => {
  return text.toUpperCase().split('').map(char => {
    if (char === ' ') {
      return ' / '; // Word separator in Morse code
    }
    return MORSE_CODE_MAP[char] || char;
  }).join(' ');
};

export const morseToText = (morse: string): string => {
  return morse.split(' / ').map(word => 
    word.split(' ').map(code => 
      REVERSE_MORSE_CODE_MAP[code] || code
    ).join('')
  ).join(' ');
};