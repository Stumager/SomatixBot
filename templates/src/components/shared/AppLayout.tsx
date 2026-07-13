import { motion } from "framer-motion";
import { GymView } from "../features/GymView";
import { TaskerView } from "../features/TaskerView";
import { FinanceView } from "../features/FinanceView";
import { TabNavigation } from "./TabNavigation";
import { useUiStore } from "../../store/ui";

export function AppLayout() {
  const activeTab = useUiStore((state) => state.activeTab);

  return (
    <motion.div
      className="safe-page min-h-screen flex flex-col bg-tg-bg text-tg-text"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24 }}
    >
      <header className="sticky top-0 z-20 bg-tg-bg px-4 pt-2 pb-2 mt-2">
        <TabNavigation />
        <div className="border-b tg-divider" />
      </header>

      <main className="mx-auto w-full max-w-screen-sm px-4 py-4 flex-1">
        {activeTab === "tasker" ? (
          <TaskerView />
        ) : activeTab === "gym" ? (
          <GymView />
        ) : (
          <FinanceView />
        )}
      </main>

      <div className="h-2" />
    </motion.div>
  );
}
