import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { IconType } from "react-icons";
import { SiGoogleanalytics, SiGooglesearchconsole, SiYoutube, SiWoocommerce, SiMeta, SiGoogleads, SiLinkedin, SiInstagram, SiTelegram } from "react-icons/si";
import { FaWordpress } from "react-icons/fa6";
import { Eye, EyeOff } from "lucide-react";
import React from "react";
import { useYouTubeConnect } from "@/features/YouTube/hooks/useYouTubeConnect";
import { toast } from "sonner";
import { useGoogleConnect } from "@/features/YouTube/hooks/google/useGoogleConnect";
import { useGoogleConsoleConnect } from "@/features/YouTube/hooks/google/useGoogleConsoleConnect";

import { useWooCommerceConnect } from "@/features/woocommerce/hooks/useWooCommerce";
import { useMetaConnect } from "@/features/meta/hooks/useMetaConnect";
import { useMetaBusinessConnect } from "@/features/meta/hooks/useMetaBusinessData";
import { useGoogleAdsConnect } from "@/features/googleAds/hooks/useGoogleAds";

import { useLinkedinOrgConnect } from "@/features/linkedin/hooks/useLinkedin";
import { useConnectWordPress, useConnectTelegram } from "@/features/blog/hooks/useBlogPosts";
import { useQueryClient } from "@tanstack/react-query";
import { getPlatformConfig } from "@/utils/platformMapping";
import { assignAccountToClient } from "@/api/integrationApi";
import { clientKeys } from "@/hooks/useClients";
import { Loader2 } from "lucide-react";
import { showConnectionResultToast } from "@/utils/connectionToasts";
import { getErrorMessage } from "@/utils/errorHandling";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";


class IconErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

type ConnectDataSourceType = {
  children: React.ReactNode;
  clientId?: number;
};


type DataSourceOption = {
  id: string | number;
  name: string | string;
  icon: IconType | string;
  color?: string;
};

type WooCommercePayload = {
  storeUrl: string;
  consumerKey: string;
  consumerSecret: string;
};

const dataSourceOptions: DataSourceOption[] = [
  {
    id: "google-analytics",
    name: "Google Analytics",
    icon: SiGoogleanalytics,
    color: getPlatformConfig("google")?.color,
  },
  {
    id: "google-console",
    name: "Google Search Console",
    icon: SiGooglesearchconsole,
    color: getPlatformConfig("google-console")?.color,
  },
  {
    id: "google-ads",
    name: "Google Ads",
    icon: SiGoogleads,
    color: getPlatformConfig("google-ads")?.color,
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: SiYoutube,
    color: getPlatformConfig("youtube")?.color,
  },
  {
    id: "meta-ads",
    name: "Meta Ads",
    icon: SiMeta,
    color: getPlatformConfig("meta-ads")?.color,
  },
  {
    id: "meta-business",
    name: "Meta Business",
    icon: SiMeta,
    color: getPlatformConfig("meta-business")?.color,
  },
  {
    id: "instagram-business",
    name: "Instagram Business",
    icon: SiInstagram,
    color: getPlatformConfig("instagram")?.color || "#E1306C",
  },
  {
    id: "woocommerce",
    name: "WooCommerce",
    icon: SiWoocommerce,
    color: getPlatformConfig("woo")?.color,
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: SiLinkedin,
    color: getPlatformConfig("linkedin")?.color,
  },
  {
    id: "wordpress",
    name: "WordPress",
    icon: FaWordpress,
    color: "#21759b",
  },
  {
    id: "telegram",
    name: "Telegram",
    icon: SiTelegram,
    color: "#229ED9",
  },
];

