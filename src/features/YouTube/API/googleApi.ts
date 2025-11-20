import api from "@/apiConfig";

export type connectGoogleTypeResponse = {
  success: boolean;
  url: string;
};

export type GoogleCallbackResponse = {
  success: boolean;
  message: string;
};

export type GoogleCallbackParams = {
  code: string;
  state: string;
};

export const connectGoogle = async (): Promise<connectGoogleTypeResponse> => {
  const response = await api.get<connectGoogleTypeResponse>("/google/connect", {
    baseURL: import.meta.env.VITE_NGROK_URL,
    headers: { "ngrok-skip-browser-warning": "true" },
  });
  return response.data;
};

export const handleGoogleCallback = async (
  params: GoogleCallbackParams
): Promise<GoogleCallbackResponse> => {
  const response = await api.get<GoogleCallbackResponse>("/google/callback", {
    params: {
      code: params.code,
      state: params.state,
    },
  });

  return response.data;
};
