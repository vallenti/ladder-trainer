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

export type LadderType = 'christmas' | 'ascending' | 'descending' | 'pyramid';

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
  ladderType: LadderType;
  maxRounds: number;
  stepSize?: number; // For ascending/descending ladder: step increment (default 1)
  startingReps?: number; // For ascending/descending ladder: starting reps (default 1)
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
  ladderType: LadderType; // snapshot from template
  maxRounds: number; // snapshot from template
  stepSize?: number; // snapshot from template
  startingReps?: number; // snapshot from template
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