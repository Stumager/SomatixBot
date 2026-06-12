import { AnimatePresence } from "framer-motion";
import { AppLayout } from "./components/shared/AppLayout";
import { Loader } from "./components/shared/Loader";
import { useAppInit } from "./hooks/useAppInit";

export default function App() {
  const { isReady, isAuthenticated, isAuthError, authErrorReason } = useAppInit();

  const authMessage =
    authErrorReason === "auth_failed"
      ? "Не удалось авторизоваться через Telegram. Проверьте настройки бота на сервере и откройте приложение заново."
      : authErrorReason === "missing_init_data"
        ? "Telegram не передал данные авторизации. Откройте приложение из кнопки бота или меню Mini App."
        : "Откройте приложение через Telegram, чтобы войти в аккаунт.";

  return (
    <AnimatePresence mode="wait">
      {isReady && isAuthenticated ? (
        <AppLayout key="app" />
      ) : isReady || isAuthError ? (
        <div className="flex min-h-screen items-center justify-center bg-tg-bg px-6 text-center text-sm text-tg-text">
          {authMessage}
        </div>
      ) : (
        <Loader key="loader" />
      )}
    </AnimatePresence>
  );
}
