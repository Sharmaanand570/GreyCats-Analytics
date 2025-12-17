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
import { FaGoogle, FaYoutube } from "react-icons/fa6";
import React from "react";
import { useYouTubeConnect } from "@/features/YouTube/hooks/useYouTubeConnect";
import { toast } from "sonner";
import { useGoogleConnect } from "@/features/YouTube/hooks/google/useGoogleConnect";
import { useGoogleConsoleConnect } from "@/features/YouTube/hooks/google/useGoogleConsoleConnect";
import { SiWoocommerce, SiShopify, SiMeta } from "react-icons/si";
import { useWooCommerceConnect } from "@/features/woocommerce/hooks/useWooCommerce";
import { useShopifyConnect } from "@/features/shopify/hooks/useShopify";
import { useMetaConnect } from "@/features/meta/hooks/useMetaConnect";
import { useMetaBusinessConnect } from "@/features/meta/hooks/useMetaBusinessData";
import { useQueryClient } from "@tanstack/react-query";
import { getPlatformConfig } from "@/utils/platformMapping";
import { assignAccountToClient } from "@/api/integrationApi";


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
    name: "google Analytics",
    icon: FaGoogle,
    color: getPlatformConfig("google")?.color,
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: FaYoutube,
    color: getPlatformConfig("youtube")?.color,
  },
  {
    id: "google-console",
    name: "Google Console",
    icon: FaGoogle,
    color: getPlatformConfig("google-console")?.color,
  },
  {
    id: "woocommerce",
    name: "WooCommerce",
    icon: SiWoocommerce,
    color: getPlatformConfig("woo")?.color,
  },
  {
    id: "shopify",
    name: "Shopify",
    icon: SiShopify,
    color: getPlatformConfig("shopify")?.color,
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
  const [shopifyShopUrl, setShopifyShopUrl] = React.useState("");
  const [SelectedSource, setSelectedSource] = React.useState<DataSourceOption>({
    id: 0,
    name: "",
    icon: "",
  });

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
    shopify: useShopifyConnect(),
    meta: useMetaConnect(),
    metaBusiness: useMetaBusinessConnect(),
  };

  const connectYouTube = mutations.youtube.mutateAsync;
  const connectGoogle = mutations.google.mutateAsync;
  const connectGoogleConsole = mutations.googleConsole.mutateAsync;
  const connectWooCommerce = mutations.woocommerce.mutateAsync;
  const connectShopify = mutations.shopify.mutateAsync;
  const connectMeta = mutations.meta.mutateAsync;
  const connectMetaBusiness = mutations.metaBusiness.mutateAsync;

  const isConnecting =
    mutations.youtube.isPending ||
    mutations.google.isPending ||
    mutations.googleConsole.isPending ||
    mutations.woocommerce.isPending ||
    mutations.woocommerce.isPending ||
    mutations.shopify.isPending ||
    mutations.meta.isPending ||
    mutations.metaBusiness.isPending;

  const queryClient = useQueryClient();

  async function handleConnectWooCommerce(
    payload: WooCommercePayload,
    queryClient: any,
    setNext: (value: any) => void,
    setOpen: (value: boolean) => void,
    toast: any
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

      if (response.success && response.account) {
        // Now assign it to the client
        await assignAccountToClient(clientId, 'woocommerce', response.account.id);
        toast.success("WooCommerce connected successfully");
        setNext(null);
        setOpen(false);
      } else {
        toast.error(response.message || "Failed to connect WooCommerce");
      }

      // Refetch integrations and client details
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
      if (clientId) {
        queryClient.invalidateQueries({ queryKey: ["client", clientId] });
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to connect WooCommerce";

      toast.error(errorMessage);
    }
  }

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="w-[95vw] max-w-[95vw] sm:w-[90vw] sm:max-w-[90vw] md:w-[75vw] md:max-w-[75vw] lg:w-[60vw] lg:max-w-[60vw] xl:w-[55vw] xl:max-w-[55vw] max-h-[95vh] sm:max-h-[90vh] md:max-h-[85vh] lg:max-h-[80vh] mx-2 sm:mx-4 md:mx-6">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg md:text-xl lg:text-2xl">Choose your Metrics</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm md:text-base">
              Select an integration to connect and track your metrics
            </DialogDescription>
          </DialogHeader>
          {Next === null ? (
            <form>
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
              <div className="mt-3 sm:mt-4 md:mt-5 h-[350px] sm:h-[400px] md:h-[450px] overflow-y-auto border rounded-lg">
                {filteredDataSources.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <p className="text-sm sm:text-base">No integrations found</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredDataSources.map((option) => (
                      <div
                        onClick={() => setSelectedSource(option)}
                        id={String(option.id)}
                        key={String(option.id)}
                        className={`flex items-center justify-between p-3 sm:p-4 hover:bg-slate-50 cursor-pointer transition-colors ${String(SelectedSource.id) === String(option.id)
                          ? "bg-slate-100"
                          : ""
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <option.icon
                            className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0"
                            style={option.color ? { color: option.color } : undefined}
                          />
                          <span className="text-sm sm:text-base font-medium">{option.name}</span>
                        </div>
                        <svg
                          className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <DialogFooter className="mt-4 sm:mt-5 md:mt-6 flex-col sm:flex-row gap-2 sm:gap-3">
                <DialogClose asChild>
                  <Button variant="outline" className="w-full sm:w-auto text-sm sm:text-base">
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  disabled={!SelectedSource.name || isConnecting}
                  onClick={async (e) => {
                    e.preventDefault();
                    if (!SelectedSource.name) {
                      toast.error("Please select a data source");
                      return;
                    }
                    // If YouTube is selected, initiate OAuth flow
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
                        const errorMessage =
                          error instanceof Error
                            ? error.message
                            : "Failed to connect YouTube";
                        toast.error(errorMessage);
                      }
                    } else if (SelectedSource.id === "google-analytics") {
                      try {
                        const response = await connectGoogle();
                        console.log(response);
                        if (response.success && response.url) {
                          if (clientId) {
                            localStorage.setItem("pending_oauth_client_id", clientId.toString());
                            localStorage.setItem("pending_oauth_integration", "google-analytics");
                          }
                          window.location.href = response.url;
                        }
                      } catch (error) {
                        const errorMessage =
                          error instanceof Error
                            ? error.message
                            : "Failed to connect Google Analytics";
                        toast.error(errorMessage);
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
                        const errorMessage =
                          error instanceof Error
                            ? error.message
                            : "Failed to connect Google Console";
                        toast.error(errorMessage);
                      }
                    } else if (SelectedSource.id === "shopify") {
                      // For Shopify, go to next step to collect shop URL
                      setNext(SelectedSource.id as string);
                    } else if (SelectedSource.id === "meta-ads") {
                      // For Meta Ads, initiate OAuth flow
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
                        const errorMessage =
                          error instanceof Error
                            ? error.message
                            : "Failed to connect Meta Ads";
                        toast.error(errorMessage);
                        toast.error(errorMessage);
                      }
                    } else if (SelectedSource.id === "meta-business") {
                      try {
                        await connectMetaBusiness();
                        if (clientId) {
                          // Meta Business hook might handle redirect immediately, 
                          // but if it returns a URL or promise, we should set state there.
                          // Assuming the hook handles it or we need to look into it. 
                          // For now, setting it here safety.
                          localStorage.setItem("pending_oauth_client_id", clientId.toString());
                          localStorage.setItem("pending_oauth_integration", "meta-business");
                        }
                        // The hook handles redirection or toast on error
                      } catch (error) {
                        console.error(error);
                      }
                    } else {
                      // For other sources, just go to next step
                      setNext(SelectedSource.id as string);
                    }
                  }}
                  type="button"
                  className="w-full sm:w-auto text-sm sm:text-base"
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
                            className="w-full rounded-lg sm:rounded-md md:rounded-[0.5rem] p-3 sm:p-3.5 md:p-4 py-2.5 sm:py-3 md:py-4 lg:py-5 mb-2.5 sm:mb-3 md:mb-4 text-sm sm:text-base md:text-base"
                            type="text"
                            placeholder={`https://client.agency.com/ `}
                            onChange={(e) =>
                              setWooCommerceFormData({
                                ...woocommerceFormData,
                                storeUrl: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="flex flex-col justify-start">
                          <span className="text-xs sm:text-sm md:text-base font-medium mb-1.5 sm:mb-2 md:mb-2.5">
                            Consumer Key*
                          </span>
                          <Input
                            className="w-full rounded-lg sm:rounded-md md:rounded-[0.5rem] p-3 sm:p-3.5 md:p-4 py-2.5 sm:py-3 md:py-4 lg:py-5 mb-2.5 sm:mb-3 md:mb-4 text-sm sm:text-base md:text-base"
                            type="text"
                            placeholder={`ck_000d52afdc3474****`}
                            onChange={(e) =>
                              setWooCommerceFormData({
                                ...woocommerceFormData,
                                consumerKey: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="flex flex-col justify-start">
                          <span className="text-xs sm:text-sm md:text-base font-medium mb-1.5 sm:mb-2 md:mb-2.5">
                            Consumer Secret*
                          </span>
                          <Input
                            className="w-full rounded-lg sm:rounded-md md:rounded-[0.5rem] p-3 sm:p-3.5 md:p-4 py-2.5 sm:py-3 md:py-4 lg:py-5 mb-2.5 sm:mb-3 md:mb-4 text-sm sm:text-base md:text-base"
                            type="text"
                            placeholder={`cs_87af0de2a7ae6*****`}
                            onChange={(e) =>
                              setWooCommerceFormData({
                                ...woocommerceFormData,
                                consumerSecret: e.target.value,
                              })
                            }
                          />
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
                  disabled={
                    woocommerceFormData.storeUrl === "" ||
                    woocommerceFormData.consumerKey === "" ||
                    woocommerceFormData.consumerSecret === "" ||
                    isConnecting
                  }
                  onClick={() => {
                    handleConnectWooCommerce(
                      woocommerceFormData,
                      queryClient,
                      setNext,
                      setOpen,
                      toast
                    );

                  }}
                  className="flex-1 sm:flex-none w-full sm:w-auto text-sm sm:text-base md:text-base"
                  type="submit"
                >
                  Connect
                </Button>
              </DialogFooter>
            </div>
          ) : Next === "shopify" ? (
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

                  <div className="w-full h-[200px] sm:h-[240px] md:h-[280px] lg:h-[300px] overflow-y-auto">
                    <form onSubmit={(e) => e.preventDefault()}>
                      <div className="px-2 sm:px-3 md:px-4 lg:px-6 space-y-2 sm:space-y-2.5 md:space-y-3">
                        <div className="flex flex-col justify-start">
                          <span className="text-xs sm:text-sm md:text-base font-medium mb-1.5 sm:mb-2 md:mb-2.5">
                            Shop URL*
                          </span>
                          <Input
                            className="w-full rounded-lg sm:rounded-md md:rounded-[0.5rem] p-3 sm:p-3.5 md:p-4 py-2.5 sm:py-3 md:py-4 lg:py-5 mb-2.5 sm:mb-3 md:mb-4 text-sm sm:text-base md:text-base"
                            type="text"
                            placeholder="your-shop.myshopify.com"
                            onChange={(e) => setShopifyShopUrl(e.target.value)}
                            value={shopifyShopUrl}
                          />
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
                  disabled={shopifyShopUrl === "" || isConnecting}
                  onClick={async () => {
                    try {
                      const response = await connectShopify({
                        shop: shopifyShopUrl,
                      });

                      if (response.success && response.url) {
                        if (clientId) {
                          localStorage.setItem("pending_oauth_client_id", clientId.toString());
                          localStorage.setItem("pending_oauth_integration", "shopify");
                        }
                        window.location.href = response.url;
                      }

                      queryClient.invalidateQueries({ queryKey: ["integrations"] });
                      toast.success("Shopify connected successfully");



                    } catch (error) {

                      const errorMessage =
                        error instanceof Error
                          ? error.message
                          : "Failed to connect Shopify";
                      toast.error(errorMessage);
                    }
                  }}
                  className="flex-1 sm:flex-none w-full sm:w-auto text-sm sm:text-base md:text-base"
                  type="button"
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
    </div>
  );
}

export default ConnectDataSource;
