import { motion } from "framer-motion";
import type { Workout } from "../../../types/workout";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";

interface WorkoutCardProps {
  workout: any;
  onStart?: (workout: Workout) => void;
  onEdit?: (workout: Workout) => void;
}

export function WorkoutCard({ workout, onStart, onEdit }: WorkoutCardProps) {
  const isCompleted = workout.status === "completed";
  const date = new Date(workout.date).toLocaleDateString("ru-RU", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const muscleGroups = [...new Set(
    (workout.exercise_grouped ?? workout.exercises ?? []).map((eg: any) => eg.muscle_category_name ?? eg.muscleGroup),
  )]
    .filter(Boolean)
    .join(", ");

  const totalVolume = workout.totalTonnage ?? workout.total_volume ?? 0;
  const statusBadge = workout.status === "completed" ? "Выполнено" : "Запланировано";
  const statusColor = workout.status === "completed" ? "text-green-600" : "text-blue-600";

return (
    <Card status={isCompleted ? "completed" : "active"}>
      <div className="space-y-3">
        {/* Делаем всю верхнюю часть кликабельной для редактирования завершенной тренировки */}
        <div 
          className={`space-y-3 ${isCompleted ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}`}
          onClick={() => isCompleted && onEdit?.(workout)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs text-[var(--tg-theme-hint-color)]">{date}</p>
              <p className={`mt-1 text-xs font-semibold ${statusColor}`}>{statusBadge}</p>
            </div>
            {isCompleted && (
              <p className="text-lg font-bold text-tg-text">
                {totalVolume} кг
              </p>
            )}
          </div>

          <p className="text-sm text-tg-text">
            <span className="font-semibold">Группы:</span> {muscleGroups || "Нет упражнений"}
          </p>
        </div>

        {/* Кнопка старта для запланированных тренировок */}
        {!isCompleted && (
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={() => onStart?.(workout)}
              variant="primary"
              className="w-full text-xs"
            >
              Начать тренировку
            </Button>
          </motion.div>
        )}
      </div>
    </Card>
  );
}
