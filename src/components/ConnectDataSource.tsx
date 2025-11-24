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
import { CheckBoxInput } from "./CheckBoxInput";
import type { IconType } from "react-icons";
import { FaFacebook, FaGoogle, FaYoutube } from "react-icons/fa6";
import React from "react";
import { useYouTubeConnect } from "@/features/YouTube/hooks/useYouTubeConnect";
import { toast } from "sonner";
import { useGoogleConnect } from "@/features/YouTube/hooks/google/useGoogleConnect";
import { useGoogleConsoleConnect } from "@/features/YouTube/hooks/google/useGoogleConsoleConnect";
import { SiWoocommerce, SiShopify, SiMeta, SiQuora } from "react-icons/si";
import { useWooCommerceConnect } from "@/features/woocommerce/hooks/useWooCommerce";
import { useShopifyConnect } from "@/features/shopify/hooks/useShopifyConnect";
import { useMetaConnect } from "@/features/meta/hooks/useMetaConnect";
import { useQueryClient } from "@tanstack/react-query";
import { getPlatformConfig } from "@/utils/platformMapping";

type ConnectDataSourceType = {
  children: React.ReactNode;
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
    id: "google-console", 
    name: "Google Console", 
    icon: FaGoogle,
    color: getPlatformConfig("google-console")?.color,
  },
  { 
    id: "facebook", 
    name: "Facebook", 
    icon: FaFacebook,
    color: getPlatformConfig("facebook")?.color,
  },
  { 
    id: "youtube", 
    name: "YouTube", 
    icon: FaYoutube,
    color: getPlatformConfig("youtube")?.color,
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
    id: "quora", 
    name: "Quora", 
    icon: SiQuora,
    color: getPlatformConfig("quora")?.color,
  },
];

function ConnectDataSource({
  children,
}: ConnectDataSourceType): React.JSX.Element {
  const [open, setOpen] = React.useState(false);
  const [Next, setNext] = React.useState<string | null>(null);
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
  const mutations = {
    youtube: useYouTubeConnect(),
    google: useGoogleConnect(),
    googleConsole: useGoogleConsoleConnect(),
    woocommerce: useWooCommerceConnect(),
    shopify: useShopifyConnect(),
    meta: useMetaConnect(),
  };

  const connectYouTube = mutations.youtube.mutateAsync;
  const connectGoogle = mutations.google.mutateAsync;
  const connectGoogleConsole = mutations.googleConsole.mutateAsync;
  const connectWooCommerce = mutations.woocommerce.mutateAsync;
  const connectShopify = mutations.shopify.mutateAsync;
  const connectMeta = mutations.meta.mutateAsync;

  const isConnecting =
    mutations.youtube.isPending ||
    mutations.google.isPending ||
    mutations.googleConsole.isPending ||
    mutations.woocommerce.isPending ||
    mutations.shopify.isPending ||
    mutations.meta.isPending;

  const queryClient = useQueryClient();

  async function handleConnectWooCommerce(
    payload: WooCommercePayload,
    queryClient: any,
    setNext: (value: any) => void,
    setOpen: (value: boolean) => void,
    toast: any
  ) {
    try {
      const response = await connectWooCommerce({
        storeUrl: payload.storeUrl,
        consumerKey: payload.consumerKey,
        consumerSecret: payload.consumerSecret,
      });

      if (response.success) {
        toast.success("WooCommerce connected successfully");
        setNext(null);
        setOpen(false);
      } else {
        toast.error(response.message || "Failed to connect WooCommerce");
      }

      // Refetch integrations
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
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
            <DialogTitle className="text-base sm:text-lg md:text-xl lg:text-2xl">Select a Data Source</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm md:text-base">
              Make changes to your profile here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          {Next === null ? (
            <form>
              {/* Top Controls */}
              <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 md:gap-6 mt-2 sm:mt-3 md:mt-4 p-2 sm:p-3 md:p-4 rounded">
                <div className="w-full sm:w-[40%] md:w-[35%]">
                  <Input 
                    id="data-source-name" 
                    placeholder="Data Source Name" 
                    className="w-full text-sm sm:text-base md:text-base"
                  />
                </div>

                <div className="flex flex-col sm:flex-row w-full sm:w-[60%] md:w-[65%] gap-2 sm:gap-3 md:gap-4 sm:justify-between">
                  <div className="flex flex-wrap sm:flex-nowrap w-full sm:w-1/2 md:w-auto gap-1.5 sm:gap-2 md:gap-2.5">
                    <Button className="text-xs sm:text-sm md:text-base px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 flex-1 sm:flex-none whitespace-nowrap">
                      <span className="hidden md:inline">All (20)</span>
                      <span className="hidden sm:inline md:hidden">All (20)</span>
                      <span className="sm:hidden">All</span>
                    </Button>
                    <Button className="text-xs sm:text-sm md:text-base px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 flex-1 sm:flex-none whitespace-nowrap">
                      <span className="hidden md:inline">New (2)</span>
                      <span className="hidden sm:inline md:hidden">New (2)</span>
                      <span className="sm:hidden">New</span>
                    </Button>
                    <Button className="text-xs sm:text-sm md:text-base px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 flex-1 sm:flex-none whitespace-nowrap">
                      <span className="hidden md:inline">Popular (12)</span>
                      <span className="hidden sm:inline md:hidden">Popular (12)</span>
                      <span className="sm:hidden">Popular</span>
                    </Button>
                  </div>

                  <div className="flex w-full sm:w-1/2 md:w-auto sm:justify-end md:justify-end">
                    <CheckBoxInput />
                  </div>
                </div>
              </div>

              {/* SCROLL AREA */}
              <div className="mt-2 sm:mt-3 md:mt-4 h-[280px] sm:h-[320px] md:h-[380px] lg:h-[400px] overflow-y-auto pr-1 sm:pr-2 md:pr-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-2 sm:gap-2.5 md:gap-3 lg:gap-3">
                  {dataSourceOptions.map((option) => (
                    <div
                      onClick={() => setSelectedSource(option)}
                      id={String(option.id)}
                      key={String(option.id)}
                      className={`flex items-center p-2.5 sm:p-3 md:p-3.5 lg:p-4 rounded-md border hover:bg-slate-100 active:bg-slate-200 cursor-pointer transition-colors ${
                        String(SelectedSource.id) === String(option.id)
                          ? "bg-slate-100 border-slate-300 shadow-sm"
                          : "bg-white"
                      }`}
                    >
                      <option.icon 
                        className="mr-2 h-5 w-5 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-6 lg:w-6 flex-shrink-0" 
                        style={option.color ? { color: option.color } : undefined}
                      />
                      <span className="text-xs sm:text-sm md:text-base lg:text-base truncate font-medium">{option.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <DialogFooter className="mt-3 sm:mt-3 md:mt-4 flex-col sm:flex-row gap-2 sm:gap-2 md:gap-0">
                <DialogClose asChild>
                  <Button variant="outline" className="w-full sm:w-auto text-sm sm:text-base md:text-base">
                    Cancel
                  </Button>
                </DialogClose>
                <Button
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
                        if (response.success && response.url) {
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
                      }
                    } else {
                      // For other sources, just go to next step
                      setNext(SelectedSource.id as string);
                    }
                  }}
                  disabled={isConnecting}
                  type="button"
                  className="w-full sm:w-auto text-sm sm:text-base md:text-base"
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
