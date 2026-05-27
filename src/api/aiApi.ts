import api from "@/apiConfig";

export interface AIConfigData {
  usingSystemDefault: boolean;
  systemTextProvider: string;
  systemTextModel: string;
  systemImageProvider: string;
  systemImageModel: string;
  textProvider: string | null;
  textModel: string | null;
  textApiKey: string | null;   // masked on GET
  textBaseUrl: string | null;
  textOrgId: string | null;
  imageProvider: string | null;
  imageModel: string | null;
  imageApiKey: string | null;  // masked on GET
  imageBaseUrl: string | null;
  isActive: boolean;
  updatedAt?: string;
}

export interface SaveAIConfigPayload {
  textProvider?: string;
  textModel?: string;
  textApiKey?: string;
  textBaseUrl?: string;
  textOrgId?: string;
  imageProvider?: string;
  imageModel?: string;
  imageApiKey?: string;
  imageBaseUrl?: string;
}

export interface TestAIConfigPayload {
  textProvider: string;
  textModel: string;
  textApiKey?: string;
  textBaseUrl?: string;
  textOrgId?: string;
}

export interface TestAIConfigResult {
  provider: string;
  model: string;
  latencyMs: number;
  message: string;
}

export const aiApi = {
  getConfig: async (): Promise<{ success: boolean; data: AIConfigData }> => {
    const res = await api.get("/ai/config");
    return res.data;
  },

  saveConfig: async (payload: SaveAIConfigPayload): Promise<{ success: boolean; message: string }> => {
    const res = await api.post("/ai/config", payload);
    return res.data;
  },

  deleteConfig: async (): Promise<{ success: boolean; message: string }> => {
    const res = await api.delete("/ai/config");
    return res.data;
  },

  testConfig: async (payload: TestAIConfigPayload): Promise<{ success: boolean; data?: TestAIConfigResult; message: string }> => {
    const res = await api.post("/ai/config/test", payload);
    return res.data;
  },

  getEffectiveConfig: async () => {
    const res = await api.get("/ai/config/effective");
    return res.data;
  },
};
