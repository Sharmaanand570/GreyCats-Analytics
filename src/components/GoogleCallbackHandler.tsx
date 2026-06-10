import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useGoogleCallback } from "@/features/YouTube/hooks/google/useGoogleConnect";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AccountSelectionModal } from "@/components/clients/AccountSelectionModal";
import type { IntegrationType } from "@/types/client.types";
import { showConnectionResultToast } from "@/utils/connectionToasts";

function GoogleCallbackHandler() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [clientId, setClientId] = useState<number | null>(null);
  const [integrationType, setIntegrationType] = useState<IntegrationType | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { mutateAsync: handleCallback } = useGoogleCallback();

  useEffect(() => {
    const processCallback = async () => {
      const status = searchParams.get("status");
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const warning = searchParams.get("warning");
      console.log("[Google callback] params:", Object.fromEntries(searchParams.entries()));

      if (status === "success") {
        showConnectionResultToast({ warning });
        const storedClientId = localStorage.getItem('pending_oauth_client_id');
        const storedIntegration = localStorage.getItem('pending_oauth_integration');

        if (storedClientId && storedIntegration) {
          setClientId(parseInt(storedClientId));
          setIntegrationType(storedIntegration as IntegrationType);
          setIsProcessing(false);
          setShowAccountModal(true);
        } else {
          setIsProcessing(false);
          setShowSuccessDialog(true);
        }
        return;
      }

      if (!code || !state) {
        const msg = "Missing OAuth parameters. Please try connecting again.";
        setErrorMessage(msg);
        toast.error(msg);
        setIsProcessing(false);
        setTimeout(() => {
          navigate("/data-sources");
        }, 3000);
        return;
      }

      try {
        const response = await handleCallback({ code, state });
        console.log("[Google callback] response:", response);
        if (response.success) {
          const storedClientId = localStorage.getItem('pending_oauth_client_id');
          const storedIntegration = localStorage.getItem('pending_oauth_integration');

          if (storedClientId && storedIntegration) {
            setClientId(parseInt(storedClientId));
            setIntegrationType(storedIntegration as IntegrationType);
            setIsProcessing(false);
            setShowAccountModal(true);
          } else {
            setIsProcessing(false);
            setShowSuccessDialog(true);
          }

          showConnectionResultToast({
            warning: response.warning,
            successMessage: response.message || "Account connected successfully!",
          });
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to complete Google connection";
        setErrorMessage(errorMessage);
        toast.error(errorMessage);
        setIsProcessing(false);
        // Redirect to data sources page after error
        setTimeout(() => {
          navigate("/data-sources");
        }, 3000);
      }
    };

    processCallback();
  }, [searchParams, handleCallback, navigate]);

  const handleAccountSelectionSuccess = () => {
    setShowAccountModal(false);
    setShowSuccessDialog(true);

    // Cleanup storage now
    localStorage.removeItem('pending_oauth_client_id');
    localStorage.removeItem('pending_oauth_integration');
  };

  const handleAccountSelectionCancel = () => {
    setShowAccountModal(false);
    toast.info("Account connection cancelled");
    // Cleanup storage
    localStorage.removeItem('pending_oauth_client_id');
    localStorage.removeItem('pending_oauth_integration');
    handleContinue();
  };

  const handleContinue = () => {
    if (clientId) {
      navigate(`/clients/${clientId}`);
    } else {
      navigate('/data-sources');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[100dvh] bg-gradient-to-bl from-black via-zinc-950 to-zinc-800 p-4">
      {!showAccountModal && !showSuccessDialog && (
        <Card className="w-full max-w-md bg-black/40 border-white/10 text-white">
          <CardHeader>
            <CardTitle>
              {errorMessage ? "Connection Failed" : "Connecting Google"}
            </CardTitle>
            <CardDescription className="text-zinc-300">
              {errorMessage
                ? "There was an issue completing the connection"
                : "Please wait while we complete the connection..."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isProcessing ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-zinc-300">Processing OAuth callback...</span>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full /5" />
                  <Skeleton className="h-4 w-3/4 /5" />
                </div>
              </div>
            ) : errorMessage ? (
              <div className="space-y-3">
                <div className="text-sm text-red-400 font-medium">
                  {errorMessage}
                </div>
                <div className="text-sm text-zinc-400">
                  Redirecting to data sources...
                </div>
              </div>
            ) : (
              <div className="text-sm text-zinc-400">
                Connection process completed.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {clientId && integrationType && (
        <AccountSelectionModal
          open={showAccountModal}
          onOpenChange={setShowAccountModal}
          clientId={clientId}
          integration={integrationType}
          onSuccess={handleAccountSelectionSuccess}
          onCancel={handleAccountSelectionCancel}
        />
      )}

      <AlertDialog open={showSuccessDialog} onOpenChange={handleContinue}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Connection Successful! 🎉</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Your data source has been connected successfully.
              </p>
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-blue-700 text-sm">
                <p className="font-medium flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Syncing Data...
                </p>
                <p className="mt-1">
                  Please allow up to 5 minutes for your historical data to be fully fetched and processed.
                  You can start building reports, but some metrics might be processing.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleContinue}>
              Got it, continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default GoogleCallbackHandler;
