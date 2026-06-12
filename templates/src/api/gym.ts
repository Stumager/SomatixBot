import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import type { Exercise, Workout } from "../types/workout";

interface ExerciseDto {
  id: number;
  name: string;
  muscle_category_name: string;
  technique?: string | null;
}

interface WorkoutDto {
  id: number;
  task: number;
  task_name: string;
  date: string;
  is_finished: boolean;
  total_volume?: number | null;
  exercise_grouped?: Array<{
    exercise_id: number;
    exercise_name: string;
    muscle_category_name?: string | null;
    sets: Array<{ id: number; weight: number; repetitions: number }>;
  }>;
}

interface FinishWorkoutPayload {
  id: string | number;
  date?: string;
  sets: Array<{
    exercise: string | number;
    weight: number;
    repetitions: number;
  }>;
}

export async function fetchExercises(): Promise<Exercise[]> {
  const { data } = await apiClient.get<ExerciseDto[]>("/gym/catalog/");

  return data.map((item) => ({
    id: String(item.id),
    name: item.name,
    muscleGroup: item.muscle_category_name,
    description: item.technique ?? "",
    sets: [],
  }));
}

export function useExercises() {
  return useQuery({
    queryKey: ["exercises"],
    queryFn: fetchExercises,
    staleTime: 300000,
  });
}

export function mapWorkoutDto(dto: WorkoutDto): Workout & { exercise_grouped?: WorkoutDto["exercise_grouped"] } {
  return {
    id: String(dto.id),
    date: dto.date,
    status: dto.is_finished ? "completed" : "planned",
    exercises: (dto.exercise_grouped ?? []).map((group) => ({
      id: String(group.exercise_id),
      name: group.exercise_name,
      muscleGroup: group.muscle_category_name ?? "",
      sets: group.sets.map((set) => ({
        reps: set.repetitions,
        weight: Number(set.weight),
      })),
    })),
    exercise_grouped: dto.exercise_grouped ?? [],
    totalTonnage: Number(dto.total_volume ?? 0),
  };
}

export async function fetchWorkoutById(id: string | number): Promise<Workout & { exercise_grouped?: WorkoutDto["exercise_grouped"] }> {
  const { data } = await apiClient.get<WorkoutDto>(`/gym/workouts/${id}/`);
  return mapWorkoutDto(data);
}

export async function fetchWorkouts(): Promise<Workout[]> {
  const { data } = await apiClient.get<WorkoutDto[]>("/gym/workouts/");
  return Array.isArray(data) ? data.map(mapWorkoutDto) : [];
}

export function useWorkouts() {
  return useQuery({
    queryKey: ["workouts"],
    queryFn: fetchWorkouts,
    staleTime: 10000,
  });
}

export function useCreateWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: number | string) => {
      const { data } = await apiClient.post<WorkoutDto>("/gym/workouts/", { task: taskId });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useUpdateWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { id: string | number; data: Partial<WorkoutDto> }) => {
      const { id, data } = payload;
      const response = await apiClient.patch<WorkoutDto>(`/gym/workouts/${id}/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
    },
  });
}

export function useFinishWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...payload }: FinishWorkoutPayload) => {
      const { data } = await apiClient.post<WorkoutDto>(`/gym/workouts/${id}/finish/`, payload);
      return mapWorkoutDto(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useDeleteWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string | number) => {
      await apiClient.delete(`/gym/workouts/${id}/`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
    },
  });
}

export function calculateTonnage(sets: Array<{ reps: number; weight?: number }>): number {
  return sets.reduce((sum, set) => sum + (set.weight ?? 0) * set.reps, 0);
}

export function groupExercisesByMuscleGroup(exercises: Exercise[]) {
  return exercises.reduce<Record<string, Exercise[]>>((acc, exercise) => {
    if (!acc[exercise.muscleGroup]) {
      acc[exercise.muscleGroup] = [];
    }
    acc[exercise.muscleGroup].push(exercise);
    return acc;
  }, {});
}

export function searchExercises(query: string, exercises: Exercise[]) {
  if (!query.trim()) return exercises;
  const lower = query.toLowerCase();
  return exercises.filter((exercise) => exercise.name.toLowerCase().includes(lower));
}
