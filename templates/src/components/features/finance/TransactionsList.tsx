import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, Trash2, X } from "lucide-react";
import { useDeleteTransaction, useTransactions, useAccounts, useFinanceCategories } from "../../../api/finance";
import { useFinanceStore } from "../../../store/financeStore";
import { Button } from "../../ui/Button";
import type { Transaction, TransactionFilters } from "../../../types/finance";

// Краткая форма редактирования / просмотра транзакции
function TransactionDetailSheet({ tx, onClose }: { tx: Transaction; onClose: () => void }) {
  const deleteMutation = useDeleteTransaction();

  const handleDelete = () => {
    const tg = window.Telegram?.WebApp;
    const doDelete = async () => {
      await deleteMutation.mutateAsync(tx.id);
      onClose();
    };
    if (tg?.showConfirm) {
      tg.showConfirm("Удалить операцию?", (ok: boolean) => { if (ok) doDelete(); });
    } else if (window.confirm("Удалить операцию?")) {
      doDelete();
    }
  };

  const isIncome = tx.transaction_type === "income";
  const isTransfer = tx.transaction_type === "transfer";

  return (
    <>
      <motion.div className="fixed inset-0 z-40 bg-black/40"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} />
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-[var(--tg-theme-bg-color)] p-4 space-y-4 pb-[calc(env(safe-area-inset-bottom,16px)+16px)]"
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-tg-text">Операция</h3>
          <button type="button" onClick={onClose}
            className="rounded-lg p-1 hover:bg-[var(--tg-theme-secondary-bg-color)]">
            <X size={18} className="text-tg-hint" />
          </button>
        </div>

        <div className="rounded-2xl bg-[var(--tg-theme-secondary-bg-color)] p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-xs text-tg-hint">Сумма</span>
            <span className={["text-sm font-bold",
              isIncome ? "text-emerald-500" : isTransfer ? "text-tg-text" : "text-red-500"
            ].join(" ")}>
              {isIncome ? "+" : isTransfer ? "" : "−"}
              {Number(tx.amount).toLocaleString("ru-RU")} ₽
            </span>
          </div>
          {tx.category_name && (
            <div className="flex justify-between">
              <span className="text-xs text-tg-hint">Категория</span>
              <span className="text-sm text-tg-text">{tx.category_name}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-xs text-tg-hint">Счёт</span>
            <span className="text-sm text-tg-text">{tx.account_name}</span>
          </div>
          {isTransfer && tx.transfer_to_account_name && (
            <div className="flex justify-between">
              <span className="text-xs text-tg-hint">Куда</span>
              <span className="text-sm text-tg-text">{tx.transfer_to_account_name}</span>
            </div>
          )}
          {tx.note && (
            <div className="flex justify-between">
              <span className="text-xs text-tg-hint">Заметка</span>
              <span className="text-sm text-tg-text">{tx.note}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-xs text-tg-hint">Дата</span>
            <span className="text-sm text-tg-text">{tx.date}</span>
          </div>
        </div>

        <Button
          variant="secondary"
          onClick={handleDelete}
          isLoading={deleteMutation.isPending}
          className="w-full text-red-500 border-red-500/30"
        >
          <Trash2 size={16} className="mr-2" />
          Удалить операцию
        </Button>
      </motion.div>
    </>
  );
}

// Фильтр-чип
function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="flex items-center gap-1 rounded-full bg-[var(--tg-theme-button-color)]/20 px-3 py-1 text-xs text-tg-text">
      {label}
      <button type="button" onClick={onRemove} className="ml-0.5">
        <X size={12} />
      </button>
    </span>
  );
}

interface Props {
  onBack: () => void;
  initialFilters?: TransactionFilters;
}

export function TransactionsList({ onBack, initialFilters = {} }: Props) {
  const [filters, setFilters] = useState<TransactionFilters>(initialFilters);
  const [page, setPage] = useState(1);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useFinanceCategories();

  const activeFilters = { ...filters, page };
  const { data, isFetching } = useTransactions(activeFilters);
  const transactions = data?.results ?? [];
  const totalPages = data ? Math.ceil(data.count / 50) : 1;

  const removeFilter = (key: keyof TransactionFilters) => {
    setFilters((f) => { const n = { ...f }; delete n[key]; return n; });
    setPage(1);
  };

  const filterLabels: Partial<Record<keyof TransactionFilters, string>> = {
    account: accounts.find((a) => a.id === filters.account)?.name,
    category: categories.find((c) => c.id === filters.category)?.name,
    type: filters.type === "income" ? "Доходы" : filters.type === "expense" ? "Расходы" : filters.type === "transfer" ? "Переводы" : undefined,
    date_from: filters.date_from ? `с ${filters.date_from}` : undefined,
    date_to: filters.date_to ? `по ${filters.date_to}` : undefined,
  };

  return (
    <div className="space-y-3">
      {/* Шапка */}
      <div className="flex items-center gap-3">
        <button type="button" onClick={onBack}
          className="rounded-lg p-1 hover:bg-[var(--tg-theme-secondary-bg-color)]">
          <ChevronLeft size={20} className="text-tg-text" />
        </button>
        <h2 className="flex-1 text-base font-semibold text-tg-text">Операции</h2>
        {isFetching && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-tg-hint border-t-transparent" />
        )}
      </div>

      {/* Активные фильтры */}
      {Object.entries(filterLabels).some(([, v]) => !!v) && (
        <div className="flex flex-wrap gap-2">
          {(Object.entries(filterLabels) as [keyof TransactionFilters, string | undefined][])
            .filter(([, v]) => !!v)
            .map(([key, label]) => (
              <FilterChip key={key} label={label!} onRemove={() => removeFilter(key)} />
            ))}
        </div>
      )}

      {/* Список */}
      {transactions.length === 0 && !isFetching ? (
        <div className="py-10 text-center text-sm text-tg-hint">Нет операций</div>
      ) : (
        <div className="space-y-1">
          {transactions.map((tx) => (
            <button
              key={tx.id}
              type="button"
              className="w-full flex items-center gap-3 rounded-xl bg-[var(--tg-theme-secondary-bg-color)] px-3 py-2.5 text-left active:opacity-70"
              onClick={() => setSelectedTx(tx)}
            >
              <span className="text-xl w-8 text-center leading-none flex-shrink-0">
                {tx.transaction_type === "transfer" ? "↔️" : "📦"}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-tg-text truncate">
                  {tx.category_name ?? (tx.transaction_type === "transfer" ? `→ ${tx.transfer_to_account_name}` : tx.account_name)}
                </p>
                <p className="text-[10px] text-tg-hint">
                  {tx.account_name} · {tx.date}
                  {tx.note ? ` · ${tx.note}` : ""}
                </p>
              </div>
              <span className={[
                "text-sm font-bold flex-shrink-0",
                tx.transaction_type === "income" ? "text-emerald-500"
                  : tx.transaction_type === "transfer" ? "text-tg-hint"
                  : "text-red-500",
              ].join(" ")}>
                {tx.transaction_type === "income" ? "+" : tx.transaction_type === "transfer" ? "" : "−"}
                {Number(tx.amount).toLocaleString("ru-RU")}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Пагинация */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button variant="secondary" disabled={page === 1} onClick={() => setPage((p) => p - 1)}
            className="text-xs px-3 py-1.5 min-h-0">
            Назад
          </Button>
          <span className="text-xs text-tg-hint">{page} / {totalPages}</span>
          <Button variant="secondary" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}
            className="text-xs px-3 py-1.5 min-h-0">
            Далее
          </Button>
        </div>
      )}

      {/* Детали транзакции */}
      <AnimatePresence>
        {selectedTx && (
          <TransactionDetailSheet tx={selectedTx} onClose={() => setSelectedTx(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
