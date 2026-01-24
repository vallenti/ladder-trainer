import { Exercise, LadderType } from '../types';

/**
 * Strategy interface for different ladder workout types
 */
export interface LadderStrategy {
  /**
   * Get the exercises to perform for a specific round
   * @param roundNumber - Current round number (1-indexed)
   * @param exercises - All exercises in the workout
   * @returns Array of exercises with their reps for this round
   */
  getExercisesForRound(
    roundNumber: number,
    exercises: Exercise[]
  ): Array<{ exercise: Exercise; reps: number }>;

  /**
   * Calculate total reps for an exercise across all rounds
   * @param exercise - The exercise to calculate for
   * @param totalRounds - Total number of rounds completed
   * @returns Total reps performed
   */
  calculateTotalReps(exercise: Exercise, totalRounds: number): number;

  /**
   * Get a human-readable description of how this ladder works
   */
  getDescription(): string;
}

/**
 * Christmas Ladder Strategy
 * Pattern: Each round adds a new exercise, then performs previous exercises in reverse
 * Round 1: Exercise 1 (position 1)
 * Round 2: Exercise 2 (position 2), Exercise 1 (position 1)
 * Round 3: Exercise 3 (position 3), Exercise 2 (position 2), Exercise 1 (position 1)
 */
export class ChristmasLadderStrategy implements LadderStrategy {
  getExercisesForRound(
    roundNumber: number,
    exercises: Exercise[]
  ): Array<{ exercise: Exercise; reps: number }> {
    const result: Array<{ exercise: Exercise; reps: number }> = [];
    
    // Get exercises up to current round
    const exercisesForRound = exercises
      .filter(ex => ex.position <= roundNumber)
      .sort((a, b) => b.position - a.position); // Reverse order (highest position first)
    
    // Each exercise is performed with reps equal to its position
    exercisesForRound.forEach(ex => {
      result.push({ exercise: ex, reps: ex.position });
    });
    
    return result;
  }

  calculateTotalReps(exercise: Exercise, totalRounds: number): number {
    // Exercise is performed in rounds >= its position
    // Each time it's performed with reps = its position
    const timesPerformed = Math.max(0, totalRounds - exercise.position + 1);
    return exercise.position * timesPerformed;
  }

  getDescription(): string {
    return 'Each round adds a new exercise at the beginning, then performs previous exercises in reverse order';
  }
}

/**
 * Descending Ladder Strategy
 * Pattern: Each round decreases reps by stepSize for all exercises
 * Starting from maxRounds and going down to 1
 * Round 1: maxRounds * stepSize reps of each exercise
 * Round 2: (maxRounds - 1) * stepSize reps of each exercise
 * Round 3: (maxRounds - 2) * stepSize reps of each exercise
 */
export class DescendingLadderStrategy implements LadderStrategy {
  private stepSize: number;
  private maxRounds: number;

  constructor(stepSize: number = 1, maxRounds?: number) {
    this.stepSize = stepSize;
    this.maxRounds = maxRounds || 10; // Default fallback
  }

  getExercisesForRound(
    roundNumber: number,
    exercises: Exercise[]
  ): Array<{ exercise: Exercise; reps: number }> {
    // For descending: Round 1 gets maxRounds*step, Round 2 gets (maxRounds-1)*step, etc.
    const reps = (this.maxRounds - roundNumber + 1) * this.stepSize;
    return exercises.map(ex => ({
      exercise: ex,
      reps: reps,
    }));
  }

  calculateTotalReps(exercise: Exercise, totalRounds: number): number {
    // Same as ascending: sum is the same whether going up or down
    // = stepSize * (1 + 2 + 3 + ... + totalRounds)
    // = stepSize * (totalRounds * (totalRounds + 1) / 2)
    return this.stepSize * ((totalRounds * (totalRounds + 1)) / 2);
  }

  getDescription(): string {
    if (this.stepSize === 1) {
      return 'Each round decreases reps by 1 for all exercises (5, 4, 3, 2, 1...)';
    }
    return `Each round decreases reps by ${this.stepSize} for all exercises (${this.stepSize * 5}, ${this.stepSize * 4}, ${this.stepSize * 3}, ${this.stepSize * 2}...)`;
  }
}

