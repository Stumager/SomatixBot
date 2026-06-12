import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import type { Category, Task, TaskDto, TaskFormData } from "../types/task";
import { calculateTaskProgress } from "../utils/progress";

function mapTaskDto(dto: TaskDto): Task {
  const dueDate = dto.date;
  const now = Date.now();
  const dueTime = new Date(dueDate).getTime();

  // Серверный API должен возвращать created_at для точного расчёта прогресса.
 const createdAt = dto.created_at ?? dto.date;
  return {
    id: String(dto.id),
    title: dto.name,
    created_at: createdAt,
    due_date: dueDate,
    category_id: dto.category ? String(dto.category) : "",
    category_name: dto.category_name || "Без категории",
    status: dto.done ? "completed" : dueTime <= now ? "overdue" : "active",
  };
}

export function useTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data } = await apiClient.get<TaskDto[]>("/tasks/");
      return Array.isArray(data) ? data.map(mapTaskDto) : [];
    },
    refetchInterval: 10000,
    staleTime: 10000,
  });
}

export function getTaskProgress(task: Task): number {
  return calculateTaskProgress(task.created_at, task.due_date);
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TaskFormData) => {
      const { data: created } = await apiClient.post<TaskDto>("/tasks/", {
        name: data.title,
        date: data.due_date,
        category: data.category_id || null,
        category_name: data.category_name,
      });
      return mapTaskDto(created);
    },
    onSuccess: (newTask) => {
      queryClient.setQueryData(["tasks"], (old?: Task[]) => [...(old || []), newTask]);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (task: Task) => {
      const { data: updated } = await apiClient.patch<TaskDto>(`/tasks/${task.id}/`, {
        name: task.title,
        date: task.due_date,
        done: task.status === "completed",
        category: task.category_id || null,
      });
      return mapTaskDto(updated);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["tasks"], (old?: Task[]) =>
        old?.map((task) => (task.id === updated.id ? updated : task)) || [],
      );
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      await apiClient.delete(`/tasks/${taskId}/`);
      return taskId;
    },
    onSuccess: (taskId) => {
      queryClient.setQueryData(["tasks"], (old?: Task[]) =>
        old?.filter((task) => task.id !== taskId) || [],
      );
    },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await apiClient.get<Category[]>("/categories/");
      return Array.isArray(data)
        ? data.map((item) => ({ id: String(item.id), name: item.name }))
        : [];
    },
    staleTime: 30000,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      const { data } = await apiClient.post<Category>("/categories/", { name });
      return { id: String(data.id), name: data.name };
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryId: string) => {
      await apiClient.delete(`/categories/${categoryId}/`);
      return categoryId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}
