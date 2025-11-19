import { useMutation } from "@tanstack/react-query";

import {
  loginUser,
  type LoginRequest,
  type LoginResponse,
} from "../API/LoginApi";
import { setAuthToken, StorageKey } from "@/utils/storage";

export const useLoginQuery = () => {
  return useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: loginUser,
    onSuccess: (data) => {
      // Save token
      setAuthToken(StorageKey.ANALYTICS_TOKEN, data.token);

    },
  });
};
