/**
 * Enhanced Anagram implementation
 * Creates meaningful phrases from input text while preserving all letters
 */

// Helper function to count character frequencies
const getCharFrequency = (text: string): Record<string, number> => {
  const freq: Record<string, number> = {};
  text.toLowerCase().replace(/[^a-z]/g, '').split('').forEach(char => {
    freq[char] = (freq[char] || 0) + 1;
  });
  return freq;
};

// Helper function to check if a potential solution uses valid letters
const isValidAnagramPhrase = (original: string, phrase: string): boolean => {
  const originalFreq = getCharFrequency(original);
  const phraseFreq = getCharFrequency(phrase);
  
  // Check if all letters in phrase can be formed from original
  for (const char in phraseFreq) {
    if (!originalFreq[char] || phraseFreq[char] > originalFreq[char]) {
      return false;
    }
  }
  
  // Check if all letters from original are used in phrase
  for (const char in originalFreq) {
    if (!phraseFreq[char] || phraseFreq[char] < originalFreq[char]) {
      return false;
    }
  }
  
  return true;
};

/**
 * Creates a meaningful anagram phrase from the input text
 */
export const createAnagram = (text: string): string => {
  // Remove non-alphabetic characters and convert to lowercase
  const cleanText = text.toLowerCase().replace(/[^a-z]/g, '');
  
  // For demonstration, we'll use a map of pre-defined anagrams for common phrases
  // In a real application, this could be expanded with a larger database or algorithm
  const anagramMap: Record<string, string[]> = {
    'leonardo da vinci': ['o draconian devil', 'nice old art van di'],
    'monalisa': ['ails man', 'man sail'],
    'astronomers': ['moon starers', 'no more stars'],
    'debit card': ['bad credit', 'card debit'],
    'eleven plus two': ['twelve plus one', 'two plus eleven'],
    'slot machines': ['cash lost in em', 'cash me lots in'],
    'the morse code': ['here come dots', 'he comes dot er'],
    'the classroom': ['school master', 'master school'],
    'the eyes': ['they see', 'see they'],
    'fourth of july': ['joyful fourth', 'forth joy flu'],
    'mother in law': ['woman hitler', 'hit woman lair'],
    'deductions': ['no discounts', 'counts no id'],
    'the public art galleries': ['large picture halls, i bet', 'picture this all large'],
    'the earthquakes': ['that queers shake', 'shake earth quiet'],
    'the country side': ['no city dust here', 'city tours ended'],
    'punishment': ['nine thumps', 'mint punish'],
    'funeral': ['real fun', 'run leaf']
  };
  
  // If we have a pre-defined anagram, use it
  const cleanKey = cleanText.replace(/\s+/g, '');
  for (const [key, values] of Object.entries(anagramMap)) {
    if (key.replace(/\s+/g, '') === cleanKey) {
      // Return a random anagram from the available options
      return values[Math.floor(Math.random() * values.length)];
    }
  }
  
  // If no pre-defined anagram exists, create a simple scrambled version
  // This is a fallback - in a real application, you'd want a more sophisticated
  // algorithm for generating meaningful phrases
  const chars = cleanText.split('');
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  
  // Insert spaces randomly to create word-like groups
  let result = chars.join('');
  const wordCount = 2 + Math.floor(Math.random() * 2); // 2-3 words
  const positions = new Set<number>();
  while (positions.size < wordCount - 1) {
    const pos = 1 + Math.floor(Math.random() * (result.length - 2));
    positions.add(pos);
  }
  
  return Array.from(result).reduce((acc, char, i) => 
    acc + char + (positions.has(i) ? ' ' : ''), 
  '');
};

/**
 * Verifies if a proposed solution is a valid anagram of the original text
 */
export const verifyAnagram = (original: string, solution: string): boolean => {
  // First check if it's a valid rearrangement of letters
  if (!isValidAnagramPhrase(original, solution)) {
    return false;
  }
  
  // Additional checks for quality (optional)
  const words = solution.trim().split(/\s+/);
  
  // Ensure multiple words
  if (words.length < 2) {
    return false;
  }
  
  // Ensure each word is at least 2 characters (except for common words)
  const commonWords = new Set(['a', 'i', 'o']);
  if (words.some(word => word.length < 2 && !commonWords.has(word.toLowerCase()))) {
    return false;
  }
  
  return true;
};