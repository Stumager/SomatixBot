import { useEffect, useState } from "react";
import { Button } from "./Button";

interface DateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function DateTimePicker({ value, onChange }: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("12:00");

  useEffect(() => {
    if (!value) return;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return;

    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, "0");
    const d = String(parsed.getDate()).padStart(2, "0");
    setSelectedDate(`${y}-${m}-${d}`);

    const hh = String(parsed.getHours()).padStart(2, "0");
    const mm = String(parsed.getMinutes()).padStart(2, "0");
    setSelectedTime(`${hh}:${mm}`);
  }, [value]);

  const emitChange = (date: string, time: string) => {
    if (date) {
      const local = new Date(`${date}T${time}:00`);
      onChange(local.toISOString());
    }
  };

  const handleDateChange = (dateValue: string) => {
    setSelectedDate(dateValue);
    emitChange(dateValue, selectedTime);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedTime(e.target.value);
    emitChange(selectedDate, e.target.value);
  };

  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const nextMonday = new Date(
    Date.now() + ((7 - (new Date().getDay() || 7)) % 7 + 1) * 86400000,
  )
    .toISOString()
    .split("T")[0];

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="block text-xs font-semibold text-[var(--tg-theme-hint-color)]">
          Дата
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="mt-1 w-full rounded-lg bg-[var(--tg-theme-secondary-bg-color)] px-3 py-2 text-sm outline-none"
          />
        </label>
        <label className="block text-xs font-semibold text-[var(--tg-theme-hint-color)]">
          Время
          <input
            type="time"
            value={selectedTime}
            onChange={handleTimeChange}
            className="mt-1 w-full rounded-lg bg-[var(--tg-theme-secondary-bg-color)] px-3 py-2 text-sm outline-none"
          />
        </label>
      </div>

      <div className="flex gap-2">
        <Button
          variant={selectedDate === today ? "primary" : "secondary"}
          onClick={() => handleDateChange(today)}
          className="flex-1 text-xs"
        >
          Сегодня
        </Button>
        <Button
          variant={selectedDate === tomorrow ? "primary" : "secondary"}
          onClick={() => handleDateChange(tomorrow)}
          className="flex-1 text-xs"
        >
          Завтра
        </Button>
        <Button
          variant={selectedDate === nextMonday ? "primary" : "secondary"}
          onClick={() => handleDateChange(nextMonday)}
          className="flex-1 text-xs"
        >
          След. пн
        </Button>
      </div>
    </div>
  );
}
