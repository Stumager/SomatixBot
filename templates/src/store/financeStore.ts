import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CategoryType, TransactionFilters } from "../types/finance";

export type FinanceScreen = "home" | "accounts" | "add" | "transactions";

interface FinanceState {
  activeAccountId: number | null;
  activeScreen: FinanceScreen;
  transactionType: CategoryType;
  transactionFilters: TransactionFilters;
  setActiveAccount: (id: number | null) => void;
  setActiveScreen: (screen: FinanceScreen) => void;
  setTransactionType: (type: CategoryType) => void;
  openTransactions: (filters?: TransactionFilters) => void;
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set) => ({
      activeAccountId: null,
      activeScreen: "home",
      transactionType: "expense",
      transactionFilters: {},
      setActiveAccount: (id) => set({ activeAccountId: id }),
      setActiveScreen: (screen) => set({ activeScreen: screen }),
      setTransactionType: (type) => set({ transactionType: type }),
      openTransactions: (filters = {}) =>
        set({ activeScreen: "transactions", transactionFilters: filters }),
    }),
    {
      name: "finance-store",
      partialize: (state) => ({ activeAccountId: state.activeAccountId }),
    },
  ),
);
