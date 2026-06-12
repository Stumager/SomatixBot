import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { useWorkouts } from "../../../api/gym";

export function WorkoutStats() {
  const { data: workouts = [] } = useWorkouts();

  const completedWorkouts = workouts
    .filter((w) => w.status === "completed")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-5);

  const chartData = completedWorkouts.map((workout) => ({
    name: new Date(workout.date).toLocaleDateString("ru-RU", { month: "short", day: "numeric" }),
    tonnage: workout.totalTonnage,
  }));

  const maxTonnage = Math.max(...chartData.map((d) => d.tonnage), 3000);

  if (chartData.length === 0) {
    return (
      <div className="rounded-lg bg-[var(--tg-theme-secondary-bg-color)] p-4 text-center">
        <p className="text-sm text-[var(--tg-theme-hint-color)]">Тренировок пока нет</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-[var(--tg-theme-secondary-bg-color)] p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase text-[var(--tg-theme-hint-color)]">
        Общий тоннаж
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -30, bottom: 0 }}>
          <defs>
            <linearGradient id="tonnageGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--tg-theme-button-color)" stopOpacity={0.8} />
              <stop offset="95%" stopColor="var(--tg-theme-button-color)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--tg-theme-hint-color)" opacity={0.1} />
          <XAxis dataKey="name" stroke="var(--tg-theme-hint-color)" style={{ fontSize: "12px" }} />
          <YAxis stroke="var(--tg-theme-hint-color)" style={{ fontSize: "12px" }} domain={[0, maxTonnage]} />
          <Area
            type="monotone"
            dataKey="tonnage"
            stroke="var(--tg-theme-button-color)"
            fill="url(#tonnageGradient)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
