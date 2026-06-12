import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Edit2, Trash2 } from "lucide-react";
import type { Task } from "../../../types/task";
import { useProgress } from "../../../hooks/useProgress";
import { Card } from "../../ui/Card";

interface TaskItemProps {
  task: Task;
  onComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export function TaskItem({ task, onComplete, onEdit, onDelete }: TaskItemProps) {
  const [status, setStatus] = useState<Task["status"]>(task.status);
  const progress = useProgress(task.created_at, task.due_date);

  useEffect(() => {
    setStatus(task.status);
  }, [task.status]);

  useEffect(() => {
    if (status === "active" && progress >= 100) {
      setStatus("overdue");
    }
  }, [progress, status]);

  const dueTime = new Date(task.due_date).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const categoryName = task.category_name || "Без категории";
  const categoryColors: Record<string, string> = {
    Здоровье: "bg-blue-500/20 text-blue-600",
    Работа: "bg-purple-500/20 text-purple-600",
    Тренировки: "bg-orange-500/20 text-orange-600",
    Gym: "bg-orange-500/20 text-orange-600",
    "Без категории": "bg-slate-200 text-slate-700",
  };
  const categoryClass =
    categoryColors[categoryName] || "bg-[var(--tg-theme-secondary-bg-color)] text-tg-text";

  const handleComplete = () => {
    onComplete({ ...task, status: "completed" });
    setStatus("completed");
  };

  return (
    <Card status={status}>
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-tg-text">{task.title}</h3>
            <span className="text-xs text-[var(--tg-theme-hint-color)]">{dueTime}</span>
          </div>

          <div className="flex gap-1">
            <motion.button
              onClick={handleComplete}
              whileTap={{ scale: 0.85 }}
              className="rounded p-1 text-green-500 hover:bg-green-500/10"
              disabled={status === "completed"}
              type="button"
              aria-label="Пометить как выполнено"
              title="Пометить как выполнено"
            >
              <CheckCircle2 size={18} />
            </motion.button>
            <motion.button
              onClick={() => onEdit(task)}
              whileTap={{ scale: 0.85 }}
              className="rounded p-1 text-blue-500 hover:bg-blue-500/10"
              type="button"
              aria-label="Редактировать задачу"
              title="Редактировать"
            >
              <Edit2 size={18} />
            </motion.button>
            <motion.button
              onClick={() => {
                if (window.confirm('Удалить задачу "' + task.title + '"?')) {
                  onDelete(task.id);
                }
              }}
              whileTap={{ scale: 0.85 }}
              className="rounded p-1 text-red-500 hover:bg-red-500/10"
              type="button"
              aria-label="Удалить задачу"
              title="Удалить"
            >
              <Trash2 size={18} />
            </motion.button>
          </div>
        </div>

        <span className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${categoryClass}`}>
          {categoryName}
        </span>

        <div className="h-1 w-full overflow-hidden rounded-full bg-[var(--tg-theme-hint-color)]/20">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      </div>
    </Card>
  );
}
