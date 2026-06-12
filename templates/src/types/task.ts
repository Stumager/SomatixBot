export type TaskStatus = "active" | "completed" | "overdue";

export interface Task {
  id: string;
  title: string;
  category_id?: string;
  category_name?: string;
  created_at: string;
  due_date: string;
  status: TaskStatus;
}

export interface Category {
  id: string;
  name: string;
  color?: string;
}

export interface TaskFormData {
  title: string;
  category_id: string;
  category_name?: string;
  due_date: string; // ISO string
}

export interface TaskDto {
  id: number;
  name: string;
  created_at: string;
  date: string;
  done: boolean;
  category: number | null;
  category_name?: string | null;
}
