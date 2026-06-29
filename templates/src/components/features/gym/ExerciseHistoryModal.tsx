import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useWorkouts } from "../../../api/gym";
import type { Workout } from "../../../types/workout";

interface ExerciseHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  exerciseId?: string;
  exerciseName?: string;
}

export function ExerciseHistoryModal({
  isOpen,
  onClose,
  exerciseId,
  exerciseName,
}: ExerciseHistoryModalProps) {
  const { data: workouts = [] } = useWorkouts();

  const relevantWorkouts = workouts
    .filter((w) => w.exercises.some((e) => e.id === exerciseId) && w.status === "completed")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const chartData = relevantWorkouts.map((workout) => {
    const exercise = workout.exercises.find((e) => e.id === exerciseId);
    const maxWeight = Math.max(...(exercise?.sets?.map((s) => s.weight || 0) ?? [0]));
    return {
      date: new Date(workout.date).toLocaleDateString("ru-RU", { month: "short", day: "numeric" }),
      weight: maxWeight,
      workout: workout.id,
    };
  });

  const maxWeight = Math.max(...chartData.map((d) => d.weight), 100);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[90vh] rounded-t-2xl bg-[var(--tg-theme-bg-color)] p-4"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25 }}
          >
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-tg-text">Прогресс</h2>
                <p className="text-xs text-[var(--tg-theme-hint-color)]">{exerciseName}</p>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1 hover:bg-[var(--tg-theme-secondary-bg-color)]"
                type="button"
              >
                <X size={20} className="text-tg-text" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
              {chartData.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-sm text-[var(--tg-theme-hint-color)]">
                    По этому упражнению пока нет истории
                  </p>
                </div>
              ) : (
                <>
                  {/* Chart */}
                  <div className="mb-6 rounded-lg bg-[var(--tg-theme-secondary-bg-color)] p-4">
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                            <stop
                              offset="5%"
                              stopColor="var(--tg-theme-button-color)"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor="var(--tg-theme-button-color)"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="var(--tg-theme-hint-color)"
                          opacity={0.1}
                        />
                        <XAxis
                          dataKey="date"
                          stroke="var(--tg-theme-hint-color)"
                          style={{ fontSize: "12px" }}
                        />
                        <YAxis
                          stroke="var(--tg-theme-hint-color)"
                          style={{ fontSize: "12px" }}
                          domain={[0, maxWeight * 1.1]}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "var(--tg-theme-secondary-bg-color)",
                            border: "none",
                            borderRadius: "8px",
                          }}
                          labelStyle={{ color: "var(--tg-theme-hint-color)" }}
                        />
                        <Line
                          type="monotone"
                          dataKey="weight"
                          stroke="var(--tg-theme-button-color)"
                          strokeWidth={3}
                          dot={{ fill: "var(--tg-theme-button-color)", r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-[var(--tg-theme-secondary-bg-color)] p-3">
                      <p className="text-xs text-[var(--tg-theme-hint-color)]">Максимальный вес</p>
                      <p className="mt-1 text-xl font-bold text-tg-text">{maxWeight} кг</p>
                    </div>
                    <div className="rounded-lg bg-[var(--tg-theme-secondary-bg-color)] p-3">
                      <p className="text-xs text-[var(--tg-theme-hint-color)]">Тренировки</p>
                      <p className="mt-1 text-xl font-bold text-tg-text">{chartData.length}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
