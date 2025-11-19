import api from "@/apiConfig";

export type LoginResponse = {
  token: string;
  message: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
};


export type LoginRequest = {
  email: string;
  password: string;
}


export const loginUser = async ( {email, password }:LoginRequest): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>("/auth/login", {
    email,
    password,
  });

  return response.data;
};
