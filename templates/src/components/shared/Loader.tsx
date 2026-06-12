import { motion } from "framer-motion";

const dots = [0, 1, 2];

export function Loader() {
  return (
    <motion.div
      className="flex min-h-screen items-center justify-center bg-tg-bg"
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex items-end gap-2" aria-label="Загрузка">
        {dots.map((dot) => (
          <motion.span
            key={dot}
            className="block h-3 w-3 rounded-full bg-tg-button"
            animate={{ y: [0, -10, 0], opacity: [0.45, 1, 0.45] }}
            transition={{
              duration: 0.9,
              repeat: Infinity,
              delay: dot * 0.12,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
