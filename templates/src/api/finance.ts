import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import type {
  Account,
  Category,
  PaginatedResponse,
  Summary,
  Transaction,
  TransactionCreateDto,
  TransactionFilters,
  TrendPoint,
} from "../types/finance";

const BASE = "/finance";

// ─── Accounts ───────────────────────────────────────────────────────────────

export function useAccounts() {
  return useQuery({
    queryKey: ["finance", "accounts"],
    queryFn: async () => {
      const { data } = await apiClient.get<Account[]>(`${BASE}/accounts/`);
      return data;
    },
    staleTime: 60_000,
  });
}

export function useCreateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Account>) => {
      const { data } = await apiClient.post<Account>(`${BASE}/accounts/`, payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["finance", "accounts"] }),
  });
}

export function useArchiveAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await apiClient.post<Account>(`${BASE}/accounts/${id}/archive/`);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["finance", "accounts"] }),
  });
}

// ─── Categories ──────────────────────────────────────────────────────────────

export function useFinanceCategories() {
  return useQuery({
    queryKey: ["finance", "categories"],
    queryFn: async () => {
      const { data } = await apiClient.get<Category[]>(`${BASE}/categories/`);
      return data;
    },
    staleTime: 5 * 60_000,
  });
}

// ─── Transactions ────────────────────────────────────────────────────────────

export function useTransactions(filters: TransactionFilters = {}) {
  return useQuery({
    queryKey: ["finance", "transactions", filters],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<Transaction>>(
        `${BASE}/transactions/`,
        { params: filters },
      );
      return data;
    },
    placeholderData: (prev) => prev, // keepPreviousData для пагинации
    staleTime: 30_000,
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: TransactionCreateDto) => {
      const { data } = await apiClient.post<Transaction>(`${BASE}/transactions/`, payload);
      return data;
    },
    onSuccess: () => {
      // Инвалидируем транзакции, баланс счетов и сводку
      qc.invalidateQueries({ queryKey: ["finance", "transactions"] });
      qc.invalidateQueries({ queryKey: ["finance", "accounts"] });
      qc.invalidateQueries({ queryKey: ["finance", "summary"] });
    },
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`${BASE}/transactions/${id}/`);
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["finance", "transactions"] });
      qc.invalidateQueries({ queryKey: ["finance", "accounts"] });
      qc.invalidateQueries({ queryKey: ["finance", "summary"] });
    },
  });
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export function useSummary(period: "week" | "month" | "year" = "month", date?: string) {
  return useQuery({
    queryKey: ["finance", "summary", period, date],
    queryFn: async () => {
      const { data } = await apiClient.get<Summary>(`${BASE}/summary/`, {
        params: { period, date },
      });
      return data;
    },
    staleTime: 60_000,
  });
}

export function useTrend(months = 6) {
  return useQuery({
    queryKey: ["finance", "trend", months],
    queryFn: async () => {
      const { data } = await apiClient.get<TrendPoint[]>(`${BASE}/trend/`, {
        params: { months },
      });
      return data;
    },
    staleTime: 5 * 60_000,
  });
}
