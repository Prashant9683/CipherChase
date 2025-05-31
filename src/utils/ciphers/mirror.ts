/**
 * Mirror Writing implementation
 * Reverses the text and optionally flips some characters
 */

export const mirrorText = (text: string): string => {
  // Simply reverse the text
  return text.split('').reverse().join('');
};

// For some characters, we might want to flip them vertically or horizontally
// This is a simplified version that just reverses the text
export const mirrorTextAdvanced = (text: string): string => {
  const mirrorMap: Record<string, string> = {
    'b': 'd', 'd': 'b',
    'p': 'q', 'q': 'p',
    'n': 'u', 'u': 'n',
    // Add more character transformations if desired
  };
  
  return text.split('')
    .map(char => mirrorMap[char] || char)
    .reverse()
    .join('');
};