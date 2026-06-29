import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import type { Task } from "../../../types/task";

interface TaskDashboardProps {
  tasks: Task[];
}

export function TaskDashboard({ tasks }: TaskDashboardProps) {

  const stats = {
    active: tasks.filter((task) => task.status === "active").length,
    completed: tasks.filter((task) => task.status === "completed").length,
    overdue: tasks.filter((task) => task.status === "overdue").length,
  };

  const total = stats.active + stats.completed + stats.overdue;

  const chartData = total > 0
    ? [
        { name: "Активные", value: stats.active, fill: "var(--tg-theme-button-color)" },
        { name: "Выполнено", value: stats.completed, fill: "#10b981" },
        { name: "Просрочено", value: stats.overdue, fill: "#ef4444" },
      ].filter((item) => item.value > 0)
    : [{ name: "Пусто", value: 1, fill: "var(--tg-theme-hint-color)" }];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-6 rounded-lg bg-[var(--tg-theme-secondary-bg-color)] p-4">
        <div className="relative">
          <ResponsiveContainer width={120} height={120}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={55}
                dataKey="value"
                strokeWidth={0}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} opacity={total === 0 ? 0.2 : 1} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-tg-text">{total}</span>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-2">
          <div className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--tg-theme-button-color)]" />
            <span className="text-[var(--tg-theme-hint-color)]">Активные</span>
            <span className="ml-auto font-semibold text-tg-text">{stats.active}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="text-[var(--tg-theme-hint-color)]">Выполнено</span>
            <span className="ml-auto font-semibold text-tg-text">{stats.completed}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
            <span className="text-[var(--tg-theme-hint-color)]">Просрочено</span>
            <span className="ml-auto font-semibold text-tg-text">{stats.overdue}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
