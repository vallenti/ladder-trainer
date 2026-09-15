import {
  AMRAPLadderStrategy,
  AscendingLadderStrategy,
  ChipperLadderStrategy,
  ChristmasLadderStrategy,
  DescendingLadderStrategy,
  EMOMLadderStrategy,
  FlexibleLadderStrategy,
  ForRepsLadderStrategy,
  PyramidLadderStrategy,
  ReversePyramidLadderStrategy,
} from '../src/utils/ladderStrategies';
import type { Exercise } from '../src/types';
import { formatEmomLabel, getEmomTotalDuration, getEmomTotalIntervals } from '../src/utils/emom';

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

  it('calculates a reverse pyramid for odd and even round counts', () => {
    const odd = new ReversePyramidLadderStrategy(10, 5);
    const even = new ReversePyramidLadderStrategy(10, 6);
    expect([1, 2, 3, 4, 5].map(round => odd.getExercisesForRound(round, exercises)[0].reps)).toEqual([30, 20, 10, 20, 30]);
    expect([1, 2, 3, 4, 5, 6].map(round => even.getExercisesForRound(round, exercises)[0].reps)).toEqual([30, 20, 10, 10, 20, 30]);
    expect(odd.calculateTotalReps(exercises[0], 5)).toBe(110);
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

  it('repeats EMOM work and rest intervals with fixed prescribed totals', () => {
    const burpees = { ...exercises[0], name: 'Burpees', repsPerRound: 10 };
    const lunges = { ...exercises[1], name: 'Lunges', repsPerRound: 10 };
    const intervals = [
      { id: '1', position: 1, type: 'work' as const, exercises: [burpees] },
      { id: '2', position: 2, type: 'work' as const, exercises: [lunges] },
      { id: '3', position: 3, type: 'rest' as const, exercises: [] },
    ];
    const strategy = new EMOMLadderStrategy(intervals);
    expect(strategy.getExercisesForRound(1)[0].exercise.name).toBe('Burpees');
    expect(strategy.getExercisesForRound(3)).toEqual([]);
    expect(strategy.getExercisesForRound(4)[0].exercise.name).toBe('Burpees');
    expect(strategy.calculateTotalReps(burpees, 6)).toBe(20);
    expect(strategy.calculateTotalReps(lunges, 6)).toBe(20);
  });

  it('calculates EMOM labels, complete-cycle interval counts, and durations', () => {
    const intervals = [{ id: '1', position: 1, type: 'rest' as const, exercises: [] }];
    expect(formatEmomLabel(60)).toBe('EMOM');
    expect(formatEmomLabel(180)).toBe('E3MOM');
    expect(formatEmomLabel(90)).toBe('Every 1:30');
    expect(getEmomTotalIntervals(intervals, 5)).toBe(5);
    expect(getEmomTotalDuration(90, intervals, 5)).toBe(450);
  });
});
