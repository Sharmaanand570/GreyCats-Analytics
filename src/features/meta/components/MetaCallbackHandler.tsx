import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function MetaCallbackHandler() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processCallback = async () => {
      // Extract parameters from URL
      // Backend redirects with: status, userId, pageId, instagramUsername, reason (on error)
      const status = searchParams.get("status");
      const userId = searchParams.get("userId");
      const pageId = searchParams.get("pageId");
      const instagramUsername = searchParams.get("instagramUsername");
      const reason = searchParams.get("reason");

      // Check for error status first
      if (status === "error") {
        const errorMessage = reason
          ? `Meta connection failed: ${reason.replace(/_/g, ' ')}`
          : "Meta connection failed. Please try again.";

        toast.error(errorMessage);
        setIsProcessing(false);
        setTimeout(() => {
          navigate("/data-sources");
        }, 3000);
        return;
      }

      // Validate required parameters for success
      if (!status || !userId) {
        toast.error("Missing callback parameters. Please try connecting again.");
        setIsProcessing(false);
        setTimeout(() => {
          navigate("/data-sources");
        }, 3000);
        return;
      }

      // Check if status is success
      if (status.toLowerCase() !== "success") {
        toast.error(
          `Meta connection failed with status: ${status}. Please try connecting again.`
        );
        setIsProcessing(false);
        setTimeout(() => {
          navigate("/data-sources");
        }, 3000);
        return;
      }

      // ✅ SUCCESS - Backend already handled everything
      // The backend processed the OAuth callback and saved tokens
      const hasInstagram = instagramUsername === "connected";
      const successMessage = hasInstagram
        ? "Meta Business connected successfully with Instagram!"
        : "Meta Business connected successfully!";

      toast.success(successMessage);
      setIsProcessing(false);

      setTimeout(() => {
        setTimeout(() => {
          const storedClientId = localStorage.getItem('pending_oauth_client_id');
          if (storedClientId) {
            navigate(`/clients/${storedClientId}`);
          } else {
            navigate('/data-sources');
          }
        }, 1500);
      }, 1500);
    };

    // Small delay to ensure URL is fully loaded
    const timeoutId = setTimeout(() => {
      processCallback();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-bl from-black via-zinc-950 to-zinc-800 p-4">
      <Card className="w-full max-w-md bg-black/40 border-white/10 text-white">
        <CardHeader>
          <CardTitle>Connecting Meta</CardTitle>
          <CardDescription className="text-zinc-300">
            Please wait while we complete the authentication process.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isProcessing ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-zinc-300">
                  Processing OAuth callback...
                </span>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full /5" />
                <Skeleton className="h-4 w-3/4 /5" />
              </div>
            </div>
          ) : (
            <div className="text-sm text-zinc-400">
              Connection process completed. Redirecting...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default MetaCallbackHandler;
