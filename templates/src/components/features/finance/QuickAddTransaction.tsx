import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Plus } from "lucide-react";
import { useAccounts, useCreateTransaction, useFinanceCategories, useTransactions } from "../../../api/finance";
import { useFinanceStore } from "../../../store/financeStore";
import { Button } from "../../ui/Button";
import { CategoryPickerModal } from "./CategoryPickerModal";
import type { Category, CategoryType } from "../../../types/finance";

function today() {
  return new Date().toISOString().slice(0, 10);
}

// Топ-N категорий по частоте использования за последние 30 дней
function useTopCategories(type: CategoryType, allCategories: Category[], n = 6) {
  const dateFrom = new Date();
  dateFrom.setDate(dateFrom.getDate() - 30);
  const { data: recent } = useTransactions({ type, date_from: dateFrom.toISOString().slice(0, 10) });

  const freq: Record<number, number> = {};
  for (const tx of recent?.results ?? []) {
    if (tx.category !== null) freq[tx.category] = (freq[tx.category] ?? 0) + 1;
  }

  const flat = allCategories.filter((c) => c.category_type === type);

  const sorted = [...flat].sort((a, b) => (freq[b.id] ?? 0) - (freq[a.id] ?? 0));
  // топ N, но если недостаточно — дополняем системными в алфавитном порядке
  return sorted.slice(0, n);
}

interface AmountFormProps {
  category: Category;
  onClose: () => void;
  onDone?: () => void;
}

function AmountForm({ category, onClose, onDone }: AmountFormProps) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: accounts = [] } = useAccounts();
  const { activeAccountId, setActiveAccount } = useFinanceStore();
  const createMutation = useCreateTransaction();

  const defaultAccount = activeAccountId ?? accounts[0]?.id ?? null;
  const [accountId, setAccountId] = useState<number | null>(defaultAccount);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 80);
  }, []);

  useEffect(() => {
    if (accounts.length > 0 && accountId === null) {
      setAccountId(accounts[0].id);
    }
  }, [accounts, accountId]);

  const handleSave = async () => {
    const parsed = parseFloat(amount.replace(",", "."));
    if (!amount || isNaN(parsed) || parsed <= 0) {
      setError("Введите корректную сумму.");
      return;
    }
    if (!accountId) {
      setError("Выберите счёт.");
      return;
    }
    try {
      await createMutation.mutateAsync({
        account: accountId,
        category: category.id,
        transaction_type: category.category_type,
        amount: parsed.toFixed(2),
        note: note.trim(),
        date: today(),
      });
      if (accountId !== activeAccountId) setActiveAccount(accountId);
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred("success");
      onDone ? onDone() : onClose();
    } catch {
      setError("Не удалось сохранить. Попробуй ещё раз.");
    }
  };

  return (
    <motion.div
      className="mt-3 rounded-2xl bg-[var(--tg-theme-secondary-bg-color)] p-4 space-y-3"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.18 }}
    >
      <div className="flex items-center gap-2">
        {category.icon && <span className="text-2xl">{category.icon}</span>}
        <span className="font-semibold text-tg-text">{category.name}</span>
      </div>

      {/* Сумма */}
      <div>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => { setAmount(e.target.value); setError(""); }}
            placeholder="0.00"
            className="w-full rounded-xl bg-[var(--tg-theme-bg-color)] px-4 py-3 text-xl font-bold text-tg-text outline-none placeholder:text-tg-hint"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-tg-hint text-sm">
            {accounts.find((a) => a.id === accountId)?.currency ?? "RUB"}
          </span>
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>

      {/* Счёт */}
      <div className="relative">
        <select
          value={accountId ?? ""}
          onChange={(e) => setAccountId(Number(e.target.value))}
          className="w-full appearance-none rounded-xl bg-[var(--tg-theme-bg-color)] px-4 py-2.5 text-sm text-tg-text outline-none pr-8"
        >
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.name} — {acc.balance} {acc.currency}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-tg-hint pointer-events-none" />
      </div>

      {/* Заметка */}
      <AnimatePresence>
        {showNote ? (
          <motion.input
            key="note-input"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Заметка (необязательно)"
            className="w-full rounded-xl bg-[var(--tg-theme-bg-color)] px-4 py-2.5 text-sm text-tg-text outline-none placeholder:text-tg-hint"
          />
        ) : (
          <button
            key="note-btn"
            type="button"
            className="flex items-center gap-1 text-xs text-tg-hint"
            onClick={() => setShowNote(true)}
          >
            <Plus size={12} />
            добавить заметку
          </button>
        )}
      </AnimatePresence>

      {/* Кнопки */}
      <div className="flex gap-2 pt-1">
        <Button variant="secondary" onClick={onClose} className="flex-1 text-sm">
          Отмена
        </Button>
        <Button onClick={handleSave} isLoading={createMutation.isPending} className="flex-1 text-sm">
          Сохранить
        </Button>
      </div>
    </motion.div>
  );
}

interface QuickAddProps {
  onDone?: () => void;
}

export function QuickAddTransaction({ onDone }: QuickAddProps = {}) {
  const { transactionType, setTransactionType } = useFinanceStore();
  const { data: allCategories = [] } = useFinanceCategories();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  const presets = useTopCategories(transactionType, allCategories);

  const handlePreset = (cat: Category) => {
    setSelectedCategory((prev) => (prev?.id === cat.id ? null : cat));
  };

  const handlePickerSelect = (cat: Category) => {
    setShowPicker(false);
    setSelectedCategory(cat);
  };

  // Сброс формы при смене типа
  useEffect(() => {
    setSelectedCategory(null);
  }, [transactionType]);

  return (
    <div className="space-y-4">
      {/* Переключатель тип */}
      <div className="flex rounded-xl bg-[var(--tg-theme-secondary-bg-color)] p-1 gap-1">
        {(["expense", "income"] as CategoryType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTransactionType(t)}
            className={[
              "flex-1 rounded-lg py-2 text-sm font-semibold transition",
              transactionType === t
                ? "bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)]"
                : "text-tg-hint",
            ].join(" ")}
          >
            {t === "expense" ? "Расход" : "Доход"}
          </button>
        ))}
      </div>

      {/* Сетка пресетов */}
      <div className="grid grid-cols-3 gap-2">
        {presets.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => handlePreset(cat)}
            className={[
              "flex flex-col items-center gap-1.5 rounded-2xl p-3 text-center transition active:scale-95",
              selectedCategory?.id === cat.id
                ? "bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)]"
                : "bg-[var(--tg-theme-secondary-bg-color)] text-tg-text",
            ].join(" ")}
          >
            <span className="text-2xl leading-none">{cat.icon ?? "📦"}</span>
            <span className="text-xs font-medium leading-tight line-clamp-2">{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Форма ввода суммы */}
      <AnimatePresence mode="wait">
        {selectedCategory && (
          <AmountForm
            key={selectedCategory.id}
            category={selectedCategory}
            onClose={() => setSelectedCategory(null)}
            onDone={onDone}
          />
        )}
      </AnimatePresence>

      {/* Другая категория */}
      {!selectedCategory && (
        <button
          type="button"
          onClick={() => setShowPicker(true)}
          className="w-full rounded-2xl border border-dashed border-[var(--tg-theme-hint-color)]/30 py-3 text-sm text-tg-hint flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          Другая категория
        </button>
      )}

      <CategoryPickerModal
        isOpen={showPicker}
        onClose={() => setShowPicker(false)}
        categories={allCategories}
        type={transactionType}
        onSelect={handlePickerSelect}
      />
    </div>
  );
}
