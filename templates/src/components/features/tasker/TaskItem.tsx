import { motion } from "framer-motion";
import { CheckCircle2, Edit2, Trash2 } from "lucide-react";
import type { Task } from "../../../types/task";
import { useProgress } from "../../../hooks/useProgress";
import { isVisuallyOverdue } from "../../../utils/progress";
import { Card } from "../../ui/Card";

interface TaskItemProps {
  task: Task;
  onComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export function TaskItem({ task, onComplete, onEdit, onDelete }: TaskItemProps) {
  const progress = useProgress(task.created_at, task.due_date);
  const status: Task["status"] =
    task.status === "completed" ? "completed"
    : isVisuallyOverdue(task.status, task.due_date) ? "overdue"
    : "active";

  const dueTime = new Date(task.due_date).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const categoryName = task.category_name || "Без категории";

  const palette = [
    "bg-blue-500/20 text-blue-600",
    "bg-purple-500/20 text-purple-600",
    "bg-orange-500/20 text-orange-600",
    "bg-emerald-500/20 text-emerald-600",
    "bg-pink-500/20 text-pink-600",
    "bg-amber-500/20 text-amber-600",
    "bg-cyan-500/20 text-cyan-600",
    "bg-rose-500/20 text-rose-600",
  ];

  const categoryClass = categoryName === "Без категории"
    ? "bg-[var(--tg-theme-hint-color)]/15 text-[var(--tg-theme-hint-color)]"
    : palette[Math.abs([...categoryName].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 0)) % palette.length];

  const handleComplete = () => {
    onComplete({ ...task, status: "completed" });
  };

  return (
    <Card status={status}>
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className={`text-sm font-medium text-tg-text ${status === "completed" ? "line-through opacity-60" : ""}`}>{task.title}</h3>
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
                const tg = window.Telegram?.WebApp;
                if (tg?.showConfirm) {
                  tg.showConfirm(`Удалить задачу "${task.title}"?`, (ok: boolean) => {
                    if (ok) onDelete(task.id);
                  });
                } else if (window.confirm(`Удалить задачу "${task.title}"?`)) {
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

        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--tg-theme-hint-color)]/15">
          <motion.div
            className={`h-full rounded-full ${
              status === "completed"
                ? "bg-emerald-500"
                : status === "overdue"
                  ? "bg-red-500"
                  : "bg-gradient-to-r from-blue-500 to-cyan-500"
            }`}
            initial={{ width: "0%" }}
            animate={{ width: `${status === "completed" ? 100 : progress}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      </div>
    </Card>
  );
}
