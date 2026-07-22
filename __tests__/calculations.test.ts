import { calculateTotalReps, formatTime, getExercisesForRound } from '../src/utils/calculations';
import type { Exercise } from '../src/types';

const exercises: Exercise[] = [
  { position: 1, name: 'A', unit: 'reps' },
  { position: 2, name: 'B', unit: 'reps' },
  { position: 3, name: 'C', unit: 'reps' },
];

describe('calculation utilities', () => {
  it('formats durations with an hour when needed', () => {
    expect(formatTime(65)).toBe('1:05');
    expect(formatTime(3661)).toBe('1:01:01');
  });

  it('returns Christmas display order and documented 12-day totals', () => {
    expect(getExercisesForRound(2, exercises).map(x => x.position)).toEqual([2, 1]);
    expect(calculateTotalReps(exercises).get(1)).toBe(12);
    expect(calculateTotalReps(exercises).get(3)).toBe(30);
  });
});
