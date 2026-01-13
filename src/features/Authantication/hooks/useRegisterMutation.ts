import { useMutation } from "@tanstack/react-query";
import {
  sendOtp,
  verifyOtp,
  resendOtp,
  type SendOtpRequest,
  type SendOtpResponse,
  type VerifyOtpRequest,
  type VerifyOtpResponse,
  type ResendOtpRequest,
  type ResendOtpResponse,
} from "../API/RegisterApi";
import { setAuthToken, StorageKey } from "@/utils/storage";

export const useSendOtpMutation = () => {
  return useMutation<SendOtpResponse, Error, SendOtpRequest>({
    mutationFn: sendOtp,
  });
};

export const useVerifyOtpMutation = () => {
  return useMutation<VerifyOtpResponse, Error, VerifyOtpRequest>({
    mutationFn: verifyOtp,
    onSuccess: (data) => {
      setAuthToken(StorageKey.ANALYTICS_TOKEN, data.token);
    },
  });
};

export const useResendOtpMutation = () => {
  return useMutation<ResendOtpResponse, Error, ResendOtpRequest>({
    mutationFn: resendOtp,
  });
};
