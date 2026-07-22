import {
  AMRAPLadderStrategy,
  AscendingLadderStrategy,
  ChipperLadderStrategy,
  ChristmasLadderStrategy,
  DescendingLadderStrategy,
  FlexibleLadderStrategy,
  ForRepsLadderStrategy,
  PyramidLadderStrategy,
} from '../src/utils/ladderStrategies';
import type { Exercise } from '../src/types';

const exercises: Exercise[] = [
  { position: 1, name: 'A', unit: 'reps' },
  { position: 2, name: 'B', unit: 'reps' },
  { position: 3, name: 'C', unit: 'reps' },
];

describe('ladder strategies', () => {
  it('implements Christmas ordering and totals', () => {
    const strategy = new ChristmasLadderStrategy();
    expect(strategy.getExercisesForRound(3, exercises).map(x => x.reps)).toEqual([3, 2, 1]);
    expect(strategy.calculateTotalReps(exercises[1], 3)).toBe(4);
  });

  it('calculates ascending and descending arithmetic progressions', () => {
    expect(new AscendingLadderStrategy(2, 3).getExercisesForRound(2, exercises)[0].reps).toBe(5);
    expect(new DescendingLadderStrategy(3, 3, 9).getExercisesForRound(3, exercises)[0].reps).toBe(3);
  });

  it('calculates a symmetric pyramid for odd and even round counts', () => {
    const odd = new PyramidLadderStrategy(1, 5);
    const even = new PyramidLadderStrategy(1, 6);
    expect([1, 2, 3, 2, 1].map((_, i) => odd.getExercisesForRound(i + 1, exercises)[0].reps)).toEqual([1, 2, 3, 2, 1]);
    expect([1, 2, 3, 3, 2, 1].map((_, i) => even.getExercisesForRound(i + 1, exercises)[0].reps)).toEqual([1, 2, 3, 3, 2, 1]);
  });

  it('supports independent flexible directions and clamps negative reps', () => {
    const configured: Exercise[] = [
      { ...exercises[0], direction: 'constant', startingReps: 4 },
      { ...exercises[1], direction: 'descending', startingReps: 2, stepSize: 2 },
    ];
    const strategy = new FlexibleLadderStrategy(3);
    expect(strategy.getExercisesForRound(3, configured).map(x => x.reps)).toEqual([4, 0]);
  });

  it('models chipper and for-reps round contracts', () => {
    const chipper = new ChipperLadderStrategy();
    expect(chipper.getExercisesForRound(2, exercises.map(x => ({ ...x, fixedReps: x.position * 5 })))[0].reps).toBe(10);
    const fixed = new ForRepsLadderStrategy();
    expect(fixed.calculateTotalReps({ ...exercises[0], repsPerRound: 4 }, 3)).toBe(12);
  });

  it('adds AMRAP partial reps only to the complete-round total', () => {
    const strategy = new AMRAPLadderStrategy();
    const exercise = { ...exercises[0], startingReps: 2, stepSize: 1, partialReps: 3 };
    expect(strategy.calculateTotalReps(exercise, 2)).toBe(8);
  });
});
