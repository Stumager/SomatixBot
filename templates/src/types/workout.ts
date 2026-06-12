export interface Set {
  reps: number;
  weight?: number;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  description?: string;
  sets?: Set[];
}

export interface Workout {
  id: string;
  date: string; // ISO 8601
  status: "planned" | "completed";
  exercises: Exercise[];
  totalTonnage: number;
}
