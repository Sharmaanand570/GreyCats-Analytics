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
      // Meta redirects with: status, user, metaUserId and hash fragment (#_=_)
      let status: string | null = null;
      let user: string | null = null;
      let metaUserId: string | null = null;

      try {
        // Get parameters from search params (before hash)
        status = searchParams.get("status");
        user = searchParams.get("user");
        metaUserId = searchParams.get("metaUserId");

        // If not found in search params, parse the full URL
        if (!status || !user || !metaUserId) {
          const fullUrl = window.location.href;

          // Remove hash fragment first to get clean URL
          const urlWithoutHash = fullUrl.split("#")[0];
          const urlObj = new URL(urlWithoutHash);

          // Try to get from URL search params
          status = urlObj.searchParams.get("status") || status;
          user = urlObj.searchParams.get("user") || user;
          metaUserId = urlObj.searchParams.get("metaUserId") || metaUserId;
        }
      } catch (error) {
        console.error("Error parsing URL parameters:", error);
        toast.error("Error parsing callback URL. Please try connecting again.");
        setIsProcessing(false);
        setTimeout(() => {
          navigate("/data-sources");
        }, 3000);
        return;
      }

      // Validate required parameters
      if (!status || !user || !metaUserId) {
        toast.error("Missing callback parameters. Please try connecting again.");
        setIsProcessing(false);
        setTimeout(() => {
          navigate("/data-sources");
        }, 3000);
        return;
      }

      // Validate parameters are not empty strings
      if (status.trim() === "" || user.trim() === "" || metaUserId.trim() === "") {
        toast.error("Invalid callback parameters. Please try connecting again.");
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
      // We just need to show success and redirect
      toast.success("Meta connected successfully!");
      setIsProcessing(false);

      setTimeout(() => {
        navigate("/data-sources");
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
                <Skeleton className="h-4 w-full bg-white/5" />
                <Skeleton className="h-4 w-3/4 bg-white/5" />
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
