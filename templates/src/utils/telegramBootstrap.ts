import type { TelegramWebApp } from "../types/telegram";

let cachedWebApp: TelegramWebApp | null | undefined;

function syncTelegramViewport(app: TelegramWebApp) {
  const height = app.viewportStableHeight || app.viewportHeight || window.innerHeight;
  document.documentElement.style.setProperty("--app-height", `${height}px`);
}

export function initTelegramWebApp() {
  if (cachedWebApp !== undefined) {
    return cachedWebApp;
  }

  const app = window.Telegram?.WebApp ?? null;
  cachedWebApp = app;

  if (!app) {
    return null;
  }

  try {
    app.ready();
    app.expand();
    app.requestFullscreen?.();

    app.setHeaderColor?.("secondary_bg_color");
    app.setBackgroundColor?.("bg_color");

    syncTelegramViewport(app);
    app.onEvent?.("viewportChanged", () => syncTelegramViewport(app));
  } catch (error) {
    console.error("Telegram WebApp init failed:", error);
  }

  return app;
}
