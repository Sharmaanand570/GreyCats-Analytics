import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

export default function GoogleAdsConnectPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const pendingIntegration = localStorage.getItem("pending_oauth_integration");
    const pendingClientId = localStorage.getItem("pending_oauth_client_id");

    if (pendingIntegration !== "google-ads" || !pendingClientId) {
      navigate("/data-sources/google-ads", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-3">
        <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
        <p className="text-sm font-medium">Finishing Google Ads connection...</p>
        <p className="text-xs text-muted-foreground">
          You will be prompted to pick an account to connect.
        </p>
      </div>
    </div>
  );
}
