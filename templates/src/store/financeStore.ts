import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CategoryType } from "../types/finance";

type FinanceScreen = "home" | "accounts" | "add";

interface FinanceState {
  activeAccountId: number | null;
  activeScreen: FinanceScreen;
  transactionType: CategoryType;
  setActiveAccount: (id: number | null) => void;
  setActiveScreen: (screen: FinanceScreen) => void;
  setTransactionType: (type: CategoryType) => void;
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set) => ({
      activeAccountId: null,
      activeScreen: "home",
      transactionType: "expense",
      setActiveAccount: (id) => set({ activeAccountId: id }),
      setActiveScreen: (screen) => set({ activeScreen: screen }),
      setTransactionType: (type) => set({ transactionType: type }),
    }),
    {
      name: "finance-store",
      // Персистим только выбранный счёт, не навигацию
      partialize: (state) => ({ activeAccountId: state.activeAccountId }),
    },
  ),
);
