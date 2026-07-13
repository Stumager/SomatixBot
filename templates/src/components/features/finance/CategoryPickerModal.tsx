import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronRight, X } from "lucide-react";
import type { Category, CategoryType } from "../../../types/finance";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  type: CategoryType;
  onSelect: (category: Category) => void;
}

export function CategoryPickerModal({ isOpen, onClose, categories, type, onSelect }: Props) {
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const topLevel = categories.filter((c) => c.parent === null && c.category_type === type);

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[80vh] rounded-t-2xl bg-[var(--tg-theme-bg-color)] flex flex-col"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--tg-theme-hint-color)]/10">
              <h2 className="text-base font-semibold text-tg-text">Выбрать категорию</h2>
              <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-[var(--tg-theme-secondary-bg-color)]">
                <X size={20} className="text-tg-hint" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 px-4 py-2 pb-[calc(env(safe-area-inset-bottom,16px)+8px)]">
              {topLevel.map((cat) => {
                const hasSubs = cat.subcategories.length > 0;
                const isExpanded = expandedIds.has(cat.id);

                return (
                  <div key={cat.id}>
                    <div className="flex items-center gap-3 py-3">
                      <button
                        type="button"
                        className="flex-1 flex items-center gap-3 text-left"
                        onClick={() => (hasSubs ? toggleExpand(cat.id) : onSelect(cat))}
                      >
                        {cat.icon && (
                          <span className="text-xl w-8 text-center">{cat.icon}</span>
                        )}
                        <span className="flex-1 text-sm font-medium text-tg-text">{cat.name}</span>
                        {hasSubs && (
                          isExpanded
                            ? <ChevronDown size={16} className="text-tg-hint" />
                            : <ChevronRight size={16} className="text-tg-hint" />
                        )}
                      </button>
                      {hasSubs && (
                        <button
                          type="button"
                          className="text-xs text-tg-hint underline underline-offset-2"
                          onClick={() => onSelect(cat)}
                        >
                          выбрать
                        </button>
                      )}
                    </div>

                    <AnimatePresence>
                      {isExpanded && hasSubs && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.18 }}
                          className="overflow-hidden"
                        >
                          {cat.subcategories.map((sub) => (
                            <button
                              key={sub.id}
                              type="button"
                              className="w-full flex items-center gap-3 py-2.5 pl-11 text-left hover:bg-[var(--tg-theme-secondary-bg-color)] rounded-lg"
                              onClick={() => onSelect(sub)}
                            >
                              {sub.icon && <span className="text-lg">{sub.icon}</span>}
                              <span className="text-sm text-tg-text">{sub.name}</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="border-b border-[var(--tg-theme-hint-color)]/8" />
                  </div>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
