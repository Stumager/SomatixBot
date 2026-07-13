import { AnimatePresence, motion } from "framer-motion";
import { Plus, Wallet } from "lucide-react";
import { useFinanceStore } from "../../store/financeStore";
import { useAccounts } from "../../api/finance";
import { FinanceDashboard } from "./finance/FinanceDashboard";
import { AccountsScreen } from "./finance/AccountsScreen";
import { QuickAddTransaction } from "./finance/QuickAddTransaction";
import { TransactionsList } from "./finance/TransactionsList";

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
};

const SCREEN_DIR: Record<string, number> = {
  home: -1,
  add: 1,
  accounts: 1,
  transactions: 1,
};

export function FinanceView() {
  const { activeScreen, setActiveScreen, transactionFilters } = useFinanceStore();
  const { data: accounts = [] } = useAccounts();

  // CTA: нет счетов — сначала создай
  const noAccounts = accounts.length === 0 && activeScreen === "home";

  const handleBack = () => setActiveScreen("home");

  return (
    <motion.div
      className="space-y-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      {/* Верхняя шапка — всегда видна */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-tg-text">
          <Wallet size={18} />
          <span className="text-base font-semibold">Финансы</span>
        </div>
        {activeScreen === "home" && (
          <button
            type="button"
            onClick={() => setActiveScreen("add")}
            className="flex items-center gap-1.5 rounded-xl bg-[var(--tg-theme-button-color)] px-3 py-1.5 text-xs font-semibold text-[var(--tg-theme-button-text-color)]"
          >
            <Plus size={14} />
            Добавить
          </button>
        )}
      </div>

      {/* CTA: нет счетов */}
      {noAccounts && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-3 py-10 text-center"
        >
          <span className="text-4xl">🏦</span>
          <p className="text-sm text-tg-hint">Сначала добавьте счёт, чтобы начать учёт финансов</p>
          <button
            type="button"
            onClick={() => setActiveScreen("accounts")}
            className="rounded-xl bg-[var(--tg-theme-button-color)] px-4 py-2 text-sm font-semibold text-[var(--tg-theme-button-text-color)]"
          >
            Добавить счёт
          </button>
        </motion.div>
      )}

      {/* Экраны с анимацией */}
      <AnimatePresence mode="wait" custom={SCREEN_DIR[activeScreen] ?? 1}>
        {activeScreen === "home" && !noAccounts && (
          <motion.div
            key="home"
            custom={SCREEN_DIR.home}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
          >
            <FinanceDashboard />
          </motion.div>
        )}

        {activeScreen === "add" && (
          <motion.div
            key="add"
            custom={SCREEN_DIR.add}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
          >
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1 text-sm text-tg-hint"
              >
                ← Назад
              </button>
              <QuickAddTransaction onDone={handleBack} />
            </div>
          </motion.div>
        )}

        {activeScreen === "accounts" && (
          <motion.div
            key="accounts"
            custom={SCREEN_DIR.accounts}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
          >
            <AccountsScreen onBack={handleBack} />
          </motion.div>
        )}

        {activeScreen === "transactions" && (
          <motion.div
            key="transactions"
            custom={SCREEN_DIR.transactions}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
          >
            <TransactionsList onBack={handleBack} initialFilters={transactionFilters} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
