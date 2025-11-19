import api from "@/apiConfig";

export type ConnectGoogleConsoleResponse = {
  success: boolean;
  url: string;
};

export type GoogleConsoleCallbackResponse = {
  success: boolean;
  message: string;
};

export const connectGoogleConsole = async (): Promise<ConnectGoogleConsoleResponse> => {
  const response = await api.get<ConnectGoogleConsoleResponse>(
    "/google-console/connect",
    {
      baseURL: import.meta.env.VITE_NGROK_URL,
      headers: { "ngrok-skip-browser-warning": "true" },
    }
  );
  return response.data;
};

export const handleGoogleConsoleCallback = async (
  status: string,
  reason?: string
): Promise<GoogleConsoleCallbackResponse> => {
  // Since the backend redirects with query params, we just need to process the status
  // This function is mainly for consistency with other callback handlers
  if (status === "error") {
    throw new Error(reason || "Google Console connection failed");
  }
  
  return {
    success: true,
    message: "Successfully connected to Google Console!",
  };
};


