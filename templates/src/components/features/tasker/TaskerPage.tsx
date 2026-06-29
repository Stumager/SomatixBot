import { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Button } from "../../ui/Button";
import { TaskDashboard } from "./TaskDashboard";
import { TaskFilter } from "./TaskFilter";
import { TaskListView } from "./TaskListView";
import { AddTaskModal } from "./AddTaskModal";
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from "../../../api/tasks";
import type { Task, TaskFormData } from "../../../types/task";

export function TaskerPage() {
  const { data: tasks = [] } = useTasks();
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();

  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();

  const handleCreateTask = (data: TaskFormData) => {
    createTaskMutation.mutate(data);
    setIsModalOpen(false);
  };

  const handleUpdateTask = (task: Task) => {
    updateTaskMutation.mutate(task);
    setIsModalOpen(false);
    setEditingTask(undefined);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTaskMutation.mutate(taskId);
  };

  const handleSaveModal = (data: TaskFormData) => {
    if (editingTask) {
      handleUpdateTask({ ...editingTask, ...data });
    } else {
      handleCreateTask(data);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(undefined);
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Dashboard */}
      <TaskDashboard tasks={tasks} />

      {/* Add Task Button */}
      <Button
        className="w-full"
        variant="primary"
        onClick={() => setIsModalOpen(true)}
      >
        <Plus className="mr-2 h-4 w-4" />
        Добавить задачу
      </Button>

      {/* Filter & Search */}
      <TaskFilter
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Task List */}
      <TaskListView
        tasks={tasks}
        filter={activeFilter}
        searchQuery={searchQuery}
        onComplete={handleUpdateTask}
        onEdit={handleEdit}
        onDelete={handleDeleteTask}
      />

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveModal}
        editingTask={editingTask}
      />
    </motion.div>
  );
}
