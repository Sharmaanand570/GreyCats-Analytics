import api from "@/apiConfig";

// --- Types ---

export type SendOtpRequest = {
  email: string;
  password: string;
  fullName: string;
  inviteToken?: string;
};

export type SendOtpResponse = {
  success: boolean;
  message: string;
  email: string;
};

export type VerifyOtpRequest = {
  email: string;
  otp: string;
  inviteToken?: string;
};

export type VerifyOtpResponse = {
  success: boolean;
  message: string;
  token: string;
  user: {
    id: number;
    email: string;
    fullName: string;
    emailVerified: boolean;
  };
};

export type ResendOtpRequest = {
  email: string;
};

export type ResendOtpResponse = {
  success: boolean;
  message: string;
};

// --- API Functions ---

export const sendOtp = async (
  payload: SendOtpRequest
): Promise<SendOtpResponse> => {
  const response = await api.post<SendOtpResponse>(
    "/auth/register/send-otp",
    payload
  );
  return response.data;
};

export const verifyOtp = async (
  payload: VerifyOtpRequest
): Promise<VerifyOtpResponse> => {
  const response = await api.post<VerifyOtpResponse>(
    "/auth/register/verify-otp",
    payload
  );
  return response.data;
};

export const resendOtp = async (
  payload: ResendOtpRequest
): Promise<ResendOtpResponse> => {
  const response = await api.post<ResendOtpResponse>(
    "/auth/register/resend-otp",
    payload
  );
  return response.data;
};
