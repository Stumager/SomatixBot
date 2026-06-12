import { motion } from "framer-motion";
import { Search } from "lucide-react";

interface TaskFilterProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const filters = ["all", "active", "done", "overdue"];
const filterLabels: Record<string, string> = {
  all: "Все",
  active: "Активные",
  done: "Выполненные",
  overdue: "Просроченные",
};

export function TaskFilter({
  activeFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
}: TaskFilterProps) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--tg-theme-hint-color)]" />
        <input
          type="text"
          placeholder="Поиск задач..."
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          className="w-full rounded-lg bg-[var(--tg-theme-secondary-bg-color)] py-2 pl-10 pr-4 text-sm outline-none placeholder:text-[var(--tg-theme-hint-color)]"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {filters.map((filter) => (
          <motion.button
            key={filter}
            onClick={() => onFilterChange(filter)}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium transition ${
              activeFilter === filter
                ? "bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)]"
                : "bg-[var(--tg-theme-secondary-bg-color)] text-tg-text"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
          >
            {filterLabels[filter]}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
