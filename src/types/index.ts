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

export type LadderType = 'christmas' | 'ascending' | 'descending' | 'pyramid' | 'flexible' | 'chipper' | 'amrap' | 'forreps';

export interface Exercise {
  position: number; // 1-12
  unit: string; // "reps", "calories", "meters"
  name: string; // "Wall Walk", "Row"
  // Flexible ladder per-exercise settings
  direction?: 'ascending' | 'descending' | 'constant';
  startingReps?: number;
  stepSize?: number;
  // Chipper ladder per-exercise fixed count
  fixedReps?: number;
  // AMRAP partial round completion
  partialReps?: number;
  // ForReps per-exercise reps (each round uses this value)
  repsPerRound?: number;
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
  timeCap?: number; // For AMRAP: time cap in seconds
  // Buy In/Out exercise (same exercise before and after workout)
  buyInOutExercise?: Exercise; // Optional buy-in/out exercise
  hasBuyInOut?: boolean; // Whether buy-in/out is enabled
  buyInOutRestSeconds?: number; // Optional rest after buy-in and before buy-out
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
  timeCap?: number; // snapshot from template - for AMRAP
  // Buy In/Out
  buyInOutExercise?: Exercise; // snapshot from template
  hasBuyInOut?: boolean; // snapshot from template
  buyInOutRestSeconds?: number; // snapshot from template
  buyInCompleted?: boolean; // Track if buy-in is completed
  buyOutCompleted?: boolean; // Track if buy-out is completed
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