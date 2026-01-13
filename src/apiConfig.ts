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
    if (error.response?.status === 401) {
      // Skip redirect for shared endpoints or if explicitly disabled
      const isSharedEndpoint = error.config?.url?.includes("/shared/");
      const skipRedirect = (error.config as any)?.skipAuthRedirect;

      const isLoginEndpoint = error.config?.url?.includes("/auth/login");

      if (!isSharedEndpoint && !isLoginEndpoint && !skipRedirect) {
        console.warn("Unauthorized — redirecting to login…");
        removeAuthToken(StorageKey.ANALYTICS_TOKEN);
        window.location.href = "/auth/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
