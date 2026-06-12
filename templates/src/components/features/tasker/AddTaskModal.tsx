import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Trash2, X } from "lucide-react";
import { useCategories, useCreateCategory, useDeleteCategory } from "../../../api/tasks";
import type { Task, TaskFormData } from "../../../types/task";
import { Button } from "../../ui/Button";
import { DateTimePicker } from "../../ui/DateTimePicker";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: TaskFormData) => void;
  editingTask?: Task;
}

export function AddTaskModal({ isOpen, onClose, onSave, editingTask }: AddTaskModalProps) {
  const { data: categories = [] } = useCategories();
  const createCategoryMutation = useCreateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  const [title, setTitle] = useState(editingTask?.title || "");
  const [categoryId, setCategoryId] = useState(editingTask?.category_id || "");
  const [dueDate, setDueDate] = useState(editingTask?.due_date || "");
  const [error, setError] = useState("");

  useEffect(() => {
    setTitle(editingTask?.title || "");
    setCategoryId(editingTask?.category_id || "");
    setDueDate(editingTask?.due_date || "");
    setError("");
  }, [editingTask]);

  const handleSave = () => {
    if (!title.trim()) {
      setError("Название задачи не может быть пустым.");
      return;
    }

    if (!dueDate) {
      setError("Выберите дату и время.");
      return;
    }

    onSave({
      title: title.trim(),
      category_id: categoryId,
      due_date: dueDate,
    });
    setTitle("");
    setCategoryId("");
    setDueDate("");
    setError("");
  };

  const handleAddCategory = async () => {
    const name = prompt("Название новой категории:");
    if (!name?.trim()) return;

    try {
      const category = await createCategoryMutation.mutateAsync(name.trim());
      setCategoryId(category.id);
    } catch {
      setError("Не удалось создать категорию.");
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryId) return;
    if (!confirm("Удалить выбранную категорию?")) return;

    try {
      await deleteCategoryMutation.mutateAsync(categoryId);
      setCategoryId("");
    } catch {
      setError("Не удалось удалить категорию.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[90vh] rounded-t-2xl bg-[var(--tg-theme-bg-color)] p-4 pb-[calc(env(safe-area-inset-bottom,16px)+24px)]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-tg-text">
                {editingTask ? "Редактировать задачу" : "Добавить задачу"}
              </h2>
              <button
                onClick={onClose}
                className="rounded-lg p-1 hover:bg-[var(--tg-theme-secondary-bg-color)]"
                type="button"
              >
                <X size={20} className="text-tg-text" />
              </button>
            </div>

            <div className="max-h-[calc(90vh-120px)] space-y-4 overflow-y-auto">
              <div>
                <label className="text-xs font-semibold text-[var(--tg-theme-hint-color)]">
                  Название задачи
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(event) => {
                    setTitle(event.target.value);
                    setError("");
                  }}
                  placeholder="Что нужно сделать?"
                  className="mt-2 w-full rounded-lg bg-[var(--tg-theme-secondary-bg-color)] px-3 py-2 text-sm text-tg-text outline-none placeholder:text-[var(--tg-theme-hint-color)]"
                />
                {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--tg-theme-hint-color)]">
                  Категория
                </label>
                <div className="mt-2 flex gap-2">
                  <select
                    value={categoryId}
                    onChange={(event) => setCategoryId(event.target.value)}
                    className="min-w-0 flex-1 rounded-lg bg-[var(--tg-theme-secondary-bg-color)] px-3 py-2 text-sm text-tg-text outline-none"
                  >
                    <option value="">Без категории</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAddCategory}
                    className="rounded-lg bg-[var(--tg-theme-secondary-bg-color)] px-3 py-2 text-tg-text hover:bg-[var(--tg-theme-hint-color)]/20"
                    type="button"
                  >
                    <Plus size={18} />
                  </button>
                  {categoryId && (
                    <button
                      onClick={handleDeleteCategory}
                      className="rounded-lg bg-[var(--tg-theme-secondary-bg-color)] px-3 py-2 text-red-500 hover:bg-red-500/10"
                      type="button"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--tg-theme-hint-color)]">
                  Дата и время
                </label>
                <div className="mt-2">
                  <DateTimePicker value={dueDate} onChange={setDueDate} />
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-2 border-t border-[var(--tg-theme-hint-color)]/10 pt-4">
              <Button variant="secondary" onClick={onClose} className="flex-1">
                Отмена
              </Button>
              <Button onClick={handleSave} className="flex-1">
                Сохранить
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
