import { useState } from "react";
import { motion } from "framer-motion";
import { Dumbbell, Calendar } from "lucide-react";
import { Button } from "../../ui/Button";
import { DateTimePicker } from "../../ui/DateTimePicker";
import { WorkoutStats } from "./WorkoutStats";
import { WorkoutCard } from "./WorkoutCard";
import { WorkoutTracker } from "./WorkoutTracker";
import { useCreateWorkout, useWorkouts, fetchWorkoutById } from "../../../api/gym";
import { useCreateTask } from "../../../api/tasks";
import { useWorkoutStore } from "../../../store/workoutStore";
import type { Workout } from "../../../types/workout";

export function GymPage() {
  const { data: workouts = [] } = useWorkouts();
  const { activeExercises, clearWorkout } = useWorkoutStore();

  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isActiveWorkout, setIsActiveWorkout] = useState(false);
  const [isReadOnlyWorkout, setIsReadOnlyWorkout] = useState(false);
  const [activeWorkoutId, setActiveWorkoutId] = useState<string | number>();
  const [selectedDateTime, setSelectedDateTime] = useState("");
  const [error, setError] = useState("");

  const createTaskMutation = useCreateTask();
  const createWorkoutMutation = useCreateWorkout();

  const handleStartWorkout = (workout: Workout) => {
    clearWorkout();
    setActiveWorkoutId(workout.id);
    setIsActiveWorkout(true);
    setIsReadOnlyWorkout(false);
    setIsScheduleOpen(false);
    setError("");
  };

  const toInternalExercise = (exercise: any) => ({
    ...exercise,
    id: window.crypto?.randomUUID?.() ?? `${exercise.id}-${Date.now()}`,
    exerciseId: exercise.id,
  });

  const handleEditWorkout = async (workout: Workout & { exercise_grouped?: any[] }) => {
    if (!workout.id) {
      console.error("Workout id is missing for edit", workout);
      return;
    }

    try {
      const fetchedWorkout = await fetchWorkoutById(workout.id);
      if (!fetchedWorkout) {
        console.error("Failed to load workout for edit", workout.id);
        setError("Не удалось загрузить тренировку.");
        return;
      }

      useWorkoutStore.setState({
        activeExercises: fetchedWorkout.exercises.map(toInternalExercise),
      });
      setActiveWorkoutId(fetchedWorkout.id);
      setIsActiveWorkout(true);
      setIsReadOnlyWorkout(fetchedWorkout.status === "completed");
      setIsScheduleOpen(false);
      setError("");
    } catch (editError) {
      console.error("Ошибка загрузки тренировки для редактирования:", editError);
      setError("Не удалось загрузить тренировку.");
    }
  };

  const handleQuickStart = async () => {
    const now = new Date();
    setError("");
    setIsScheduleOpen(false);

    try {
      const createdTask = await createTaskMutation.mutateAsync({
        title: "Тренировка",
        category_id: "",
        category_name: "Тренировки",
        due_date: now.toISOString(),
      });

      const workout = await createWorkoutMutation.mutateAsync(createdTask.id);
      handleStartWorkout(workout as any);
    } catch (quickStartError) {
      console.error("Ошибка старта тренировки:", quickStartError);
      setError("Не удалось начать тренировку. Попробуйте еще раз.");
    }
  };

  const handleFinishWorkout = () => {
    clearWorkout();
    setIsActiveWorkout(false);
    setActiveWorkoutId(undefined);
  };

  const handleCancelWorkout = () => {
    const doCancel = () => {
      clearWorkout();
      setIsActiveWorkout(false);
      setActiveWorkoutId(undefined);
      setIsScheduleOpen(false);
      setSelectedDateTime("");
    };

    if (activeExercises.length === 0) {
      doCancel();
      return;
    }

    const tg = window.Telegram?.WebApp;
    if (tg?.showConfirm) {
      tg.showConfirm("Отменить текущую тренировку?", (ok: boolean) => {
        if (ok) doCancel();
      });
    } else if (window.confirm("Отменить текущую тренировку?")) {
      doCancel();
    }
  };

  const handleOpenSchedule = () => {
    setSelectedDateTime(new Date().toISOString());
    setIsScheduleOpen(true);
    setError("");
  };

  const handleSavePlanned = async () => {
    if (!selectedDateTime) {
      setError("Выберите дату и время для планирования тренировки.");
      return;
    }

    setError("");

    try {
      const createdTask = await createTaskMutation.mutateAsync({
        title: "Тренировка",
        category_id: "",
        category_name: "Тренировки",
        due_date: selectedDateTime,
      });

      const workout = await createWorkoutMutation.mutateAsync(createdTask.id);
      handleStartWorkout(workout as any);
      setSelectedDateTime("");
    } catch (scheduleError) {
      console.error("Ошибка планирования тренировки:", scheduleError);
      setError("Не удалось запланировать тренировку. Попробуйте еще раз.");
    }
  };

  if (isActiveWorkout) {
    return (
      <WorkoutTracker
        onFinish={handleFinishWorkout}
        onCancel={handleCancelWorkout}
        workoutId={activeWorkoutId}
        readOnly={isReadOnlyWorkout}
      />
    );
  }

  const sortedWorkouts = [...workouts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const completedWorkouts = workouts.filter((workout) => workout.status === "completed");
  const totalTonnage = completedWorkouts.reduce(
    (sum, workout) => sum + workout.totalTonnage,
    0,
  );

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <WorkoutStats />

      <div className="rounded-lg bg-[var(--tg-theme-secondary-bg-color)] p-4">
        <p className="text-xs text-[var(--tg-theme-hint-color)]">Тоннаж за все время</p>
        <div className="mt-3 flex items-end justify-between">
          <p className="text-3xl font-bold text-tg-text">{totalTonnage} кг</p>
          <p className="text-sm text-[var(--tg-theme-hint-color)]">
            Завершено: {completedWorkouts.length}
          </p>
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="space-y-2">
        <Button
          onClick={handleQuickStart}
          className="w-full gap-2 py-3"
          variant="primary"
          isLoading={createTaskMutation.isPending || createWorkoutMutation.isPending}
        >
          <Dumbbell size={18} />
          Начать тренировку
        </Button>

        <Button
          onClick={handleOpenSchedule}
          className="w-full gap-2 py-3"
          variant="secondary"
        >
          <Calendar size={18} />
          Запланировать тренировку
        </Button>
      </div>

      {isScheduleOpen && (
        <div className="rounded-lg bg-[var(--tg-theme-secondary-bg-color)] p-4">
          <p className="mb-3 text-sm text-[var(--tg-theme-hint-color)]">
            Выберите дату и время для тренировки:
          </p>
          <DateTimePicker value={selectedDateTime} onChange={setSelectedDateTime} />

          <div className="mt-4 flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setIsScheduleOpen(false);
                setSelectedDateTime("");
              }}
              className="flex-1"
            >
              Отмена
            </Button>
            <Button
              onClick={handleSavePlanned}
              className="flex-1"
              isLoading={createTaskMutation.isPending || createWorkoutMutation.isPending}
            >
              Сохранить
            </Button>
          </div>
        </div>
      )}

      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase text-[var(--tg-theme-hint-color)]">
          История
        </h3>
        {sortedWorkouts.length === 0 ? (
          <div className="rounded-lg bg-[var(--tg-theme-secondary-bg-color)] p-6 text-center">
            <p className="text-sm text-[var(--tg-theme-hint-color)]">
              Пока нет тренировок. Начните первую!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedWorkouts.map((workout, index) => (
              <motion.div
                key={workout.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <WorkoutCard
                  workout={workout}
                  onStart={handleStartWorkout}
                  onEdit={handleEditWorkout}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}