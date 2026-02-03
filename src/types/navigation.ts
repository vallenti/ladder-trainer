import type { NavigatorScreenParams } from '@react-navigation/native';
import type { StackScreenProps } from '@react-navigation/stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export type RootStackParamList = {
  HomeTabs: NavigatorScreenParams<HomeTabParamList>;
  Countdown: { workoutId: string };
  ActiveWorkout: { workoutId: string };
  Rest: { workoutId: string };
  WorkoutComplete: { workoutId: string };
  Legal: undefined;
};

export type HomeTabParamList = {
  Workouts: undefined;
  Logbook: undefined;
  Settings: undefined;
};

export type WorkoutStackParamList = {
  WorkoutList: undefined;
  CreateEditWorkout: { workoutId?: string };
  WorkoutDetails: { workoutId: string };
};

// Helper types for screen props
export type HomeTabScreenProps<T extends keyof HomeTabParamList> = BottomTabScreenProps<HomeTabParamList, T>;
export type RootStackScreenProps<T extends keyof RootStackParamList> = StackScreenProps<RootStackParamList, T>;