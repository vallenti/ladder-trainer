import AsyncStorage from '@react-native-async-storage/async-storage';
import { useActiveWorkoutStore } from '../src/store/activeWorkoutStore';
import type { Template } from '../src/types';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

const template: Template = {
  id: 'emom-template',
  name: 'EMOM test',
  ladderType: 'emom',
  exercises: [{ position: 1, name: 'Burpees', unit: 'reps', repsPerRound: 10 }],
  restPeriodSeconds: 0,
  maxRounds: 4,
  intervalSeconds: 60,
  emomCycles: 2,
  emomIntervals: [
    { id: 'work', position: 1, type: 'work', exercises: [{ position: 1, name: 'Burpees', unit: 'reps', repsPerRound: 10 }] },
    { id: 'rest', position: 2, type: 'rest', exercises: [] },
  ],
  isBenchmark: false,
  source: 'user',
  createdAt: new Date('2026-01-01T00:00:00Z'),
};

describe('EMOM active workout lifecycle', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    await useActiveWorkoutStore.getState().discardPausedWorkout();
  });

  it('deep-snapshots the schedule and synchronizes automatically elapsed intervals', () => {
    useActiveWorkoutStore.getState().startWorkout(template);
    template.emomIntervals![0].exercises[0].name = 'Changed later';
    useActiveWorkoutStore.getState().syncEmomProgress(3);

    const workout = useActiveWorkoutStore.getState().activeWorkout!;
    expect(workout.emomIntervals![0].exercises[0].name).toBe('Burpees');
    expect(workout.rounds).toHaveLength(3);
    expect(workout.rounds.map(round => round.duration)).toEqual([60, 60, 60]);
    expect(workout.currentRoundIndex).toBe(3);
  });

  it('checkpoints a background EMOM without marking it paused', async () => {
    useActiveWorkoutStore.getState().startWorkout(template);
    await useActiveWorkoutStore.getState().checkpointWorkout(75, 0);
    const stored = JSON.parse((await AsyncStorage.getItem('@ladder_trainer_paused_workout'))!);
    expect(stored.isPaused).toBe(false);
  });
});
