import { toast } from "sonner";

type ConnectionToastOptions = {
  warning?: string | null;
  successMessage?: string;
  warningMessage?: string;
  durationMs?: number;
};

const defaultWarningMessage =
  "Account connected successfully. However, we noticed there is currently no data in this account. Your dashboard will update as soon as new activity occurs.";
const defaultSuccessMessage = "Account connected successfully!";

export const showConnectionResultToast = ({
  warning,
  successMessage = defaultSuccessMessage,
  warningMessage = defaultWarningMessage,
  durationMs = 6000,
}: ConnectionToastOptions) => {
  if (warning === "no_data") {
    toast(warningMessage, { duration: durationMs });
    return;
  }

  if (successMessage) {
    toast.success(successMessage);
  }
};
