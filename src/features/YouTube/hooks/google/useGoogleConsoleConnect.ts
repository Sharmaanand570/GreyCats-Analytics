import { useMutation } from "@tanstack/react-query";
import {
  connectGoogleConsole,
  type ConnectGoogleConsoleResponse,
} from "../../API/googleConsoleapi";

export const useGoogleConsoleConnect = () => {
  return useMutation<ConnectGoogleConsoleResponse, Error, void>({
    mutationFn: () => connectGoogleConsole(),
  });
};

