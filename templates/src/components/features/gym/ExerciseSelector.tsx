import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useExercises } from "../../../api/gym";
import type { Exercise } from "../../../types/workout";

interface ExerciseSelectorProps {
  onSelect: (exercise: Exercise) => void;
}

export function ExerciseSelector({ onSelect }: ExerciseSelectorProps) {
  const [query, setQuery] = useState("");
  const { data: exercises = [] } = useExercises();

  const filtered = useMemo(() => {
    if (!query.trim()) return exercises;
    const lower = query.toLowerCase();
    return exercises.filter((exercise) => exercise.name.toLowerCase().includes(lower));
  }, [exercises, query]);

  const grouped = useMemo(() => {
    return filtered.reduce<Record<string, Exercise[]>>((acc, exercise) => {
      const group = exercise.muscleGroup || "Без группы";
      acc[group] = acc[group] || [];
      acc[group].push(exercise);
      return acc;
    }, {});
  }, [filtered]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--tg-theme-hint-color)]" />
        <input
          type="text"
          placeholder="Поиск упражнений..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-lg bg-[var(--tg-theme-secondary-bg-color)] pl-10 pr-4 py-3 text-sm outline-none placeholder:text-[var(--tg-theme-hint-color)]"
        />
      </div>

      <div className="space-y-4 max-h-[60vh] overflow-y-auto">
        {Object.entries(grouped).map(([group, groupExercises]) => (
          <div key={group}>
            <h3 className="mb-2 text-xs font-semibold uppercase text-[var(--tg-theme-hint-color)]">
              {group}
            </h3>
            <div className="space-y-1">
              {groupExercises.map((exercise) => (
                <motion.button
                  key={exercise.id}
                  onClick={() => onSelect(exercise)}
                  whileTap={{ scale: 0.95 }}
                  className="w-full rounded-lg bg-[var(--tg-theme-secondary-bg-color)] px-4 py-3 text-left text-sm font-medium text-tg-text transition hover:bg-[var(--tg-theme-button-color)]/20"
                >
                  <div className="font-semibold">{exercise.name}</div>
                  {exercise.description && (
                    <p className="mt-1 text-xs text-[var(--tg-theme-hint-color)]">
                      {exercise.description}
                    </p>
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
