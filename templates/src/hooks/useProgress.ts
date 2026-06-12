import { useEffect, useState } from "react";
import { calculateTaskProgress } from "../utils/progress";

export function useProgress(createdAt: string, dueDate: string) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  return calculateTaskProgress(createdAt, dueDate, now);
}
