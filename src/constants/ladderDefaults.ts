import { LadderType } from '../types';

interface LadderDefaults {
  maxRounds: number;
  stepSize: number;
  startingReps: number;
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
};

export const getLadderDefaults = (ladderType: LadderType): LadderDefaults => {
  return LADDER_DEFAULTS[ladderType];
};
