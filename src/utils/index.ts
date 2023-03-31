const randomWords = require('random-words')

export const generateString = () => {
  const words = randomWords({ min: 2, max: 3, join: '-' });

  console.log('random word -> ', words)
  return words;
};