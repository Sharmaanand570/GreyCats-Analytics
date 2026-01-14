import api from "@/apiConfig";

export type LoginResponse = {
  token: string;
  message: string;
  user: {
    id: number;
    email: string;
    fullName: string;
    role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  };
};


export type LoginRequest = {
  email: string;
  password: string;
}


export const loginUser = async ({ email, password }: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>("/auth/login", {
    email,
    password,
  });

  return response.data;
};
