import { useEffect, useState } from "react";
import type { TelegramWebApp } from "../types/telegram";
import { initTelegramWebApp } from "../utils/telegramBootstrap";

export function useTelegram() {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const app = initTelegramWebApp();
    setWebApp(app);
    setIsReady(true);
  }, []);

  return {
    webApp,
    initData: webApp?.initData ?? "",
    user: webApp?.initDataUnsafe?.user,
    isReady,
  };
}
