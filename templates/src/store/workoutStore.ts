import { create } from "zustand";
import type { Exercise, Set } from "../types/workout";

export interface ActiveSet extends Set {
  id: string;
}

export interface ActiveExercise extends Omit<Exercise, "id" | "sets"> {
  id: string;
  exerciseId: string;
  sets: ActiveSet[];
}

interface WorkoutState {
  activeExercises: ActiveExercise[];
  addExercise: (exercise: Exercise) => void;
  addSet: (exerciseId: string, set: Set) => void;
  removeSet: (exerciseId: string, setId: string) => void;
  updateSet: (exerciseId: string, setId: string, set: Set) => void;
  removeExercise: (exerciseId: string) => void;
  clearWorkout: () => void;
  getTotalTonnage: () => number;
}

function createLocalId() {
  return window.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  activeExercises: [],

  addExercise: (exercise) =>
    set((state) => ({
      activeExercises: [
        ...state.activeExercises,
        {
          ...exercise,
          id: createLocalId(),
          exerciseId: exercise.id,
          sets: [{ id: createLocalId(), reps: 8, weight: 0 }],
        },
      ],
    })),

  addSet: (exerciseId, newSet) =>
    set((state) => ({
      activeExercises: state.activeExercises.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: [
                ...ex.sets,
                {
                  ...newSet,
                  id: createLocalId(),
                },
              ],
            }
          : ex,
      ),
    })),

  removeSet: (exerciseId, setId) =>
    set((state) => ({
      activeExercises: state.activeExercises.map((ex) =>
        ex.id === exerciseId
          ? { ...ex, sets: ex.sets.filter((s) => s.id !== setId) }
          : ex,
      ),
    })),

  updateSet: (exerciseId, setId, newSet) =>
    set((state) => ({
      activeExercises: state.activeExercises.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: ex.sets.map((s) => (s.id === setId ? { ...s, ...newSet } : s)),
            }
          : ex,
      ),
    })),

  removeExercise: (exerciseId) =>
    set((state) => ({
      activeExercises: state.activeExercises.filter((ex) => ex.id !== exerciseId),
    })),

  clearWorkout: () => set({ activeExercises: [] }),

  getTotalTonnage: () => {
    const { activeExercises } = get();
    return activeExercises.reduce((total, ex) => {
      const exTonnage = ex.sets.reduce((sum, set) => sum + ((set.weight || 0) * set.reps), 0);
      return total + exTonnage;
    }, 0);
  },
}));
