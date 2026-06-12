import type { ReactNode } from "react";
import type { Task } from "../../types/task";

interface CardProps {
  children: ReactNode;
  status?: Task["status"];
  className?: string;
}

const statusGlow = {
  active: "shadow-md",
  completed: "shadow-lg shadow-green-500/20",
  overdue: "shadow-lg shadow-red-500/20",
};

export function Card({ children, status = "active", className = "" }: CardProps) {
  return (
    <div
      className={[
        "rounded-lg bg-[var(--tg-theme-secondary-bg-color)] p-4",
        "border border-[var(--tg-theme-hint-color)]/10",
        "transition-shadow",
        statusGlow[status],
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
