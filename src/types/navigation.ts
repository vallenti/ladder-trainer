import type { NavigatorScreenParams } from '@react-navigation/native';
import type { StackScreenProps } from '@react-navigation/stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export type RootStackParamList = {
  HomeTabs: NavigatorScreenParams<HomeTabParamList>;
  WorkoutFlow: NavigatorScreenParams<WorkoutStackParamList>;
};

export type HomeTabParamList = {
  Templates: undefined;
  Logbook: undefined;
};

export type TemplateStackParamList = {
  TemplateList: undefined;
  CreateEditTemplate: { templateId?: string };
  TemplateDetails: { templateId: string };
};

export type WorkoutStackParamList = {
  Countdown: { templateId: string };
  ActiveWorkout: { workoutId: string };
  Rest: { workoutId: string };
  WorkoutComplete: { workoutId: string };
};

// Helper types for screen props
export type HomeTabScreenProps<T extends keyof HomeTabParamList> = BottomTabScreenProps<HomeTabParamList, T>;
export type RootStackScreenProps<T extends keyof RootStackParamList> = StackScreenProps<RootStackParamList, T>;