import { motion } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
import { useWorkoutStore } from "../../../store/workoutStore";

interface ActiveWorkoutSessionProps {
  onExerciseClick: (exerciseId: string) => void;
  readOnly?: boolean;
}

export function ActiveWorkoutSession({ onExerciseClick, readOnly = false }: ActiveWorkoutSessionProps) {
  const { activeExercises, addSet, removeSet, updateSet, removeExercise } = useWorkoutStore();

  if (activeExercises.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-[var(--tg-theme-hint-color)]">Упражнения еще не добавлены</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activeExercises.map((exercise) => (
        <motion.div
          key={exercise.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg bg-[var(--tg-theme-secondary-bg-color)] p-4"
        >
          <div className="mb-3 flex items-center justify-between">
            <button
              onClick={() => onExerciseClick(exercise.id)}
              className="flex-1 text-left"
              type="button"
            >
              <h3 className="cursor-pointer font-semibold text-tg-text underline hover:opacity-70">
                {exercise.name}
              </h3>
              <p className="text-xs text-[var(--tg-theme-hint-color)]">{exercise.muscleGroup}</p>
            </button>
            <button
              onClick={() => removeExercise(exercise.id)}
              className="rounded p-1 text-red-500 hover:bg-red-500/20"
              type="button"
              disabled={readOnly}
            >
              <Trash2 size={18} />
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <span className="w-14 text-[10px] font-semibold uppercase text-[var(--tg-theme-hint-color)]">№</span>
              <span className="min-w-0 flex-1 text-[10px] font-semibold uppercase text-[var(--tg-theme-hint-color)]">Вес, кг</span>
              <span className="w-20 text-[10px] font-semibold uppercase text-[var(--tg-theme-hint-color)]">Повт.</span>
              <span className="w-8" />
            </div>
            {exercise.sets.map((set, index) => (
              <div key={set.id} className="flex items-center gap-2">
                <span className="w-14 text-center text-xs font-bold text-[var(--tg-theme-hint-color)]">
                  {index + 1}
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.5"
                  value={set.weight || ""}
                  onChange={(event) =>
                    !readOnly &&
                    updateSet(exercise.id, set.id, {
                      ...set,
                      weight: parseFloat(event.target.value) || 0,
                    })
                  }
                  placeholder="0"
                  disabled={readOnly}
                  className="min-w-0 flex-1 rounded-lg bg-[var(--tg-theme-bg-color)] px-3 py-2.5 text-center text-sm font-medium outline-none disabled:cursor-not-allowed disabled:opacity-70"
                />
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  value={set.reps || ""}
                  onChange={(event) =>
                    !readOnly &&
                    updateSet(exercise.id, set.id, {
                      ...set,
                      reps: parseInt(event.target.value, 10) || 0,
                    })
                  }
                  placeholder="0"
                  disabled={readOnly}
                  className="w-20 rounded-lg bg-[var(--tg-theme-bg-color)] px-3 py-2.5 text-center text-sm font-medium outline-none disabled:cursor-not-allowed disabled:opacity-70"
                />
                <button
                  onClick={() => removeSet(exercise.id, set.id)}
                  className="w-8 rounded-lg p-1.5 text-red-500/70 hover:bg-red-500/10 hover:text-red-500"
                  type="button"
                  disabled={readOnly}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <motion.button
            onClick={() => {
              if (readOnly) return;
              const lastSet = exercise.sets[exercise.sets.length - 1];
              addSet(exercise.id, {
                weight: lastSet?.weight || 0,
                reps: lastSet?.reps || 8,
              });
            }}
            whileTap={{ scale: 0.95 }}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--tg-theme-hint-color)]/30 py-2.5 text-xs font-semibold text-[var(--tg-theme-hint-color)] disabled:cursor-not-allowed disabled:opacity-70"
            type="button"
            disabled={readOnly}
          >
            <Plus size={16} />
            Добавить подход
          </motion.button>
        </motion.div>
      ))}
    </div>
  );
}
