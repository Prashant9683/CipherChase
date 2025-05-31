/**
 * Columnar Transposition Cipher implementation
 * Rearranges letters in a grid by writing in rows and reading in columns
 */

export const encryptTransposition = (text: string, key: number): string => {
  // Remove spaces for cleaner encryption
  const cleanText = text.replace(/\s/g, '');
  
  // Calculate the number of rows
  const numRows = Math.ceil(cleanText.length / key);
  
  // Create the grid
  const grid: string[][] = Array(numRows).fill(0).map(() => Array(key).fill(''));
  
  // Fill the grid row by row
  let charIndex = 0;
  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < key; col++) {
      if (charIndex < cleanText.length) {
        grid[row][col] = cleanText[charIndex++];
      }
    }
  }
  
  // Read the grid column by column
  let ciphertext = '';
  for (let col = 0; col < key; col++) {
    for (let row = 0; row < numRows; row++) {
      if (grid[row][col]) {
        ciphertext += grid[row][col];
      }
    }
  }
  
  return ciphertext;
};

export const decryptTransposition = (text: string, key: number): string => {
  // Calculate dimensions
  const numRows = Math.ceil(text.length / key);
  const numCols = key;
  const numCompleteCols = text.length % numRows === 0 ? numCols : text.length % numRows;
  
  // Create the grid
  const grid: string[][] = Array(numRows).fill(0).map(() => Array(numCols).fill(''));
  
  // Fill the grid column by column
  let charIndex = 0;
  for (let col = 0; col < numCols; col++) {
    const colHeight = col < numCompleteCols ? numRows : numRows - 1;
    for (let row = 0; row < colHeight; row++) {
      if (charIndex < text.length) {
        grid[row][col] = text[charIndex++];
      }
    }
  }
  
  // Read the grid row by row
  let plaintext = '';
  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols; col++) {
      if (grid[row][col]) {
        plaintext += grid[row][col];
      }
    }
  }
  
  return plaintext;
};