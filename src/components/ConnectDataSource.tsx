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
import { SiWoocommerce, SiShopify } from "react-icons/si";
import { useWooCommerceConnect } from "@/features/woocommerce/hooks/useWooCommerce";
import { useShopifyConnect } from "@/features/shopify/hooks/useShopifyConnect";
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
  };

  const connectYouTube = mutations.youtube.mutateAsync;
  const connectGoogle = mutations.google.mutateAsync;
  const connectGoogleConsole = mutations.googleConsole.mutateAsync;
  const connectWooCommerce = mutations.woocommerce.mutateAsync;
  const connectShopify = mutations.shopify.mutateAsync;

  const isConnecting =
    mutations.youtube.isPending ||
    mutations.google.isPending ||
    mutations.googleConsole.isPending ||
    mutations.woocommerce.isPending ||
    mutations.shopify.isPending;

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
        <DialogContent className="lg:max-w-[60vw] lg:max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Select a Data Source</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          {Next === null ? (
            <form>
              {/* Top Controls */}
              <div className="flex justify-between space-x-6 mt-4 p-3 rounded">
                <div className="w-[40%]">
                  <Input id="data-source-name" placeholder="Data Source Name" />
                </div>

                <div className="flex w-[60%] justify-between">
                  <div className="flex w-1/2 space-x-2">
                    <Button>All (20)</Button>
                    <Button>New (2)</Button>
                    <Button>Popular (12)</Button>
                  </div>

                  <div className="flex w-1/2 justify-end">
                    <CheckBoxInput />
                  </div>
                </div>
              </div>

              {/* SCROLL AREA */}
              <div className="mt-4 h-[400px] overflow-y-scroll pr-2">
                <div className="grid grid-cols-3 gap-3">
                  {dataSourceOptions.map((option) => (
                    <div
                      onClick={() => setSelectedSource(option)}
                      id={String(option.id)}
                      key={String(option.id)}
                      className={`flex items-center p-4 rounded-md border hover:bg-slate-100 cursor-pointer ${
                        String(SelectedSource.id) === String(option.id)
                          ? "bg-slate-100 border-slate-300"
                          : ""
                      }`}
                    >
                      <option.icon 
                        className="mr-2 h-6 w-6" 
                        style={option.color ? { color: option.color } : undefined}
                      />
                      {option.name}
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <DialogFooter className="mt-4">
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
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
                    } else {
                      // For other sources, just go to next step
                      setNext(SelectedSource.id as string);
                    }
                  }}
                  disabled={isConnecting}
                  type="button"
                >
                  {isConnecting ? "Connecting..." : "Next"}
                </Button>
              </DialogFooter>
            </form>
          ) : Next === "woocommerce" ? (
            <div>
              <div>
                <div className="w-full flex justify-center flex-col items-center ">
                  <div className="flex items-center gap-2 py-6">
                    {SelectedSource.icon &&
                      typeof SelectedSource.icon !== "string" && (
                        <SelectedSource.icon 
                          className="text-5xl" 
                          style={SelectedSource.color ? { color: SelectedSource.color } : undefined}
                        />
                      )}
                    <span className="text-4xl">{SelectedSource.name}</span>
                  </div>

                  <div className="w-full h-[300px]  overflow-y-scroll">
                    <form action="submit">
                      <div className="px-4 space-y-2">
                        <div className="flex flex-col justify-start">
                          <span className="text-xs font-medium mb-2">
                            Store URL*
                          </span>
                          <Input
                            className="w-full rounded-[0.5rem] p-4 py-5 mb-4"
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
                          <span className="text-xs font-medium mb-2">
                            Consumer Key*
                          </span>
                          <Input
                            className="w-full rounded-[0.5rem] p-4 py-5 mb-4"
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
                          <span className="text-xs font-medium mb-2">
                            Consumer Secret*
                          </span>
                          <Input
                            className="w-full rounded-[0.5rem] p-4 py-5 mb-4"
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
              <DialogFooter className="mt-4  flex justify-between w-full ">
                <Button onClick={() => setNext(null)} variant="outline">
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
                  className="flex-1"
                  type="submit"
                >
                  Connect
                </Button>
              </DialogFooter>
            </div>
          ) : Next === "shopify" ? (
            <div>
              <div>
                <div className="w-full flex justify-center flex-col items-center ">
                  <div className="flex items-center gap-2 py-6">
                    {SelectedSource.icon &&
                      typeof SelectedSource.icon !== "string" && (
                        <SelectedSource.icon 
                          className="text-5xl" 
                          style={SelectedSource.color ? { color: SelectedSource.color } : undefined}
                        />
                      )}
                    <span className="text-4xl">{SelectedSource.name}</span>
                  </div>

                  <div className="w-full h-[300px]  overflow-y-scroll">
                    <form action="submit">
                      <div className="px-4 space-y-2">
                        <div className="flex flex-col justify-start">
                          <span className="text-xs font-medium mb-2">
                            Shop URL*
                          </span>
                          <Input
                            className="w-full rounded-[0.5rem] p-4 py-5 mb-4"
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
              <DialogFooter className="mt-4  flex justify-between w-full ">
                <Button onClick={() => setNext(null)} variant="outline">
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
                  className="flex-1"
                  type="submit"
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
