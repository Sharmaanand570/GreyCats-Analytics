// axiosConfig.ts
import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { getAuthToken, removeAuthToken, StorageKey } from "./utils/storage";

const apiBaseURL = import.meta.env.VITE_API_BASE_URL;
const apiTimeout = Number(import.meta.env.VITE_API_TIMEOUT) || 10000;

export const api: AxiosInstance = axios.create({
  baseURL: apiBaseURL,
  timeout: apiTimeout,
  headers: {
    "Content-Type": "application/json",
  },
});

// ---------------------
// REQUEST INTERCEPTOR
// ---------------------
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken(StorageKey.ANALYTICS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// ---------------------
// RESPONSE INTERCEPTOR
// ---------------------
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const data = error.response?.data as any;

    // ── 403 upgradeRequired ─────────────────────────────────────────────────
    if (status === 403 && data?.upgradeRequired === true) {
      // Lazy import to avoid circular dependency at module load time
      import("@/store/useUpgradeModalStore").then(({ useUpgradeModalStore }) => {
        useUpgradeModalStore.getState().open(
          data.message ?? "Upgrade your plan to continue."
        );
      });
      return Promise.reject(error);
    }

    // ── 401 session expired ─────────────────────────────────────────────────
    if (status === 401) {
      const isSharedEndpoint = error.config?.url?.includes("/shared/");
      const skipRedirect = (error.config as any)?.skipAuthRedirect;
      const isLoginEndpoint = error.config?.url?.includes("/auth/login");

      if (!isSharedEndpoint && !isLoginEndpoint && !skipRedirect) {
        console.warn("Unauthorized — redirecting to login…");
        removeAuthToken(StorageKey.ANALYTICS_TOKEN);
        window.location.href = "/#/auth/login?reason=session_expired";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
