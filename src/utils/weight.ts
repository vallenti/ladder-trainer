import { ExerciseLoad, WeightUnit } from '../types';

const KG_PER_LB = 0.45359237;

export const toKg = (value: number, unit: WeightUnit): number =>
  unit === 'kg' ? value : value * KG_PER_LB;

export const fromKg = (valueKg: number, unit: WeightUnit): number =>
  unit === 'kg' ? valueKg : valueKg / KG_PER_LB;

/** Whole display units are intentional: 100 lb displays as 45 kg, 20 kg as 44 lb. */
export const roundedDisplayWeight = (valueKg: number, unit: WeightUnit): number =>
  Math.round(fromKg(valueKg, unit));

export const formatLoad = (load?: ExerciseLoad): string | undefined =>
  load ? `${roundedDisplayWeight(load.valueKg, load.displayUnit)} ${load.displayUnit}` : undefined;

/** Total volume for a loaded exercise: load per rep multiplied by completed reps. */
export const formatTotalLoad = (load: ExerciseLoad | undefined, totalReps: number): string | undefined =>
  load ? `${roundedDisplayWeight(load.valueKg * totalReps, load.displayUnit)} ${load.displayUnit}` : undefined;
