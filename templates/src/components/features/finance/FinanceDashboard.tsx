import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from "recharts";
import { ChevronLeft, ChevronRight, CreditCard, DollarSign, Package, PiggyBank } from "lucide-react";
import { useAccounts, useFinanceCategories, useSummary, useTrend, useTransactions } from "../../../api/finance";
import { useFinanceStore } from "../../../store/financeStore";
import type { AccountType } from "../../../types/finance";

type Period = "week" | "month" | "year";

const ACCOUNT_ICONS: Record<AccountType, React.ReactNode> = {
  card: <CreditCard size={16} />,
  cash: <DollarSign size={16} />,
  savings: <PiggyBank size={16} />,
  other: <Package size={16} />,
};

const FALLBACK_COLORS = [
  "#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#ec4899",
  "#14b8a6", "#f97316", "#06b6d4", "#84cc16",
];

// ─── Period helpers ───────────────────────────────────────────────────────────

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function currentDate(period: Period): string {
  const now = new Date();
  if (period === "month") return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  if (period === "year") return String(now.getFullYear());
  return todayISO();
}

function shiftDate(date: string, period: Period, dir: 1 | -1): string {
  if (period === "month") {
    const [y, m] = date.split("-").map(Number);
    const d = new Date(y, m - 1 + dir, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }
  if (period === "year") {
    return String(Number(date) + dir);
  }
  // week: shift by 7 days
  const d = new Date(date);
  d.setDate(d.getDate() + dir * 7);
  return d.toISOString().slice(0, 10);
}

function formatPeriodLabel(date: string, period: Period): string {
  if (period === "month") {
    const [y, m] = date.split("-").map(Number);
    return new Date(y, m - 1).toLocaleString("ru-RU", { month: "long", year: "numeric" });
  }
  if (period === "year") return date + " год";
  // week
  const d = new Date(date);
  const start = new Date(d);
  start.setDate(d.getDate() - d.getDay() + 1);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const fmt = (x: Date) => x.toLocaleString("ru-RU", { day: "numeric", month: "short" });
  return `${fmt(start)} – ${fmt(end)}`;
}

// ─── Main component ───────────────────────────────────────────────────────────

export function FinanceDashboard() {
  const [period, setPeriod] = useState<Period>("month");
  const [date, setDate] = useState(() => currentDate("month"));
  const { openTransactions } = useFinanceStore();

  const { data: summary } = useSummary(period, date);
  const { data: trend = [] } = useTrend(6);
  const { data: accounts = [] } = useAccounts();
  const { data: recentPage } = useTransactions({ page: 1 });
  const recent = recentPage?.results?.slice(0, 8) ?? [];

  const byCategory = summary?.by_category ?? [];
  const totalExpense = Number(summary?.total_expense ?? 0);
  const totalIncome = Number(summary?.total_income ?? 0);
  const isEmpty = byCategory.length === 0 && totalIncome === 0;

  // Donut data
  const donutData = byCategory.length > 0
    ? byCategory.map((c, i) => ({
        name: c.name,
        value: Number(c.amount),
        fill: c.color ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length],
        categoryId: c.category_id,
        icon: c.icon,
      }))
    : [{ name: "Нет данных", value: 1, fill: "var(--tg-theme-hint-color)", categoryId: 0, icon: null }];

  // Trend data
  const trendData = trend.map((t) => ({
    month: t.month.slice(5),
    income: Number(t.income),
    expense: Number(t.expense),
  }));

  const handlePeriodChange = (p: Period) => {
    setPeriod(p);
    setDate(currentDate(p));
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Период: тип */}
      <div className="flex rounded-xl bg-[var(--tg-theme-secondary-bg-color)] p-1 gap-1">
        {(["week", "month", "year"] as Period[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => handlePeriodChange(p)}
            className={[
              "flex-1 rounded-lg py-1.5 text-xs font-semibold transition",
              period === p
                ? "bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)]"
                : "text-tg-hint",
            ].join(" ")}
          >
            {p === "week" ? "Неделя" : p === "month" ? "Месяц" : "Год"}
          </button>
        ))}
      </div>

      {/* Навигация по периоду */}
      <div className="flex items-center justify-between px-1">
        <button type="button" onClick={() => setDate((d) => shiftDate(d, period, -1))}
          className="rounded-lg p-1.5 hover:bg-[var(--tg-theme-secondary-bg-color)]">
          <ChevronLeft size={18} className="text-tg-hint" />
        </button>
        <span className="text-sm font-medium text-tg-text capitalize">
          {formatPeriodLabel(date, period)}
        </span>
        <button type="button" onClick={() => setDate((d) => shiftDate(d, period, 1))}
          className="rounded-lg p-1.5 hover:bg-[var(--tg-theme-secondary-bg-color)]">
          <ChevronRight size={18} className="text-tg-hint" />
        </button>
      </div>

      {/* Пустое состояние */}
      {isEmpty ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <span className="text-4xl">💸</span>
          <p className="text-sm text-tg-hint">Пока нет операций за этот период</p>
        </div>
      ) : (
        <>
          {/* Donut: расходы по категориям */}
          {byCategory.length > 0 && (
            <div className="rounded-2xl bg-[var(--tg-theme-secondary-bg-color)] p-4 space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0">
                  <ResponsiveContainer width={110} height={110}>
                    <PieChart>
                      <Pie
                        data={donutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={32}
                        outerRadius={52}
                        dataKey="value"
                        strokeWidth={0}
                        onClick={(entry) => {
                          if (entry.categoryId) {
                            openTransactions({ category: entry.categoryId, ...periodToFilter(period, date) });
                          }
                        }}
                      >
                        {donutData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} className="cursor-pointer" />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] text-tg-hint leading-none">расход</span>
                    <span className="text-sm font-bold text-tg-text leading-snug">
                      {totalExpense.toLocaleString("ru-RU")}
                    </span>
                  </div>
                </div>

                {/* Легенда */}
                <div className="flex-1 space-y-1.5 overflow-hidden">
                  {byCategory.map((c, i) => {
                    const pct = totalExpense > 0 ? Math.round((Number(c.amount) / totalExpense) * 100) : 0;
                    return (
                      <button
                        key={c.category_id}
                        type="button"
                        className="w-full flex items-center gap-2 text-left active:opacity-70"
                        onClick={() => openTransactions({ category: c.category_id, ...periodToFilter(period, date) })}
                      >
                        <span className="h-2 w-2 flex-shrink-0 rounded-full"
                          style={{ background: c.color ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length] }} />
                        <span className="flex-1 truncate text-xs text-tg-text">
                          {c.icon} {c.name}
                        </span>
                        <span className="text-xs text-tg-hint">{pct}%</span>
                        <span className="text-xs font-medium text-tg-text w-16 text-right">
                          {Number(c.amount).toLocaleString("ru-RU")}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Итого доход */}
              {totalIncome > 0 && (
                <div className="flex justify-between border-t border-[var(--tg-theme-hint-color)]/10 pt-3">
                  <span className="text-xs text-tg-hint">Доход за период</span>
                  <span className="text-xs font-bold text-emerald-500">
                    +{totalIncome.toLocaleString("ru-RU")} ₽
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Trend: доходы/расходы по месяцам */}
          {trendData.some((t) => t.income > 0 || t.expense > 0) && (
            <div className="rounded-2xl bg-[var(--tg-theme-secondary-bg-color)] p-4">
              <p className="text-xs font-semibold text-tg-hint mb-3">Тренд за 6 месяцев</p>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={trendData} barCategoryGap="30%" barGap={2}>
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--tg-theme-hint-color)" }}
                    axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--tg-theme-secondary-bg-color)",
                      border: "none",
                      borderRadius: 8,
                      fontSize: 11,
                    }}
                    formatter={(val: number, name: string) => [
                      val.toLocaleString("ru-RU") + " ₽",
                      name === "income" ? "Доход" : "Расход",
                    ]}
                  />
                  <Bar dataKey="income" fill="#10b981" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="expense" fill="#ef4444" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}

      {/* Счета — горизонтальный скролл */}
      {accounts.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-tg-hint mb-2 px-1">Счета</p>
          <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
            {accounts.map((acc) => (
              <button
                key={acc.id}
                type="button"
                className="flex-shrink-0 w-36 rounded-2xl bg-[var(--tg-theme-secondary-bg-color)] p-3 text-left active:scale-95 transition"
                onClick={() => openTransactions({ account: acc.id })}
              >
                <div className="flex items-center gap-1.5 text-tg-hint mb-2">
                  {ACCOUNT_ICONS[acc.account_type]}
                  <span className="text-xs truncate">{acc.name}</span>
                </div>
                <p className="text-base font-bold text-tg-text leading-none">
                  {Number(acc.balance).toLocaleString("ru-RU")}
                </p>
                <p className="text-[10px] text-tg-hint mt-0.5">{acc.currency}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Последние транзакции */}
      {recent.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <p className="text-xs font-semibold text-tg-hint">Последние операции</p>
            <button type="button" className="text-xs text-[var(--tg-theme-link-color,var(--tg-theme-button-color))]"
              onClick={() => openTransactions({})}>
              Все
            </button>
          </div>
          <div className="space-y-1">
            {recent.map((tx) => (
              <div key={tx.id}
                className="flex items-center gap-3 rounded-xl bg-[var(--tg-theme-secondary-bg-color)] px-3 py-2.5">
                <span className="text-xl w-8 text-center leading-none flex-shrink-0">
                  {tx.transaction_type === "transfer" ? "↔️" : (tx.category_name ? "📦" : "💳")}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-tg-text truncate">
                    {tx.category_name ?? tx.account_name}
                  </p>
                  <p className="text-[10px] text-tg-hint">{tx.date}</p>
                </div>
                <span className={[
                  "text-sm font-bold flex-shrink-0",
                  tx.transaction_type === "income" ? "text-emerald-500" : "text-red-500",
                ].join(" ")}>
                  {tx.transaction_type === "income" ? "+" : "−"}
                  {Number(tx.amount).toLocaleString("ru-RU")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Преобразует period+date в date_from/date_to для фильтра транзакций
function periodToFilter(period: Period, date: string) {
  if (period === "month") {
    const [y, m] = date.split("-").map(Number);
    const start = `${y}-${String(m).padStart(2, "0")}-01`;
    const end = new Date(y, m, 0).toISOString().slice(0, 10);
    return { date_from: start, date_to: end };
  }
  if (period === "year") {
    return { date_from: `${date}-01-01`, date_to: `${date}-12-31` };
  }
  // week
  const d = new Date(date);
  const start = new Date(d);
  start.setDate(d.getDate() - d.getDay() + 1);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return {
    date_from: start.toISOString().slice(0, 10),
    date_to: end.toISOString().slice(0, 10),
  };
}
