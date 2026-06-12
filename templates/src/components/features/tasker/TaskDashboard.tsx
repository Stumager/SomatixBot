import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { useTasks } from "../../../api/tasks";

export function TaskDashboard() {
  const { data: tasks = [] } = useTasks();

  const stats = {
    active: tasks.filter((task) => task.status === "active").length,
    completed: tasks.filter((task) => task.status === "completed").length,
    overdue: tasks.filter((task) => task.status === "overdue").length,
  };

  const chartData = [
    { name: "Активные", value: stats.active, fill: "var(--tg-theme-hint-color)" },
    { name: "Выполнено", value: stats.completed, fill: "#10b981" },
    { name: "Просрочено", value: stats.overdue, fill: "#ef4444" },
  ].filter((item) => item.value > 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-6 rounded-lg bg-[var(--tg-theme-secondary-bg-color)] p-4">
        <ResponsiveContainer width={120} height={120}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={35}
              outerRadius={60}
              dataKey="value"
              strokeWidth={0}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="flex flex-1 flex-col gap-3">
          <div className="text-xs text-[var(--tg-theme-hint-color)]">
            Активные: <span className="font-semibold text-tg-text">{stats.active}</span>
          </div>
          <div className="text-xs text-[var(--tg-theme-hint-color)]">
            Выполнено: <span className="font-semibold text-tg-text">{stats.completed}</span>
          </div>
          <div className="text-xs text-[var(--tg-theme-hint-color)]">
            Просрочено: <span className="font-semibold text-tg-text">{stats.overdue}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
