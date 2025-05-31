/**
 * Binary Cipher implementation
 * Converts text to/from binary representation
 */

export const textToBinary = (text: string): string => {
  return text.split('').map(char => {
    // Convert character to its ASCII code
    const ascii = char.charCodeAt(0);
    // Convert ASCII to 8-bit binary representation
    return ascii.toString(2).padStart(8, '0');
  }).join(' ');
};

export const binaryToText = (binary: string): string => {
  // Split by spaces and convert each binary group back to a character
  return binary.split(' ').map(bin => {
    // Convert binary to decimal (ASCII code)
    const ascii = parseInt(bin, 2);
    // Convert ASCII code to character
    return String.fromCharCode(ascii);
  }).join('');
};