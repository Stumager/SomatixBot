import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary";
  isLoading?: boolean;
}

const variants = {
  primary: "bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)]",
  secondary: "border border-[var(--tg-theme-hint-color)] text-tg-text",
};

export function Button({
  children,
  className = "",
  variant = "primary",
  isLoading = false,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        "inline-flex min-h-11 items-center justify-center rounded-lg px-4 text-sm font-medium",
        "transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className,
      ].join(" ")}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        children
      )}
    </button>
  );
}
