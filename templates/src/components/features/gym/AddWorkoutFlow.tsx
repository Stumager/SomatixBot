import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, Dumbbell, X } from "lucide-react";
import { useCreateWorkout } from "../../../api/gym";
import { useCreateTask } from "../../../api/tasks";
import { Button } from "../../ui/Button";
import { DateTimePicker } from "../../ui/DateTimePicker";

interface AddWorkoutFlowProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddWorkoutFlow({ isOpen, onClose }: AddWorkoutFlowProps) {
  const createTaskMutation = useCreateTask();
  const createWorkoutMutation = useCreateWorkout();
  const [view, setView] = useState<"main" | "plan">("main");
  const [selectedDateTime, setSelectedDateTime] = useState("");
  const [error, setError] = useState("");

  const createWorkoutTask = async (date: string) => {
    const task = await createTaskMutation.mutateAsync({
      title: "Тренировка",
      category_id: "",
      category_name: "Тренировки",
      due_date: date,
    });

    await createWorkoutMutation.mutateAsync(task.id);
  };

  const handleTrainNow = async () => {
    setError("");
    try {
      await createWorkoutTask(new Date().toISOString());
      onClose();
    } catch (trainError) {
      console.error("Ошибка создания тренировки:", trainError);
      setError("Не удалось создать тренировку.");
    }
  };

  const handleSavePlanned = async () => {
    if (!selectedDateTime) return;

    setError("");
    try {
      await createWorkoutTask(selectedDateTime);
      setView("main");
      setSelectedDateTime("");
      onClose();
    } catch (planError) {
      console.error("Ошибка планирования тренировки:", planError);
      setError("Не удалось запланировать тренировку.");
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
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[90vh] rounded-t-2xl bg-[var(--tg-theme-bg-color)] p-4"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-tg-text">
                {view === "main" ? "Новая тренировка" : "План тренировки"}
              </h2>
              <button
                onClick={onClose}
                className="rounded-lg p-1 hover:bg-[var(--tg-theme-secondary-bg-color)]"
                type="button"
              >
                <X size={20} className="text-tg-text" />
              </button>
            </div>

            <div className="max-h-[calc(90vh-100px)] space-y-4 overflow-y-auto">
              {error && <p className="text-sm text-red-500">{error}</p>}

              {view === "main" ? (
                <>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={handleTrainNow}
                      className="w-full gap-3 py-6 text-base font-semibold"
                      variant="primary"
                      isLoading={createTaskMutation.isPending || createWorkoutMutation.isPending}
                    >
                      <Dumbbell size={24} />
                      Тренироваться сейчас
                    </Button>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={() => setView("plan")}
                      className="w-full gap-3 py-6 text-base font-semibold"
                      variant="secondary"
                    >
                      <Calendar size={24} />
                      Запланировать
                    </Button>
                  </motion.div>
                </>
              ) : (
                <>
                  <p className="text-sm text-[var(--tg-theme-hint-color)]">
                    Выберите дату и время тренировки:
                  </p>
                  <DateTimePicker value={selectedDateTime} onChange={setSelectedDateTime} />

                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => setView("main")}
                      className="flex-1"
                    >
                      Назад
                    </Button>
                    <Button
                      onClick={handleSavePlanned}
                      disabled={!selectedDateTime}
                      className="flex-1"
                      isLoading={createTaskMutation.isPending || createWorkoutMutation.isPending}
                    >
                      Сохранить
                    </Button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
