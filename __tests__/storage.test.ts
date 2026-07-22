import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadWorkoutHistory, loadWorkouts } from '../src/utils/storage';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

describe('storage hydration contracts', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('rehydrates template dates from persisted JSON', async () => {
    await AsyncStorage.setItem('@workouts', JSON.stringify([
      { id: 't1', name: 'Test', exercises: [], restPeriodSeconds: 0, ladderType: 'christmas', maxRounds: 1, createdAt: '2026-01-02T03:04:05.000Z' },
    ]));
    const [template] = await loadWorkouts();
    expect(template.createdAt).toBeInstanceOf(Date);
    expect(template.createdAt.toISOString()).toBe('2026-01-02T03:04:05.000Z');
  });

  it('rehydrates workout and round dates', async () => {
    await AsyncStorage.setItem('@workout_history', JSON.stringify([
      { id: 'w1', startTime: '2026-01-02T03:04:05.000Z', endTime: '2026-01-02T03:05:05.000Z', rounds: [{ roundNumber: 1, startTime: '2026-01-02T03:04:05.000Z', endTime: '2026-01-02T03:04:15.000Z', duration: 10 }] },
    ]));
    const [workout] = await loadWorkoutHistory();
    expect(workout.startTime).toBeInstanceOf(Date);
    expect(workout.rounds[0].endTime).toBeInstanceOf(Date);
  });
});
