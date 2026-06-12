import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ChevronLeft } from "lucide-react";
import { Button } from "../../ui/Button";
import { ExerciseSelector } from "./ExerciseSelector";
import { ActiveWorkoutSession } from "./ActiveWorkoutSession";
import { ExerciseHistoryModal } from "./ExerciseHistoryModal";
import { useFinishWorkout } from "../../../api/gym";
import { useWorkoutStore } from "../../../store/workoutStore";
import type { Exercise } from "../../../types/workout";

interface WorkoutTrackerProps {
  onFinish: (tonnage: number) => void;
  onCancel: () => void;
  workoutId?: string | number;
  readOnly?: boolean;
}

export function WorkoutTracker({ onFinish, onCancel, workoutId, readOnly: readOnlyProp }: WorkoutTrackerProps) {
  const { activeExercises, addExercise, getTotalTonnage } = useWorkoutStore();
  const finishWorkout = useFinishWorkout();
  const [showSelector, setShowSelector] = useState(activeExercises.length === 0);
  const readOnly = readOnlyProp ?? false;

  useEffect(() => {
    if (readOnly) {
      setShowSelector(false);
    }
  }, [readOnly]);
  const [historyExerciseId, setHistoryExerciseId] = useState<string>();
  const [historyExerciseName, setHistoryExerciseName] = useState<string>();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [error, setError] = useState("");

  const handleSelectExercise = (exercise: Exercise) => {
    addExercise(exercise);
    setError("");
    setShowSelector(false);
  };

  const handleExerciseClick = (activeExerciseId: string) => {
    const exercise = activeExercises.find((item) => item.id === activeExerciseId);
    if (exercise) {
      setHistoryExerciseId(exercise.exerciseId ?? exercise.id);
      setHistoryExerciseName(exercise.name);
      setIsHistoryOpen(true);
    }
  };

  const handleFinish = async () => {
    const tonnage = getTotalTonnage();

    if (!workoutId) {
      setError("Не найден идентификатор тренировки. Начните тренировку заново.");
      return;
    }

    const sets = activeExercises.flatMap((exercise) => {
      const exerciseId = exercise.exerciseId ?? exercise.id;
      if (!exerciseId) {
        console.error("Отсутствует идентификатор упражнения для подхода", exercise);
        return [];
      }

      return exercise.sets
        .filter((set) => (set.weight ?? 0) > 0 && set.reps > 0)
        .map((set) => ({
          exercise: exerciseId,
          weight: set.weight ?? 0,
          repetitions: set.reps,
        }));
    });

    if (sets.length === 0) {
      setError("Добавьте хотя бы один подход с весом и повторениями.");
      return;
    }

    try {
      await finishWorkout.mutateAsync({
        id: workoutId,
        date: new Date().toISOString(),
        sets,
      });
      onFinish(tonnage);
    } catch (finishError) {
      console.error("Ошибка завершения тренировки:", finishError);
      setError("Не удалось сохранить тренировку. Проверьте соединение и попробуйте еще раз.");
    }
  };

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          className="rounded p-1 hover:bg-[var(--tg-theme-secondary-bg-color)]"
          type="button"
        >
          <ChevronLeft size={24} className="text-tg-text" />
        </button>
        <h2 className="font-semibold text-tg-text">Активная тренировка</h2>
        <div className="w-10" />
      </div>

      {showSelector ? (
        <div>
          <button
            onClick={() => setShowSelector(false)}
            className="mb-3 text-xs font-semibold text-[var(--tg-theme-hint-color)] underline"
            type="button"
          >
            Назад к тренировке
          </button>
          <ExerciseSelector onSelect={handleSelectExercise} />
        </div>
      ) : (
        <>
          <ActiveWorkoutSession
            onExerciseClick={handleExerciseClick}
            readOnly={readOnly}
          />

          <Button
            onClick={() => setShowSelector(true)}
            variant="secondary"
            className="w-full"
            disabled={readOnly}
          >
            Добавить упражнение
          </Button>
        </>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      {!showSelector && activeExercises.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2 border-t border-[var(--tg-theme-hint-color)]/10 pt-4"
        >
          <div className="flex items-center justify-between rounded-lg bg-[var(--tg-theme-secondary-bg-color)] p-3">
            <p className="text-xs text-[var(--tg-theme-hint-color)]">Общий тоннаж</p>
            <p className="text-lg font-bold text-tg-text">{getTotalTonnage()} кг</p>
          </div>

          <Button
            onClick={handleFinish}
            className="w-full gap-2"
            variant="primary"
            isLoading={finishWorkout.isPending}
            disabled={readOnly}
          >
            <CheckCircle2 size={18} />
            Завершить тренировку
          </Button>
        </motion.div>
      )}

      <ExerciseHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        exerciseId={historyExerciseId}
        exerciseName={historyExerciseName}
      />
    </motion.div>
  );
}
