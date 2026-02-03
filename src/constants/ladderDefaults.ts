import { LadderType } from '../types';

interface LadderDefaults {
  maxRounds: number;
  stepSize: number;
  startingReps: number;
  timeCap?: number; // For AMRAP: time cap in seconds
}

export const LADDER_DEFAULTS: Record<LadderType, LadderDefaults> = {
  christmas: {
    maxRounds: 12,
    stepSize: 1, // Not relevant/used
    startingReps: 1, // Not relevant/used
  },
  ascending: {
    maxRounds: 10,
    stepSize: 1,
    startingReps: 1,
  },
  descending: {
    maxRounds: 10,
    stepSize: 1,
    startingReps: 10,
  },
  pyramid: {
    maxRounds: 5,
    stepSize: 1,
    startingReps: 1,
  },
  flexible: {
    maxRounds: 5,
    stepSize: 1, // Not relevant/used (per exercise)
    startingReps: 1, // Not relevant/used (per exercise)
  },
  chipper: {
    maxRounds: 5, // Default starting count, will match exercise count
    stepSize: 1, // Not relevant/used
    startingReps: 1, // Not relevant/used (per exercise fixedReps)
  },
  amrap: {
    maxRounds: 999, // Not used - rounds are unlimited until time cap
    stepSize: 1, // Not relevant/used (per exercise)
    startingReps: 1, // Not relevant/used (per exercise)
    timeCap: 600, // Default 10 minutes
  },
};

export const getLadderDefaults = (ladderType: LadderType): LadderDefaults => {
  return LADDER_DEFAULTS[ladderType];
};
