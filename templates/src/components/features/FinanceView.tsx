import { AnimatePresence, motion } from "framer-motion";
import { Wallet } from "lucide-react";
import { useFinanceStore } from "../../store/financeStore";
import { AccountsScreen } from "./finance/AccountsScreen";
import { QuickAddTransaction } from "./finance/QuickAddTransaction";
import { useAccounts } from "../../api/finance";

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
};

export function FinanceView() {
  const { activeScreen, setActiveScreen } = useFinanceStore();
  const { data: accounts = [] } = useAccounts();

  const totalBalance = accounts.reduce((sum, a) => sum + Number(a.balance), 0);

  return (
    <motion.div
      className="space-y-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      {/* Шапка с балансом и переходом к счетам */}
      {activeScreen !== "accounts" && (
        <div
          className="flex items-center justify-between rounded-2xl bg-[var(--tg-theme-secondary-bg-color)] px-4 py-3 cursor-pointer active:scale-[0.99] transition"
          onClick={() => setActiveScreen("accounts")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && setActiveScreen("accounts")}
        >
          <div className="flex items-center gap-2 text-tg-hint">
            <Wallet size={16} />
            <span className="text-xs">Все счета</span>
          </div>
          <span className="text-lg font-bold text-tg-text">
            {totalBalance.toLocaleString("ru-RU")} ₽
          </span>
        </div>
      )}

      {/* Контент с анимацией перехода */}
      <AnimatePresence mode="wait" custom={activeScreen === "accounts" ? 1 : -1}>
        {activeScreen === "accounts" ? (
          <motion.div
            key="accounts"
            custom={1}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
          >
            <AccountsScreen onBack={() => setActiveScreen("home")} />
          </motion.div>
        ) : (
          <motion.div
            key="home"
            custom={-1}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
          >
            <QuickAddTransaction />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
