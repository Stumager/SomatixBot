import { motion } from "framer-motion";
import type { AppTab } from "../../store/ui";
import { useUiStore } from "../../store/ui";

const tabs: Array<{ id: AppTab; label: string }> = [
  { id: "tasker", label: "Задачи" },
  { id: "gym", label: "Тренировка" },
  { id: "finance", label: "Финансы" },
];

export function TabNavigation() {
  const activeTab = useUiStore((state) => state.activeTab);
  const setActiveTab = useUiStore((state) => state.setActiveTab);

  return (
    <nav className="grid grid-cols-3 gap-2" aria-label="Основные разделы">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            className={[
              "relative min-h-11 overflow-hidden rounded-t-lg px-3 text-sm font-semibold",
              "transition active:scale-[0.99]",
              isActive ? "text-tg-text" : "text-tg-hint",
            ].join(" ")}
            onClick={() => setActiveTab(tab.id)}
            type="button"
          >
            {isActive && (
              <motion.span
                className="absolute inset-0 bg-tg-secondary"
                layoutId="active-bookmark"
                transition={{ type: "spring", stiffness: 430, damping: 36 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
