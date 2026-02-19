import { Exercise } from '../types';

/**
 * Calculate total reps for each exercise in a 12 Days workout
 * Exercise at position N is performed (13 - N) times
 * Position 1: 12 times, Position 2: 11 times, ..., Position 12: 1 time
 */
export const calculateTotalReps = (exercises: Exercise[]): Map<number, number> => {
  const totals = new Map<number, number>();
  
  exercises.forEach(exercise => {
    const timesPerformed = 13 - exercise.position;
    const totalReps = exercise.position * timesPerformed;
    totals.set(exercise.position, totalReps);
  });
  
  return totals;
};

/**
 * Get exercises for a specific round in display order (highest to lowest position)
 */
export const getExercisesForRound = (roundNumber: number, allExercises: Exercise[]): Exercise[] => {
  return allExercises
    .filter(ex => ex.position <= roundNumber)
    .sort((a, b) => b.position - a.position);
};

/**
 * Format time in MM:SS or HH:MM:SS
 */
export const formatTime = (seconds: number): string => {
  seconds = Math.floor(seconds); // Ensure integer seconds
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};