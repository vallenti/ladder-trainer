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
 * Starting from startingReps and going down by stepSize each round
 * Round 1: startingReps reps of each exercise
 * Round 2: startingReps - stepSize reps of each exercise
 * Round 3: startingReps - (2 * stepSize) reps of each exercise
 */
export class DescendingLadderStrategy implements LadderStrategy {
  private stepSize: number;
  private maxRounds: number;
  private startingReps: number;

  constructor(stepSize: number = 1, maxRounds?: number, startingReps?: number) {
    this.stepSize = stepSize;
    this.maxRounds = maxRounds || 10; // Default fallback
    this.startingReps = startingReps || (maxRounds || 10) * stepSize; // Default to maxRounds * stepSize for backward compatibility
  }

  getExercisesForRound(
    roundNumber: number,
    exercises: Exercise[]
  ): Array<{ exercise: Exercise; reps: number }> {
    // For descending: Round 1 gets startingReps, Round 2 gets startingReps - stepSize, etc.
    const reps = this.startingReps - (roundNumber - 1) * this.stepSize;
    return exercises.map(ex => ({
      exercise: ex,
      reps: reps,
    }));
  }

  calculateTotalReps(exercise: Exercise, totalRounds: number): number {
    // Sum of arithmetic sequence: startingReps + (startingReps - step) + (startingReps - 2*step) + ...
    // = n * (first + last) / 2
    const firstReps = this.startingReps;
    const lastReps = this.startingReps - (totalRounds - 1) * this.stepSize;
    return (totalRounds * (firstReps + lastReps)) / 2;
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
 * Starting from startingReps and going up by stepSize each round
 * Round 1: startingReps reps of each exercise
 * Round 2: startingReps + stepSize reps of each exercise
 * Round 3: startingReps + (2 * stepSize) reps of each exercise
 */
export class AscendingLadderStrategy implements LadderStrategy {
  private stepSize: number;
  private startingReps: number;

  constructor(stepSize: number = 1, startingReps?: number) {
    this.stepSize = stepSize;
    this.startingReps = startingReps || stepSize; // Default to stepSize for backward compatibility
  }

  getExercisesForRound(
    roundNumber: number,
    exercises: Exercise[]
  ): Array<{ exercise: Exercise; reps: number }> {
    // All exercises are performed with reps = startingReps + (roundNumber - 1) * stepSize
    return exercises.map(ex => ({
      exercise: ex,
      reps: this.startingReps + (roundNumber - 1) * this.stepSize,
    }));
  }

  calculateTotalReps(exercise: Exercise, totalRounds: number): number {
    // Sum of arithmetic sequence: startingReps + (startingReps + step) + (startingReps + 2*step) + ...
    // = n * (first + last) / 2
    const firstReps = this.startingReps;
    const lastReps = this.startingReps + (totalRounds - 1) * this.stepSize;
    return (totalRounds * (firstReps + lastReps)) / 2;
  }

  getDescription(): string {
    if (this.stepSize === 1) {
      return 'Each round increases reps by 1 for all exercises (1, 2, 3, 4...)';
    }
    return `Each round increases reps by ${this.stepSize} for all exercises (${this.stepSize}, ${this.stepSize * 2}, ${this.stepSize * 3}, ${this.stepSize * 4}...)`;
  }
}

/**
 * Flexible Ladder Strategy
 * Pattern: Each exercise has independent progression (ascending or descending)
 * Each exercise defines its own: direction, starting reps, and step size
 * All exercises must result in the same number of rounds
 */
export class FlexibleLadderStrategy implements LadderStrategy {
  private maxRounds: number;

  constructor(maxRounds?: number) {
    this.maxRounds = maxRounds || 10;
  }

  getExercisesForRound(
    roundNumber: number,
    exercises: Exercise[]
  ): Array<{ exercise: Exercise; reps: number }> {
    return exercises.map(ex => {
      const direction = ex.direction || 'ascending';
      const startingReps = ex.startingReps || 1;
      const stepSize = ex.stepSize || 1;
      
      let reps: number;
      if (direction === 'constant') {
        reps = startingReps; // Same reps for all rounds
      } else if (direction === 'ascending') {
        reps = startingReps + (roundNumber - 1) * stepSize;
      } else {
        reps = startingReps - (roundNumber - 1) * stepSize;
      }
      
      return {
        exercise: ex,
        reps: Math.max(0, reps), // Ensure non-negative
      };
    });
  }

  calculateTotalReps(exercise: Exercise, totalRounds: number): number {
    const direction = exercise.direction || 'ascending';
    const startingReps = exercise.startingReps || 1;
    const stepSize = exercise.stepSize || 1;
    
    // Constant: same reps every round
    if (direction === 'constant') {
      return startingReps * totalRounds;
    }
    
    // Sum of arithmetic sequence: n * (first + last) / 2
    const firstReps = startingReps;
    let lastReps: number;
    
    if (direction === 'ascending') {
      lastReps = startingReps + (totalRounds - 1) * stepSize;
    } else {
      lastReps = startingReps - (totalRounds - 1) * stepSize;
    }
    
    return (totalRounds * (firstReps + Math.max(0, lastReps))) / 2;
  }

  getDescription(): string {
    return 'Each exercise has independent progression with custom starting reps, step size, and direction (ascending or descending)';
  }
}

/**
 * Chipper Ladder Strategy
 * Pattern: Each exercise is performed once with its fixed reps count
 * Each exercise = 1 round
 * Round 1: Exercise 1 with fixedReps
 * Round 2: Exercise 2 with fixedReps
 * Round 3: Exercise 3 with fixedReps
 */
export class ChipperLadderStrategy implements LadderStrategy {
  getExercisesForRound(
    roundNumber: number,
    exercises: Exercise[]
  ): Array<{ exercise: Exercise; reps: number }> {
    // Each round performs only one exercise - the exercise at that position
    const exercise = exercises.find(ex => ex.position === roundNumber);
    
    if (!exercise) {
      return [];
    }
    
    return [{
      exercise: exercise,
      reps: exercise.fixedReps || 0,
    }];
  }

  calculateTotalReps(exercise: Exercise, totalRounds: number): number {
    // Exercise is only performed once (in its own round)
    // Only count if that round has been completed
    if (totalRounds >= exercise.position) {
      return exercise.fixedReps || 0;
    }
    return 0;
  }

  getDescription(): string {
    return 'Complete each exercise once in order. Each exercise is one round with a fixed number of reps.';
  }
}

/**
 * Factory function to get the appropriate ladder strategy
 */
export function getLadderStrategy(ladderType: LadderType, stepSize: number = 1, maxRounds?: number, startingReps?: number): LadderStrategy {
  switch (ladderType) {
    case 'christmas':
      return new ChristmasLadderStrategy();
    case 'ascending':
      return new AscendingLadderStrategy(stepSize, startingReps);
    case 'descending':
      return new DescendingLadderStrategy(stepSize, maxRounds, startingReps);
    case 'pyramid':
      return new PyramidLadderStrategy(stepSize, maxRounds);
    case 'flexible':
      return new FlexibleLadderStrategy(maxRounds);
    case 'chipper':
      return new ChipperLadderStrategy();
    default:
      throw new Error(`Unknown ladder type: ${ladderType}`);
  }
}
