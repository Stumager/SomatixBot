export function calculateTaskProgress(
  createdAt: string,
  dueDate: string,
  now = Date.now(),
) {
  const created = new Date(createdAt).getTime();
  const due = new Date(dueDate).getTime();
  const duration = due - created;

  if (!Number.isFinite(created) || !Number.isFinite(due) || duration <= 0) {
    // Некорректные даты: возвращаем 0% прогресса, чтобы не показывать
    // ошибочно завершённые/просроченные задачи в UI.
    return 0;
  }

  const progress = ((now - created) / duration) * 100;
  return Math.min(100, Math.max(0, progress));
}

export function isVisuallyOverdue(status: string, dueDate: string) {
  return status !== "completed" && Date.now() >= new Date(dueDate).getTime();
}
