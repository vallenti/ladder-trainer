export interface ExampleComponentProps {
  title: string;
  onPress: () => void;
}

export interface HomeScreenProps {
  navigation: any; // Replace 'any' with a more specific type if using a navigation library
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface Exercise {
  position: number; // 1-12
  unit: string; // "reps", "calories", "meters"
  name: string; // "Wall Walk", "Row"
}

export interface Template {
  id: string;
  name: string;
  exercises: Exercise[]; // 1-12 items
  restPeriodSeconds: number; // 0 = no rest
  createdAt: Date;
}

export interface Round {
  roundNumber: number;
  startTime: Date;
  endTime?: Date;
  duration: number; // seconds
}

export type WorkoutStatus = 'incomplete' | 'completed';

export interface Workout {
  id: string;
  templateName: string; // snapshot
  exercises: Exercise[]; // snapshot from template
  restPeriodSeconds: number;
  startTime: Date;
  endTime?: Date;
  status: WorkoutStatus;
  totalTime: number; // seconds
  rounds: Round[];
  currentRoundIndex: number; // for resume
}

export interface StravaTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}