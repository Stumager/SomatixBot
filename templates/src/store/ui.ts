import { create } from "zustand";

export type AppTab = "tasker" | "gym";
export type ModalName = "task-editor" | "workout-start" | null;

interface UiState {
  activeTab: AppTab;
  modal: ModalName;
  setActiveTab: (tab: AppTab) => void;
  openModal: (modal: Exclude<ModalName, null>) => void;
  closeModal: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  activeTab: "tasker",
  modal: null,
  setActiveTab: (activeTab) => set({ activeTab }),
  openModal: (modal) => set({ modal }),
  closeModal: () => set({ modal: null }),
}));
