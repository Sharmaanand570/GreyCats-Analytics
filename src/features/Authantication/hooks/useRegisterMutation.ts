import { useMutation } from "@tanstack/react-query";
import { registerUser, type RegisterRequest, type RegisterResponse } from "../API/RegisterApi";
import { setAuthToken, StorageKey } from "@/utils/storage";

export const useRegisterMutation = () => {
  return useMutation<RegisterResponse, Error, RegisterRequest>({
    mutationFn: registerUser,
    onSuccess: (data) => {
      setAuthToken(StorageKey.ANALYTICS_TOKEN, data.token);
    },
  });
};



