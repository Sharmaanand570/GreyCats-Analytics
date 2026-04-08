import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const LinkedinCallbackHandler = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        // Sometimes hash routing places params after hash. Let's check both
        const hashParams = new URLSearchParams(location.hash.split("?")[1] || "");

        const status = queryParams.get("status") || hashParams.get("status");
        const accountId = queryParams.get("accountId") || hashParams.get("accountId");
        const error = queryParams.get("error") || hashParams.get("error");
        
        if (error || status === "error") {
            toast.error(error || "LinkedIn authentication failed");
            navigate("/clients", { replace: true });
            return;
        }

        if (status === "success" && accountId) {
            toast.success("LinkedIn account connected successfully!");

            // If we have a pending client ID in local storage, we can trigger the global oauth handler
            // or we just redirect to the general integrations page if we don't know the client.
            const pendingClientId = localStorage.getItem("pending_oauth_client_id");
            
            // To let GlobalOAuthHandler pick it up, we need to set pending_oauth_integration if it wasn't set,
            // but usually the caller sets it. Let's ensure it's set.
            localStorage.setItem("pending_oauth_integration", "linkedin");

            if (pendingClientId) {
                // Redirecting to the client page so GlobalOAuthHandler pops up the Account Selection Modal
                navigate(`/clients/${pendingClientId}?tab=data-sources&success=true`, { replace: true });
            } else {
                navigate("/clients", { replace: true });
            }
        } else {
            toast.error("Invalid response from LinkedIn");
            navigate("/clients", { replace: true });
        }
    }, [location, navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500 mb-4"></div>
            <p className="text-zinc-600 font-medium">Completing LinkedIn Connection...</p>
        </div>
    );
};

export default LinkedinCallbackHandler;
