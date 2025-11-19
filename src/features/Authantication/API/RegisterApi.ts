import api from "@/apiConfig";

export type RegisterRequest = {
  email: string;
  password: string;
  fullName: string;
};

export type RegisterResponse = {
  success: boolean;
  message: string;
  token: string;
  user: {
    id: number;
    email: string;
    fullName: string;
  };
};

export const registerUser = async (
  payload: RegisterRequest
): Promise<RegisterResponse> => {
  const response = await api.post<RegisterResponse>("/auth/register", payload);
  return response.data;
};



