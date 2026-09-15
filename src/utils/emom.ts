import { EmomInterval } from '../types';

export const getEmomTotalIntervals = (intervals: EmomInterval[] = [], cycles = 0): number =>
  intervals.length * cycles;

export const getEmomTotalDuration = (
  intervalSeconds = 60,
  intervals: EmomInterval[] = [],
  cycles = 0
): number => intervalSeconds * getEmomTotalIntervals(intervals, cycles);

export const formatEmomLabel = (intervalSeconds = 60): string => {
  if (intervalSeconds === 60) return 'EMOM';
  if (intervalSeconds > 0 && intervalSeconds % 60 === 0) return `E${intervalSeconds / 60}MOM`;
  if (intervalSeconds < 60) return `Every ${intervalSeconds} sec`;
  const minutes = Math.floor(intervalSeconds / 60);
  const seconds = intervalSeconds % 60;
  return `Every ${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;
};

export const getEmomInterval = (
  roundNumber: number,
  intervals: EmomInterval[] = []
): EmomInterval | undefined => {
  if (roundNumber < 1 || intervals.length === 0) return undefined;
  return intervals[(roundNumber - 1) % intervals.length];
};
