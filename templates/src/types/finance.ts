export type AccountType = "card" | "cash" | "savings" | "other";
export type CategoryType = "income" | "expense";
export type TransactionType = "income" | "expense" | "transfer";

export interface Account {
  id: number;
  name: string;
  account_type: AccountType;
  currency: string;
  balance: string; // Decimal приходит строкой
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  parent: number | null;
  category_type: CategoryType;
  icon: string | null;
  color: string | null;
  is_archived: boolean;
  is_system: boolean;
  subcategories: Category[];
}

export interface Transaction {
  id: number;
  account: number;
  account_name: string;
  category: number | null;
  category_name: string | null;
  transaction_type: TransactionType;
  amount: string; // Decimal строкой
  transfer_to_account: number | null;
  transfer_to_account_name: string | null;
  note: string;
  date: string; // YYYY-MM-DD
  created_at: string;
}

export interface TransactionCreateDto {
  account: number;
  category?: number | null;
  transaction_type: TransactionType;
  amount: string;
  transfer_to_account?: number | null;
  note?: string;
  date: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface TransactionFilters {
  account?: number;
  category?: number;
  type?: TransactionType;
  date_from?: string;
  date_to?: string;
  page?: number;
}

export interface SummaryByCategoryItem {
  category_id: number;
  name: string;
  icon: string | null;
  color: string | null;
  amount: string;
}

export interface SummaryByAccountItem {
  account_id: number;
  name: string;
  balance: string;
}

export interface Summary {
  total_income: string;
  total_expense: string;
  by_category: SummaryByCategoryItem[];
  by_account: SummaryByAccountItem[];
}

export interface TrendPoint {
  month: string; // YYYY-MM
  income: string;
  expense: string;
}