/**
 * Pyramid Ladder Strategy
 * Pattern: Ascends to peak then descends
 * For 5 rounds step 1: 1, 2, 3, 2, 1
 * For 6 rounds step 1: 1, 2, 3, 3, 2, 1
 * Peak is at middle (odd) or repeats twice (even)
 */
export class PyramidLadderStrategy implements LadderStrategy {
  private stepSize: number;
  private maxRounds: number;

  constructor(stepSize: number = 1, maxRounds?: number) {
    this.stepSize = stepSize;
    this.maxRounds = maxRounds || 10;
  }

  getExercisesForRound(
    roundNumber: number,
    exercises: Exercise[]
  ): Array<{ exercise: Exercise; reps: number }> {
    const peak = Math.ceil(this.maxRounds / 2);
    let reps: number;
    
    if (roundNumber <= peak) {
      // Ascending phase
      reps = roundNumber * this.stepSize;
    } else {
      // Descending phase
      reps = (this.maxRounds - roundNumber + 1) * this.stepSize;
    }
    
    return exercises.map(ex => ({
      exercise: ex,
      reps: reps,
    }));
  }

  calculateTotalReps(exercise: Exercise, totalRounds: number): number {
    const peak = Math.ceil(totalRounds / 2);
    
    if (totalRounds % 2 === 1) {
      // Odd rounds: 1+2+3+2+1 = peak^2
      return peak * peak * this.stepSize;
    } else {
      // Even rounds: 1+2+3+3+2+1 = peak*(peak+1)
      return peak * (peak + 1) * this.stepSize;
    }
  }

  getDescription(): string {
    if (this.stepSize === 1) {
      return 'Ascends to peak then descends (1, 2, 3, 2, 1...)';
    }
    return `Ascends to peak then descends (${this.stepSize}, ${this.stepSize * 2}, ${this.stepSize * 3}, ${this.stepSize * 2}...)`;
  }
}

/**
 * Ascending Ladder Strategy
 * Pattern: Each round increases reps by stepSize for all exercises
 * Round 1: stepSize reps of each exercise
 * Round 2: stepSize * 2 reps of each exercise
 * Round 3: stepSize * 3 reps of each exercise
 */
export class AscendingLadderStrategy implements LadderStrategy {
  private stepSize: number;

  constructor(stepSize: number = 1) {
    this.stepSize = stepSize;
  }

  getExercisesForRound(
    roundNumber: number,
    exercises: Exercise[]
  ): Array<{ exercise: Exercise; reps: number }> {
    // All exercises are performed with reps = roundNumber * stepSize
    return exercises.map(ex => ({
      exercise: ex,
      reps: roundNumber * this.stepSize,
    }));
  }

  calculateTotalReps(exercise: Exercise, totalRounds: number): number {
    // Sum of stepSize + 2*stepSize + 3*stepSize + ... + totalRounds*stepSize
    // = stepSize * (1 + 2 + 3 + ... + totalRounds)
    // = stepSize * (totalRounds * (totalRounds + 1) / 2)
    return this.stepSize * ((totalRounds * (totalRounds + 1)) / 2);
  }

  getDescription(): string {
    if (this.stepSize === 1) {
      return 'Each round increases reps by 1 for all exercises (1, 2, 3, 4...)';
    }
    return `Each round increases reps by ${this.stepSize} for all exercises (${this.stepSize}, ${this.stepSize * 2}, ${this.stepSize * 3}, ${this.stepSize * 4}...)`;
  }
}

/**
 * Factory function to get the appropriate ladder strategy
 */
export function getLadderStrategy(ladderType: LadderType, stepSize: number = 1, maxRounds?: number): LadderStrategy {
  switch (ladderType) {
    case 'christmas':
      return new ChristmasLadderStrategy();
    case 'ascending':
      return new AscendingLadderStrategy(stepSize);
    case 'descending':
      return new DescendingLadderStrategy(stepSize, maxRounds);
    case 'pyramid':
      return new PyramidLadderStrategy(stepSize, maxRounds);
    default:
      throw new Error(`Unknown ladder type: ${ladderType}`);
  }
}
