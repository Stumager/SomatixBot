import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import { queryClient } from "./queryClient";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

interface AuthResponse {
  access?: string;
  access_token?: string;
  refresh?: string;
}

type ApiRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
  skipAuthHeader?: boolean;
  skipAuthRetry?: boolean;
  skipCacheInvalidation?: boolean;
};

type PublicRequestConfig = AxiosRequestConfig & {
  skipAuthHeader?: boolean;
  skipAuthRetry?: boolean;
  skipCacheInvalidation?: boolean;
};

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api/",
  headers: {
    "Content-Type": "application/json",
  },
});

function getTelegramInitData() {
  return window.Telegram?.WebApp?.initData ?? "";
}

function persistAuthTokens(data: AuthResponse) {
  const accessToken = data.access ?? data.access_token;

  if (accessToken) {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  }

  if (data.refresh) {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh);
  }

  return accessToken ?? null;
}

function clearAuthTokens() {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}

function authRequestConfig(): PublicRequestConfig {
  return {
    skipAuthHeader: true,
    skipAuthRetry: true,
    skipCacheInvalidation: true,
  };
}

export async function authenticateWithTelegram(initData = getTelegramInitData()) {
  if (!initData) {
    return null;
  }

  const { data } = await apiClient.post<AuthResponse>(
    "/auth/telegram/",
    {
      initData,
      InitData: initData,
    },
    authRequestConfig(),
  );

  return persistAuthTokens(data);
}

async function refreshAccessToken() {
  const refreshToken = window.localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) {
    return null;
  }

  const { data } = await apiClient.post<AuthResponse>(
    "/token/refresh/",
    { refresh: refreshToken },
    authRequestConfig(),
  );

  return persistAuthTokens(data);
}

async function restoreAccessToken() {
  try {
    return (await refreshAccessToken()) ?? (await authenticateWithTelegram());
  } catch (error) {
    clearAuthTokens();
    throw error;
  }
}

apiClient.interceptors.request.use((config) => {
  const requestConfig = config as ApiRequestConfig;
  const token = window.localStorage.getItem(ACCESS_TOKEN_KEY);

  if (token && !requestConfig.skipAuthHeader) {
    requestConfig.headers.Authorization = `Bearer ${token}`;
  }

  return requestConfig;
});

apiClient.interceptors.response.use(
  (response) => {
    const method = response.config.method?.toLowerCase();
    const shouldInvalidate =
      (method === "post" || method === "patch") &&
      !(response.config as ApiRequestConfig).skipCacheInvalidation;

    if (shouldInvalidate) {
      queryClient.invalidateQueries();
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as ApiRequestConfig | undefined;

    if (error.response && [400, 401, 403, 500].includes(error.response.status)) {
      console.error("Ошибка API:", error.response.data);
    }

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.skipAuthRetry
    ) {
      originalRequest._retry = true;

      try {
        const newToken = await restoreAccessToken();
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch (authError) {
        console.error("Не удалось обновить авторизацию:", authError);
      }
    }

    return Promise.reject(error);
  },
);
