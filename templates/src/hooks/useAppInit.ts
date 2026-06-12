import { useQuery } from "@tanstack/react-query";
import { authenticateWithTelegram } from "../api/client";
import { useTelegram } from "./useTelegram";

export function useAppInit() {
  const telegram = useTelegram();

  const bootstrap = useQuery({
    queryKey: ["app", "bootstrap", telegram.initData],
    queryFn: async () => {
      const storedToken = window.localStorage.getItem("access_token");

      if (storedToken) {
        return { authenticated: true };
      }

      if (!telegram.initData) {
        return { authenticated: false };
      }

      const token = await authenticateWithTelegram(telegram.initData);
      return { authenticated: Boolean(token) };
    },
    enabled: telegram.isReady,
    retry: 1,
  });

  const hasTelegramWebApp = Boolean(telegram.webApp);
  const hasInitData = Boolean(telegram.initData);
  const authErrorReason = !hasTelegramWebApp
    ? "not_telegram"
    : !hasInitData
      ? "missing_init_data"
      : bootstrap.isError
        ? "auth_failed"
        : null;

  return {
    isReady: telegram.isReady && bootstrap.isSuccess,
    isAuthenticated: Boolean(bootstrap.data?.authenticated),
    isAuthError: bootstrap.isError,
    authErrorReason,
    telegram,
  };
}
