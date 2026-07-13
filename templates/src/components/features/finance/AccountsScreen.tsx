import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Archive, ChevronLeft, CreditCard, DollarSign, PiggyBank, Plus, Package } from "lucide-react";
import { useAccounts, useArchiveAccount, useCreateAccount } from "../../../api/finance";
import { useFinanceStore } from "../../../store/financeStore";
import { Button } from "../../ui/Button";
import type { AccountType } from "../../../types/finance";

const ACCOUNT_ICONS: Record<AccountType, React.ReactNode> = {
  card: <CreditCard size={20} />,
  cash: <DollarSign size={20} />,
  savings: <PiggyBank size={20} />,
  other: <Package size={20} />,
};

const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  card: "Карта",
  cash: "Наличные",
  savings: "Накопительный",
  other: "Другое",
};

interface AddAccountFormProps {
  onClose: () => void;
}

function AddAccountForm({ onClose }: AddAccountFormProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("card");
  const [currency, setCurrency] = useState("RUB");
  const [error, setError] = useState("");
  const createMutation = useCreateAccount();

  const handleSubmit = async () => {
    if (!name.trim()) { setError("Введите название счёта."); return; }
    try {
      await createMutation.mutateAsync({ name: name.trim(), account_type: type, currency });
      onClose();
    } catch {
      setError("Не удалось создать счёт.");
    }
  };

  return (
    <motion.div
      className="rounded-2xl bg-[var(--tg-theme-secondary-bg-color)] p-4 space-y-3"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
    >
      <h3 className="font-semibold text-tg-text">Новый счёт</h3>

      <input
        type="text"
        value={name}
        onChange={(e) => { setName(e.target.value); setError(""); }}
        placeholder="Например: Тинькофф Дебетовая"
        autoFocus
        className="w-full rounded-xl bg-[var(--tg-theme-bg-color)] px-4 py-2.5 text-sm text-tg-text outline-none placeholder:text-tg-hint"
      />

      <div className="grid grid-cols-2 gap-2">
        {(Object.keys(ACCOUNT_TYPE_LABELS) as AccountType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={[
              "flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition",
              type === t
                ? "bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)]"
                : "bg-[var(--tg-theme-bg-color)] text-tg-text",
            ].join(" ")}
          >
            {ACCOUNT_ICONS[t]}
            {ACCOUNT_TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
        className="w-full rounded-xl bg-[var(--tg-theme-bg-color)] px-4 py-2.5 text-sm text-tg-text outline-none"
      >
        <option value="RUB">RUB — Рубль</option>
        <option value="USD">USD — Доллар</option>
        <option value="EUR">EUR — Евро</option>
      </select>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex gap-2">
        <Button variant="secondary" onClick={onClose} className="flex-1 text-sm">Отмена</Button>
        <Button onClick={handleSubmit} isLoading={createMutation.isPending} className="flex-1 text-sm">Создать</Button>
      </div>
    </motion.div>
  );
}

interface Props {
  onBack: () => void;
}

export function AccountsScreen({ onBack }: Props) {
  const { data: accounts = [] } = useAccounts();
  const archiveMutation = useArchiveAccount();
  const { setActiveAccount } = useFinanceStore();
  const [showForm, setShowForm] = useState(false);
  const [longPressId, setLongPressId] = useState<number | null>(null);

  let pressTimer: ReturnType<typeof setTimeout>;

  const handlePressStart = (id: number) => {
    pressTimer = setTimeout(() => setLongPressId(id), 500);
  };

  const handlePressEnd = () => clearTimeout(pressTimer);

  const handleArchive = (id: number) => {
    const tg = window.Telegram?.WebApp;
    const doArchive = async () => {
      await archiveMutation.mutateAsync(id);
      setLongPressId(null);
    };

    if (tg?.showConfirm) {
      tg.showConfirm("Архивировать счёт? Транзакции сохранятся.", (ok: boolean) => { if (ok) doArchive(); });
    } else if (window.confirm("Архивировать счёт?")) {
      doArchive();
    }
  };

  return (
    <div className="space-y-4">
      {/* Шапка */}
      <div className="flex items-center gap-3">
        <button type="button" onClick={onBack} className="rounded-lg p-1 hover:bg-[var(--tg-theme-secondary-bg-color)]">
          <ChevronLeft size={20} className="text-tg-text" />
        </button>
        <h2 className="text-base font-semibold text-tg-text flex-1">Счета</h2>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="rounded-lg p-1.5 bg-[var(--tg-theme-secondary-bg-color)]"
        >
          <Plus size={18} className="text-tg-text" />
        </button>
      </div>

      {/* Форма добавления */}
      <AnimatePresence>
        {showForm && <AddAccountForm key="add-form" onClose={() => setShowForm(false)} />}
      </AnimatePresence>

      {/* Список счетов */}
      {accounts.length === 0 ? (
        <div className="py-10 text-center text-sm text-tg-hint">Счета не добавлены</div>
      ) : (
        <div className="space-y-2">
          {accounts.map((acc) => (
            <motion.div
              key={acc.id}
              layout
              className={[
                "relative flex items-center gap-3 rounded-2xl p-4 transition",
                longPressId === acc.id
                  ? "bg-red-500/10 ring-1 ring-red-500/30"
                  : "bg-[var(--tg-theme-secondary-bg-color)]",
              ].join(" ")}
              onMouseDown={() => handlePressStart(acc.id)}
              onMouseUp={handlePressEnd}
              onMouseLeave={handlePressEnd}
              onTouchStart={() => handlePressStart(acc.id)}
              onTouchEnd={handlePressEnd}
              onTouchCancel={handlePressEnd}
              onClick={() => setActiveAccount(acc.id)}
            >
              <div className="w-10 h-10 rounded-full bg-[var(--tg-theme-bg-color)] flex items-center justify-center text-tg-hint">
                {ACCOUNT_ICONS[acc.account_type]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-tg-text truncate">{acc.name}</p>
                <p className="text-xs text-tg-hint">{ACCOUNT_TYPE_LABELS[acc.account_type]} · {acc.currency}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-tg-text">{Number(acc.balance).toLocaleString("ru-RU")} ₽</p>
              </div>

              {longPressId === acc.id && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleArchive(acc.id); }}
                  className="absolute right-3 top-3 rounded-full bg-red-500/20 p-1.5 text-red-500"
                >
                  <Archive size={14} />
                </motion.button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
