// Fisher-Yates shuffle algorithm for proper randomization
export const shuffleArray = (array) => {
  const shuffled = [...array]; // Create a copy to avoid mutating the original
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Shuffle function that can be used in sort callbacks
export const shuffleCompare = () => Math.random() - 0.5;
