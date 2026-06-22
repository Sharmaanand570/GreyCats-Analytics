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
    if (token && token !== "undefined" && token !== "null") {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (window.location.hash.startsWith("#/shared/")) {
      // Shared report scheduled links: extract token from URL and use as Authorization
      const qs = window.location.hash.split("?")[1];
      if (qs) {
        const shareToken = new URLSearchParams(qs).get("token");
        if (shareToken) {
          config.headers.Authorization = `Bearer ${shareToken}`;
        }
      }
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// ---------------------
// RESPONSE INTERCEPTOR
// ---------------------
api.interceptors.response.use(
  (response) => {
    // ── Global Quota Invalidation ───────────────────────────────────────────
    // If we get a successful response from an endpoint that likely uses AI quota
    // we invalidate the quota cache to force UI updates.
    const url = response.config.url || "";
    const method = response.config.method?.toLowerCase() || "";
    
    if (
      method !== "get" && 
      url.includes("/ai/")
    ) {
      import("@/main").then(({ queryClient }) => {
        queryClient.invalidateQueries({ queryKey: ["aiConfigEffective"] });
      });
    }

    return response;
  },
  (error: AxiosError) => {
    const status = error.response?.status;
    const data = error.response?.data as any;

    // ── 403 upgradeRequired or QUOTA_EXCEEDED ───────────────────────────────
    if (status === 403 && (data?.upgradeRequired === true || data?.code === "QUOTA_EXCEEDED")) {
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
      const hasShareToken = !!(error.config?.params as any)?.token;
      const isLoginEndpoint = error.config?.url?.includes("/auth/login");
      // Never redirect when viewing a shared report page
      const isOnSharedReportPage = window.location.hash.startsWith("#/shared/");

      if (!isSharedEndpoint && !isLoginEndpoint && !skipRedirect && !hasShareToken && !isOnSharedReportPage) {
        console.warn("Unauthorized — redirecting to login…");
        removeAuthToken(StorageKey.ANALYTICS_TOKEN);
        window.location.href = "/#/auth/login?reason=session_expired";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
