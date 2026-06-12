import { create } from "zustand";
import type { Category } from "../types/task";

interface CategoryState {
  categories: Category[];
  addCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
}

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: [
    { id: "1", name: "Health" },
    { id: "2", name: "Work" },
    { id: "3", name: "Gym" },
  ],
  addCategory: (category) =>
    set((state) => ({
      categories: [...state.categories, category],
    })),
  deleteCategory: (id) =>
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id),
    })),
}));
