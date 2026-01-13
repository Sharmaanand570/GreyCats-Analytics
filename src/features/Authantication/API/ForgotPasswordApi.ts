import api from "@/apiConfig";

export interface SendOtpRequest {
    email: string;
}

export interface VerifyOtpRequest {
    email: string;
    otp: string;
}

export interface ResetPasswordRequest {
    email: string;
    otp: string;
    newPassword: string;
}

export interface BaseResponse {
    success: boolean;
    message: string;
}

export const sendOtp = async (data: SendOtpRequest): Promise<BaseResponse> => {
    const response = await api.post<BaseResponse>("/auth/forgot-password/send-otp", data);
    return response.data;
};

export const verifyOtp = async (data: VerifyOtpRequest): Promise<BaseResponse> => {
    const response = await api.post<BaseResponse>("/auth/forgot-password/verify-otp", data);
    return response.data;
};

export const resendOtp = async (data: SendOtpRequest): Promise<BaseResponse> => {
    const response = await api.post<BaseResponse>("/auth/forgot-password/resend-otp", data);
    return response.data;
};

export const resetPassword = async (data: ResetPasswordRequest): Promise<BaseResponse> => {
    const response = await api.post<BaseResponse>("/auth/forgot-password/reset", data);
    return response.data;
};
