
export type UserMode = 'YOUTH' | 'GENERAL' | 'SENIOR';
export type PainArea = 'KNEE' | 'SHOULDER' | 'LOWER_BACK' | 'UPPER_BACK' | 'GENERAL';
export type Goal = 'REDUCE_PAIN' | 'FLEXIBILITY' | 'ACTIVE' | 'POSTURE';
export type RehabArea = 'neck' | 'back' | 'knee';
export type RehabMode = 'EASY' | 'MEDIUM' | 'HARD';
export type RehabDifficultyKey = 'easy' | 'medium' | 'hard';

export interface ExercisePreference {
  area: RehabArea;
  mode: RehabMode;
}

export interface RehabExercise {
  id: string;
  name: string;
  reps: string;
  description: string;
  hold?: string;
  durationMin?: number;
  imageUrl?: string;
  videoUrl?: string;
  targetJoints?: string[];
  tags?: string[];
}

export interface RehabSection {
  title: string;
  description?: string;
  exercises: RehabExercise[];
}

export interface RehabDifficultyPlan {
  duration: string;
  focus: string;
  summary: string;
  sections: RehabSection[];
}

export interface RehabProtocolMeta {
  frequency: string;
  sets: string;
  reps: string;
  hold?: string;
  commonExercises: string;
}

export interface RehabProtocol {
  id: RehabArea;
  title: string;
  summary: string;
  meta: RehabProtocolMeta;
  difficulty: Record<RehabDifficultyKey, RehabDifficultyPlan>;
}

export interface UserProfile {
  id: string;
  name: string;
  isGuest: boolean;
  age: number;
  mode: UserMode;
  painAreas: PainArea[];
  goals: Goal[];
  activityLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  onboardingComplete: boolean;
  isSubscribed: boolean;
  subscriptionPlan?: 'WEEKLY' | 'MONTHLY';
  exercisePreference?: ExercisePreference;
}

export interface ExerciseSession {
  id: string;
  timestamp: number;
  exerciseName: string;
  durationSeconds: number;
  avgPostureScore: number;
}

export interface DailyStats {
  date: string;
  steps: number;
  distanceMeters: number;
  calories: number; // Rough estimate
  workouts: ExerciseSession[];
  checklist: Record<string, boolean>; // e.g., "water_1": true
}

export interface ExerciseDef {
  id: string;
  title: string;
  description: string;
  durationMin: number;
  tags: string[];
  thumbnail: string;
  targetJoints: string[]; // For pose detection logic
}

export interface Ingredient {
  name: string;
  amount: string;
  image?: string;
}

export interface MealDef {
  id: string;
  category: string;
  name: string;
  tags: string[];
  image: string;
  calories: number;
  protein: string;
  fat: string;
  carbs: string;
  time: string;
  ingredients: Ingredient[];
  instructions: string[];
}

export interface FoodAnalysisResult {
  name: string;
  tags: string[];
  calories: string;
  protein: string;
  fat: string;
  carbs: string;
  fiber: string;
  ingredients: string[];
  healthTips: string; // Used in place of instructions
  balanced: boolean;
  summary: string;
}

export const EXERCISES: ExerciseDef[] = [
  {
    id: 'desk_stretch',
    title: 'Desk Neck Release',
    description: 'Gentle stretching for upper back and neck tension.',
    durationMin: 3,
    tags: ['Neck', 'Low Impact'],
    thumbnail: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=300&auto=format&fit=crop',
    targetJoints: ['nose', 'shoulders']
  },
  {
    id: 'squats_gentle',
    title: 'Chair-Assist Squats',
    description: 'Strengthen knees and glutes with support.',
    durationMin: 5,
    tags: ['Knee', 'Strength'],
    thumbnail: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=300&auto=format&fit=crop',
    targetJoints: ['hip', 'knee', 'ankle']
  },
  {
    id: 'cat_cow',
    title: 'Cat-Cow Flow',
    description: 'Improve spinal flexibility and reduce lower back pain.',
    durationMin: 4,
    tags: ['Lower Back', 'Mobility'],
    thumbnail: 'https://images.unsplash.com/photo-1600618528240-fb9fc964b853?q=80&w=300&auto=format&fit=crop',
    targetJoints: ['shoulder', 'hip']
  }
];
