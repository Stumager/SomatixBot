export type WorkoutStatus = "planned" | "active" | "completed";

export interface MuscleGroup {
  id: string;
  name: string;
}

export interface Exercise {
  id: string;
  name: string;
  muscle_group_id: string;
  muscle_group_name: string;
  technique?: string | null;
  description?: string;
}

export interface WorkoutSet {
  id?: string;
  reps: number;
  weight?: number;
}

export interface WorkoutExercise {
  exercise_id: string;
  exercise_name: string;
  sets: WorkoutSet[];
}

export interface Workout {
  id: string;
  task_id: string;
  title: string;
  date: string;
  status: WorkoutStatus;
  total_volume: number;
  exercises: WorkoutExercise[];
}