function ConnectDataSource({
  children,
  clientId,
}: ConnectDataSourceType): React.JSX.Element {
  const [open, setOpen] = React.useState(false);
  const [Next, setNext] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [woocommerceFormData, setWooCommerceFormData] = React.useState({
    storeUrl: "",
    consumerKey: "",
    consumerSecret: "",
  });
  const [wpForm, setWpForm] = React.useState({
    siteUrl: "",
    username: "",
    applicationPassword: "",
    siteName: "",
  });
  const [showWpPassword, setShowWpPassword] = React.useState(false);
  const [tgForm, setTgForm] = React.useState({
    botToken: "",
    chatId: "",
    displayName: "",
  });
  const [showTgToken, setShowTgToken] = React.useState(false);
const [SelectedSource, setSelectedSource] = React.useState<DataSourceOption>({
    id: 0,
    name: "",
    icon: "",
  });
  const [showSuccessDialog, setShowSuccessDialog] = React.useState(false);

  // Filter data sources based on search query
  const filteredDataSources = React.useMemo(() => {
    if (!searchQuery.trim()) return dataSourceOptions;
    return dataSourceOptions.filter((option) =>
      option.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const mutations = {
    youtube: useYouTubeConnect(),
    google: useGoogleConnect(),
    googleConsole: useGoogleConsoleConnect(),
    woocommerce: useWooCommerceConnect(),
meta: useMetaConnect(),
    metaBusiness: useMetaBusinessConnect(),
    googleAds: useGoogleAdsConnect(),
    linkedin: useLinkedinOrgConnect(),
    wordpress: useConnectWordPress(),
    telegram: useConnectTelegram(),
  };

  const connectYouTube = mutations.youtube.mutateAsync;
  const connectGoogle = mutations.google.mutateAsync;
  const connectGoogleConsole = mutations.googleConsole.mutateAsync;
  const connectWooCommerce = mutations.woocommerce.mutateAsync;
const connectMeta = mutations.meta.mutateAsync;
  const connectMetaBusiness = mutations.metaBusiness.mutateAsync;
  const connectGoogleAds = mutations.googleAds.mutateAsync;
  const connectLinkedin = mutations.linkedin.mutateAsync;
  const connectWordPress = mutations.wordpress.mutateAsync;
  const connectTelegram = mutations.telegram.mutateAsync;

  const isConnecting =
    mutations.youtube.isPending ||
    mutations.google.isPending ||
    mutations.googleConsole.isPending ||
    mutations.woocommerce.isPending ||
mutations.meta.isPending ||
    mutations.metaBusiness.isPending ||
    mutations.googleAds.isPending ||
    mutations.linkedin.isPending ||
    mutations.wordpress.isPending ||
    mutations.telegram.isPending;

  const queryClient = useQueryClient();

  async function handleConnectWooCommerce(
    payload: WooCommercePayload,
    queryClient: any,
    setNext: (value: any) => void,
    setOpen: (value: boolean) => void,
    toast: any,
    setShowSuccessDialog: (value: boolean) => void
  ) {
    try {
      if (!clientId) {
        toast.error("Client context is missing");
        return;
      }
      const response = await connectWooCommerce({
        params: {
          storeUrl: payload.storeUrl,
          consumerKey: payload.consumerKey,
          consumerSecret: payload.consumerSecret,
        }
      });
      console.log("[WooCommerce connect] response:", response);

      if (response.success && response.account) {
        // Now assign it to the client
        await assignAccountToClient(clientId, 'woocommerce', response.account.id);
        const storeLabel = response.account?.storeUrl || payload.storeUrl;
        const successMessage = storeLabel
          ? `Store ${storeLabel} connected successfully`
          : "Store connected successfully";
        const warningMessage = storeLabel
          ? `Store ${storeLabel} connected successfully. However, we noticed there are currently no products or orders. Your dashboard will update as activity occurs.`
          : "Store connected successfully. However, we noticed there are currently no products or orders. Your dashboard will update as activity occurs.";
        showConnectionResultToast({
          warning: response.warning,
          successMessage,
          warningMessage,
        });
        setNext(null);
        setOpen(false);
        setShowSuccessDialog(true);
      } else {
        toast.error(response.message || "Failed to connect WooCommerce");
      }

      // Refetch integrations and client details
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
      if (clientId) {
        queryClient.invalidateQueries({ queryKey: clientKeys.detail(clientId) });
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, "Failed to connect WooCommerce");
      toast.error(errorMessage);
    }
  }

  const handleSelectSourceNext = async () => {
    if (!SelectedSource.name) {
      toast.error("Please select a data source");
      return;
    }
    if (isConnecting) return;

    if (SelectedSource.id === "youtube") {
      try {
        const response = await connectYouTube();
        if (response.success && response.url) {
          if (clientId) {
            localStorage.setItem("pending_oauth_client_id", clientId.toString());
            localStorage.setItem("pending_oauth_integration", "youtube");
          }
          window.location.href = response.url;
        }
      } catch (error) {
        toast.error(getErrorMessage(error, "Failed to connect YouTube"));
      }
    } else if (SelectedSource.id === "google-analytics") {
      try {
        const response = await connectGoogle();
        if (response.success && response.url) {
          if (clientId) {
            localStorage.setItem("pending_oauth_client_id", clientId.toString());
            localStorage.setItem("pending_oauth_integration", "google-analytics");
          }
          window.location.href = response.url;
        }
      } catch (error) {
        toast.error(getErrorMessage(error, "Failed to connect Google Analytics"));
      }
    } else if (SelectedSource.id === "google-console") {
      try {
        const response = await connectGoogleConsole();
        if (response.success && response.url) {
          if (clientId) {
            localStorage.setItem("pending_oauth_client_id", clientId.toString());
            localStorage.setItem("pending_oauth_integration", "google-search-console");
          }
          window.location.href = response.url;
        }
      } catch (error) {
        toast.error(getErrorMessage(error, "Failed to connect Google Console"));
      }
    } else if (SelectedSource.id === "meta-ads") {
      try {
        const response = await connectMeta({});
        if (response.success && response.url) {
          if (clientId) {
            localStorage.setItem("pending_oauth_client_id", clientId.toString());
            localStorage.setItem("pending_oauth_integration", "meta-ads");
          }
          window.location.href = response.url;
        } else {
          toast.error("Failed to initiate Meta connection");
        }
      } catch (error) {
        toast.error(getErrorMessage(error, "Failed to connect Meta Ads"));
      }
    } else if (SelectedSource.id === "meta-business" || SelectedSource.id === "instagram-business") {
      try {
        await connectMetaBusiness();
        if (clientId) {
          localStorage.setItem("pending_oauth_client_id", clientId.toString());
          localStorage.setItem("pending_oauth_integration", "meta-business");
        }
      } catch (error) {
        toast.error(getErrorMessage(error, "Failed to connect Meta Business"));
        console.error(error);
      }
    } else if (SelectedSource.id === "google-ads") {
      try {
        const response = await connectGoogleAds();
        if (response.success && response.url) {
          if (clientId) {
            localStorage.setItem("pending_oauth_client_id", clientId.toString());
            localStorage.setItem("pending_oauth_integration", "google-ads");
          }
          window.location.href = response.url;
        } else {
          toast.error("Failed to initiate Google Ads connection");
        }
      } catch (error) {
        toast.error(getErrorMessage(error, "Failed to connect Google Ads"));
      }
    } else if (SelectedSource.id === "linkedin") {
      try {
        const response = await connectLinkedin(clientId);
        if (response.success && response.url) {
          if (clientId) {
            localStorage.setItem("pending_oauth_client_id", clientId.toString());
            localStorage.setItem("pending_oauth_integration", "linkedin");
          }
          window.location.href = response.url;
        } else {
          toast.error("Failed to initiate LinkedIn connection");
        }
      } catch (error) {
        toast.error(getErrorMessage(error, "Failed to connect LinkedIn"));
      }
    } else if (SelectedSource.id === "wordpress" || SelectedSource.id === "telegram") {
      setNext(SelectedSource.id as string);
    } else {
      setNext(SelectedSource.id as string);
    }
  };

  async function handleConnectWordPress() {
    const siteUrl = wpForm.siteUrl.trim();
    const username = wpForm.username.trim();
    const applicationPassword = wpForm.applicationPassword.trim();
    const siteName = wpForm.siteName.trim();

    if (!siteUrl) { toast.error("Site URL is required"); return; }
    if (!username) { toast.error("Username is required"); return; }
    if (!applicationPassword) { toast.error("Application Password is required"); return; }

    try {
      await connectWordPress({
        siteUrl,
        username,
        applicationPassword,
        ...(siteName ? { siteName } : {}),
        ...(clientId ? { clientId } : {}),
      });
      toast.success("WordPress site connected successfully");
      setWpForm({ siteUrl: "", username: "", applicationPassword: "", siteName: "" });
      setShowWpPassword(false);
      setNext(null);
      setOpen(false);
      // Invalidate all clientId variants of the cache so any list/picker refetches.
      queryClient.invalidateQueries({ queryKey: ["blog-wordpress-targets"] });
      queryClient.invalidateQueries({ queryKey: ["blog-integrations"] });
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
      if (clientId) queryClient.invalidateQueries({ queryKey: clientKeys.detail(clientId) });
      setShowSuccessDialog(true);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to connect WordPress"));
    }
  }

  async function handleConnectTelegram() {
    const botToken = tgForm.botToken.trim();
    const chatId = tgForm.chatId.trim();
    const displayName = tgForm.displayName.trim();

    if (!botToken) { toast.error("Bot Token is required"); return; }
    if (!chatId) { toast.error("Channel ID/Username is required"); return; }

    try {
      await connectTelegram({
        botToken,
        chatId,
        ...(displayName ? { displayName } : {}),
        ...(clientId ? { clientId } : {}),
      });
      toast.success("Telegram channel connected successfully");
      setTgForm({ botToken: "", chatId: "", displayName: "" });
      setShowTgToken(false);
      setNext(null);
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["blog-telegram-targets"] });
      queryClient.invalidateQueries({ queryKey: ["blog-integrations"] });
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
      if (clientId) queryClient.invalidateQueries({ queryKey: clientKeys.detail(clientId) });
      setShowSuccessDialog(true);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to connect Telegram"));
    }
  }

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg md:text-xl lg:text-2xl">Select a Data Source</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm md:text-base">
              Select an integration to connect and track your metrics
            </DialogDescription>
          </DialogHeader>
          {Next === null ? (
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSelectSourceNext(); }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if ((e.target as HTMLElement).tagName !== 'BUTTON') {
                    e.preventDefault();
                    handleSelectSourceNext();
                  }
                }
              }}
            >
              {/* Search Bar */}
              <div className="mt-3 sm:mt-4 md:mt-5">
                <Input
                  id="search-integration"
                  placeholder="Search integrations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-sm sm:text-base"
                />
              </div>

              {/* Integrations List */}
              <div className="mt-4 border rounded-lg">
                {filteredDataSources.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <p className="text-sm sm:text-base">No integrations found</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredDataSources.map((option) => (
                      <div
                        onClick={() => setSelectedSource(option)}
                        onDoubleClick={() => {
                          setSelectedSource(option);
                          setTimeout(() => handleSelectSourceNext(), 0);
                        }}
                        tabIndex={0}
                        onKeyDown={(e) => {
                           if (e.key === 'Enter' || e.key === ' ') {
                               e.preventDefault();
                               setSelectedSource(option);
                           }
                        }}
                        key={String(option.id)}
                        className={`flex items-center gap-3 p-4 hover:bg-slate-50 cursor-pointer transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${String(SelectedSource.id) === String(option.id)
                          ? "bg-slate-100"
                          : ""
                          }`}
                      >
                        {/* Radio Button */}
                        <div className="flex-shrink-0">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${String(SelectedSource.id) === String(option.id)
                            ? "border-blue-600 bg-blue-600"
                            : "border-gray-300"
                            }`}>
                            {String(SelectedSource.id) === String(option.id) && (
                              <div className="w-2 h-2 rounded-full bg-white" />
                            )}
                          </div>
                        </div>

                        {/* Icon and Name */}
                        <div className="flex items-center gap-3 flex-1">
                          {option.icon && typeof option.icon !== "string" && (
                            <IconErrorBoundary>
                              <option.icon
                                className="h-6 w-6 flex-shrink-0"
                                style={option.color ? { color: option.color } : undefined}
                              />
                            </IconErrorBoundary>
                          )}
                          <div className="flex items-center gap-2">
                            <span className="text-base font-medium">{option.name}</span>
                            {option.name === "Meta Business" && <span className="text-xs text-gray-400 font-light">(facebook & instagram)</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <DialogFooter className="mt-6 flex-col sm:flex-row gap-2">
                <DialogClose asChild>
                  <Button variant="outline" className="w-full sm:w-auto">
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  isLoading={isConnecting}
                  disabled={!SelectedSource.name || isConnecting}
                  onClick={(e) => {
                    e.preventDefault();
                    handleSelectSourceNext();
                  }}
                  type="submit"
                  className="w-full sm:w-auto"
                >
                  {isConnecting ? "Connecting..." : "Next"}
                </Button>
              </DialogFooter>
            </form>
          ) : Next === "woocommerce" ? (
            <div>
              <div>
                <div className="w-full flex justify-center flex-col items-center">
                  <div className="flex items-center gap-1.5 sm:gap-2 md:gap-2.5 py-3 sm:py-4 md:py-5 lg:py-6">
                    {SelectedSource.icon &&
                      typeof SelectedSource.icon !== "string" && (
                        <SelectedSource.icon
                          className="text-3xl sm:text-3xl md:text-4xl lg:text-5xl"
                          style={SelectedSource.color ? { color: SelectedSource.color } : undefined}
                        />
                      )}
                    <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium">{SelectedSource.name}</span>
                  </div>

                  <div className="w-full h-[240px] sm:h-[260px] md:h-[300px] lg:h-[320px] overflow-y-auto">
                    <form onSubmit={(e) => e.preventDefault()}>
                      <div className="px-2 sm:px-3 md:px-4 lg:px-6 space-y-2 sm:space-y-2.5 md:space-y-3">
                        <div className="flex flex-col justify-start">
                          <span className="text-xs sm:text-sm md:text-base font-medium mb-1.5 sm:mb-2 md:mb-2.5">
                            Store URL*
                          </span>
                          <Input
                            className="w-full rounded-lg sm:rounded-md md:rounded-[0.5rem] p-3 sm:p-3.5 md:p-4 py-2.5 sm:py-3 md:py-4 lg:py-5 mb-1 text-sm sm:text-base md:text-base"
                            type="text"
                            placeholder={`https://client.agency.com/ `}
                            value={woocommerceFormData.storeUrl}
                            onChange={(e) =>
                              setWooCommerceFormData({
                                ...woocommerceFormData,
                                storeUrl: e.target.value,
                              })
                            }
                          />
                          {woocommerceFormData.storeUrl && !/^https?:\/\//.test(woocommerceFormData.storeUrl) && (
                            <p className="text-xs text-red-500 mb-2">Must start with http:// or https://</p>
                          )}
                        </div>

                        <div className="flex flex-col justify-start">
                          <span className="text-xs sm:text-sm md:text-base font-medium mb-1.5 sm:mb-2 md:mb-2.5">
                            Consumer Key*
                          </span>
                          <Input
                            className="w-full rounded-lg sm:rounded-md md:rounded-[0.5rem] p-3 sm:p-3.5 md:p-4 py-2.5 sm:py-3 md:py-4 lg:py-5 mb-1 text-sm sm:text-base md:text-base"
                            type="text"
                            placeholder={`ck_000d52afdc3474****`}
                            value={woocommerceFormData.consumerKey}
                            onChange={(e) =>
                              setWooCommerceFormData({
                                ...woocommerceFormData,
                                consumerKey: e.target.value,
                              })
                            }
                          />
                          {woocommerceFormData.consumerKey && !woocommerceFormData.consumerKey.startsWith('ck_') && (
                            <p className="text-xs text-red-500 mb-2">Must start with ck_</p>
                          )}
                        </div>

                        <div className="flex flex-col justify-start">
                          <span className="text-xs sm:text-sm md:text-base font-medium mb-1.5 sm:mb-2 md:mb-2.5">
                            Consumer Secret*
                          </span>
                          <Input
                            className="w-full rounded-lg sm:rounded-md md:rounded-[0.5rem] p-3 sm:p-3.5 md:p-4 py-2.5 sm:py-3 md:py-4 lg:py-5 mb-1 text-sm sm:text-base md:text-base"
                            type="text"
                            placeholder={`cs_87af0de2a7ae6*****`}
                            value={woocommerceFormData.consumerSecret}
                            onChange={(e) =>
                              setWooCommerceFormData({
                                ...woocommerceFormData,
                                consumerSecret: e.target.value,
                              })
                            }
                          />
                          {woocommerceFormData.consumerSecret && !woocommerceFormData.consumerSecret.startsWith('cs_') && (
                            <p className="text-xs text-red-500 mb-2">Must start with cs_</p>
                          )}
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <DialogFooter className="mt-3 sm:mt-3 md:mt-4 flex flex-col sm:flex-row justify-between w-full gap-2 sm:gap-2 md:gap-0">
                <Button
                  onClick={() => setNext(null)}
                  variant="outline"
                  className="w-full sm:w-auto text-sm sm:text-base md:text-base"
                >
                  Back
                </Button>

                <Button
                  isLoading={isConnecting}
                  disabled={
                    woocommerceFormData.storeUrl === "" ||
                    !/^https?:\/\//.test(woocommerceFormData.storeUrl) ||
                    woocommerceFormData.consumerKey === "" ||
                    !woocommerceFormData.consumerKey.startsWith('ck_') ||
                    woocommerceFormData.consumerSecret === "" ||
                    !woocommerceFormData.consumerSecret.startsWith('cs_') ||
                    isConnecting
                  }
                  onClick={() => {
                    handleConnectWooCommerce(
                      woocommerceFormData,
                      queryClient,
                      setNext,
                      setOpen,
                      toast,
                      setShowSuccessDialog
                    );

                  }}
                  className="flex-1 sm:flex-none w-full sm:w-auto text-sm sm:text-base md:text-base"
                  type="submit"
                >
                  Connect
                </Button>
              </DialogFooter>
            </div>
          ) : Next === "wordpress" ? (
            <div>
              <div className="w-full flex justify-center flex-col items-center">
                <div className="flex items-center gap-2 py-4">
                  {SelectedSource.icon && typeof SelectedSource.icon !== "string" && (
                    <SelectedSource.icon
                      className="text-3xl sm:text-4xl"
                      style={SelectedSource.color ? { color: SelectedSource.color } : undefined}
                    />
                  )}
                  <span className="text-xl sm:text-2xl font-medium">{SelectedSource.name}</span>
                </div>

                <div className="w-full px-2 sm:px-4 space-y-3">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium mb-1.5">Site URL*</span>
                    <Input
                      type="text"
                      placeholder="https://your-site.com"
                      value={wpForm.siteUrl}
                      onChange={(e) => setWpForm({ ...wpForm, siteUrl: e.target.value })}
                    />
                    {wpForm.siteUrl && !/^https?:\/\//.test(wpForm.siteUrl) && (
                      <p className="text-xs text-red-500 mt-1">Must start with http:// or https://</p>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm font-medium mb-1.5">Username*</span>
                    <Input
                      type="text"
                      placeholder="admin"
                      value={wpForm.username}
                      onChange={(e) => setWpForm({ ...wpForm, username: e.target.value })}
                    />
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm font-medium mb-1.5">Application Password*</span>
                    <div className="relative">
                      <Input
                        type={showWpPassword ? "text" : "password"}
                        placeholder="xxxx xxxx xxxx xxxx xxxx xxxx"
                        value={wpForm.applicationPassword}
                        onChange={(e) => setWpForm({ ...wpForm, applicationPassword: e.target.value })}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowWpPassword(s => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                        tabIndex={-1}
                      >
                        {showWpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-1">
                      Generate one at <span className="font-mono">Users → Profile → Application Passwords</span> in your WordPress admin.
                    </p>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm font-medium mb-1.5">Display Name (optional)</span>
                    <Input
                      type="text"
                      placeholder="My Blog"
                      value={wpForm.siteName}
                      onChange={(e) => setWpForm({ ...wpForm, siteName: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-4 flex flex-col sm:flex-row justify-between w-full gap-2">
                <Button onClick={() => setNext(null)} variant="outline" className="w-full sm:w-auto">Back</Button>
                <Button
                  isLoading={isConnecting}
                  disabled={
                    !wpForm.siteUrl ||
                    !/^https?:\/\//.test(wpForm.siteUrl) ||
                    !wpForm.username ||
                    !wpForm.applicationPassword ||
                    isConnecting
                  }
                  onClick={handleConnectWordPress}
                  className="w-full sm:w-auto"
                >
                  Connect
                </Button>
              </DialogFooter>
            </div>
          ) : Next === "telegram" ? (
            <div>
              <div className="w-full flex justify-center flex-col items-center">
                <div className="flex items-center gap-2 py-4">
                  {SelectedSource.icon && typeof SelectedSource.icon !== "string" && (
                    <SelectedSource.icon
                      className="text-3xl sm:text-4xl"
                      style={SelectedSource.color ? { color: SelectedSource.color } : undefined}
                    />
                  )}
                  <span className="text-xl sm:text-2xl font-medium">{SelectedSource.name}</span>
                </div>

                <div className="w-full px-2 sm:px-4 space-y-3">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium mb-1.5">Bot Token*</span>
                    <div className="relative">
                      <Input
                        type={showTgToken ? "text" : "password"}
                        placeholder="123456:ABC-DEF..."
                        value={tgForm.botToken}
                        onChange={(e) => setTgForm({ ...tgForm, botToken: e.target.value })}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowTgToken(s => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                        tabIndex={-1}
                      >
                        {showTgToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-1">
                      Get one from <span className="font-mono">@BotFather</span> on Telegram.
                    </p>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm font-medium mb-1.5">Channel ID / Username*</span>
                    <Input
                      type="text"
                      placeholder="@mychannel or -1001234567890"
                      value={tgForm.chatId}
                      onChange={(e) => setTgForm({ ...tgForm, chatId: e.target.value })}
                    />
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm font-medium mb-1.5">Display Name (optional)</span>
                    <Input
                      type="text"
                      placeholder="My Channel"
                      value={tgForm.displayName}
                      onChange={(e) => setTgForm({ ...tgForm, displayName: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-4 flex flex-col sm:flex-row justify-between w-full gap-2">
                <Button onClick={() => setNext(null)} variant="outline" className="w-full sm:w-auto">Back</Button>
                <Button
                  isLoading={isConnecting}
                  disabled={!tgForm.botToken || !tgForm.chatId || isConnecting}
                  onClick={handleConnectTelegram}
                  className="w-full sm:w-auto"
                >
                  Connect
                </Button>
              </DialogFooter>
            </div>
          ) : (
            ""
          )}

          {/* -------------------------------------------------------------------------- */}
        </DialogContent>
      </Dialog>

      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Connection Successful! 🎉</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm text-muted-foreground">
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
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowSuccessDialog(false)}>
              Got it, continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default ConnectDataSource;
