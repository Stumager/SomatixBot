import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        tg: {
          bg: "var(--tg-theme-bg-color)",
          text: "var(--tg-theme-text-color)",
          hint: "var(--tg-theme-hint-color)",
          link: "var(--tg-theme-link-color)",
          button: "var(--tg-theme-button-color)",
          buttonText: "var(--tg-theme-button-text-color)",
          secondary: "var(--tg-theme-secondary-bg-color)",
        },
      },
      boxShadow: {
        tg: "0 10px 28px color-mix(in srgb, var(--tg-theme-hint-color) 14%, transparent)",
      },
    },
  },
  plugins: [],
} satisfies Config;
