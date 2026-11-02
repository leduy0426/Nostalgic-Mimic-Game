import crypto from 'crypto';

/**
 * Generates an array of 25 numbers (1..25) shuffled uniformly using Fisher-Yates algorithm.
 */
export function generateNumberHuntBoard(): number[] {
  const board: number[] = Array.from({ length: 25 }, (_, i) => i + 1);

  for (let i = board.length - 1; i > 0; i--) {
    // Generate secure random index between 0 and i inclusive
    const j = crypto.randomInt(0, i + 1);
    const temp = board[i];
    board[i] = board[j];
    board[j] = temp;
  }

  return board;
}
