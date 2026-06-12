import { motion } from "framer-motion";
import { TaskItem } from "./TaskItem";
import type { Task } from "../../../types/task";

interface TaskListViewProps {
  tasks: Task[];
  filter: string;
  searchQuery: string;
  onComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

function formatDateGroup(date: Date): string {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return "Сегодня";
  if (date.toDateString() === tomorrow.toDateString()) return "Завтра";

  return date.toLocaleDateString("ru-RU", { month: "short", day: "numeric" });
}

export function TaskListView({
  tasks,
  filter,
  searchQuery,
  onComplete,
  onEdit,
  onDelete,
}: TaskListViewProps) {
  let filtered = tasks;

  if (filter !== "all") {
    filtered = tasks.filter((t) => t.status === filter || (filter === "done" && t.status === "completed"));
  }

  if (searchQuery) {
    filtered = filtered.filter((t) => t.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }

  const grouped: Record<string, Task[]> = {};
  filtered.forEach((task) => {
    const dateKey = new Date(task.due_date).toDateString();
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(task);
  });

  Object.keys(grouped).forEach((key) => {
    grouped[key].sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
  });

  const sortedKeys = Object.keys(grouped).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime(),
  );

  if (sortedKeys.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-[var(--tg-theme-hint-color)]">Задачи не найдены</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sortedKeys.map((dateKey, idx) => (
        <motion.div
          key={dateKey}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
        >
          <h3 className="mb-2 text-xs font-semibold uppercase text-[var(--tg-theme-hint-color)]">
            {formatDateGroup(new Date(dateKey))}
          </h3>
          <div className="space-y-2">
            {grouped[dateKey].map((task, i) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (idx * 0.05) + (i * 0.03) }}
              >
                <TaskItem
                  task={task}
                  onComplete={onComplete}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
