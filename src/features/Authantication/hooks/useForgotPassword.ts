import { useMutation } from "@tanstack/react-query";
import {
    sendOtp,
    verifyOtp,
    resendOtp,
    resetPassword,
    type SendOtpRequest,
    type VerifyOtpRequest,
    type ResetPasswordRequest,
    type BaseResponse,
} from "../API/ForgotPasswordApi";

export const useSendOtp = () => {
    return useMutation<BaseResponse, Error, SendOtpRequest>({
        mutationFn: sendOtp,
    });
};

export const useVerifyOtp = () => {
    return useMutation<BaseResponse, Error, VerifyOtpRequest>({
        mutationFn: verifyOtp,
    });
};

export const useResendOtp = () => {
    return useMutation<BaseResponse, Error, SendOtpRequest>({
        mutationFn: resendOtp,
    });
};

export const useResetPassword = () => {
    return useMutation<BaseResponse, Error, ResetPasswordRequest>({
        mutationFn: resetPassword,
    });
};
