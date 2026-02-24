import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useGoogleAdsAccounts, useConnectGoogleAdsAccount } from "../hooks/useGoogleAds";
import type { GoogleAdsAccount } from "../API/googleAdsApi";
import { clientKeys } from "@/hooks/useClients";
import { useQueryClient } from "@tanstack/react-query";

export default function GoogleAdsCallbackHandler() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const queryClient = useQueryClient();

    const success = searchParams.get("success") === "true";
    const storedClientId = localStorage.getItem("pending_oauth_client_id");
    const clientId = storedClientId ? parseInt(storedClientId) : null;

    const [selectedAccount, setSelectedAccount] = useState<GoogleAdsAccount | null>(null);
    const [connected, setConnected] = useState(false);

    const {
        data: accountsData,
        isLoading: isLoadingAccounts,
        error: accountsError,
    } = useGoogleAdsAccounts(success);

    const { mutate: connectAccount, isPending: isConnecting } = useConnectGoogleAdsAccount();

    useEffect(() => {
        if (!success) {
            toast.error("Google Ads authorization failed. Please try again.");
            navigate("/data-sources/google-ads");
        }
    }, [success, navigate]);

    const handleConnect = () => {
        if (!selectedAccount || !clientId) {
            toast.error("Please select an account and ensure a client is selected.");
            return;
        }

        connectAccount(
            {
                customerId: selectedAccount.customerId,
                customerName: selectedAccount.descriptiveName,
                clientId,
            },
            {
                onSuccess: () => {
                    localStorage.removeItem("pending_oauth_client_id");
                    localStorage.removeItem("pending_oauth_integration");
                    queryClient.invalidateQueries({ queryKey: clientKeys.detail(clientId) });
                    setConnected(true);
                    toast.success("Google Ads connected successfully! Data sync has started.");
                    setTimeout(() => {
                        navigate(`/data-sources/google-ads/${clientId}`);
                    }, 1500);
                },
                onError: (err) => {
                    toast.error(err.message || "Failed to connect Google Ads account.");
                },
            }
        );
    };

    if (connected) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <Card className="w-full max-w-md text-center">
                    <CardContent className="pt-10 pb-8 space-y-4">
                        <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
                        <p className="text-lg font-semibold">Google Ads Connected!</p>
                        <p className="text-sm text-muted-foreground">Redirecting you to your dashboard…</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-background px-4">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle className="text-xl">Select a Google Ads Account</CardTitle>
                    <CardDescription>
                        Choose which Google Ads account to connect to this client.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isLoadingAccounts ? (
                        <div className="flex items-center justify-center py-10 gap-3 text-muted-foreground">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Loading your accounts…</span>
                        </div>
                    ) : accountsError ? (
                        <div className="text-sm text-destructive text-center py-6">
                            Failed to load accounts: {accountsError.message}
                        </div>
                    ) : (accountsData?.accounts?.length ?? 0) === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-6">
                            No Google Ads accounts found. Make sure your Google account has access to at least one Google Ads customer.
                        </p>
                    ) : (
                        <div className="space-y-2 max-h-80 overflow-y-auto">
                            {accountsData!.accounts.map((account) => (
                                <button
                                    key={account.customerId}
                                    onClick={() => setSelectedAccount(account)}
                                    className={`w-full text-left p-4 rounded-lg border transition-all ${selectedAccount?.customerId === account.customerId
                                            ? "border-blue-500 bg-blue-50"
                                            : "border-border hover:border-blue-200 hover:bg-slate-50"
                                        }`}
                                >
                                    <p className="font-medium text-sm">{account.descriptiveName}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        ID: {account.customerId} &nbsp;·&nbsp; {account.currencyCode} &nbsp;·&nbsp; {account.timeZone}
                                    </p>
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => navigate("/data-sources/google-ads")}
                            disabled={isConnecting}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="flex-1"
                            onClick={handleConnect}
                            disabled={!selectedAccount || isConnecting || !clientId}
                            isLoading={isConnecting}
                        >
                            Connect Account
                        </Button>
                    </div>

                    {!clientId && (
                        <p className="text-xs text-amber-600 text-center">
                            No client context found. Please start the connection from a client's Data Sources page.
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
