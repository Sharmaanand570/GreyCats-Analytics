import React, { useState } from "react";
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
import { toast } from "sonner";
import { useLinkedinOrgConnect } from "@/features/linkedin/hooks/useLinkedin";
import { useConnectWordPress } from "../hooks/useBlogPosts";
import { SiLinkedin } from "react-icons/si";
import { FaWordpress, FaReddit } from "react-icons/fa6";
import { SiBlogger } from "react-icons/si";
import { ArrowLeft, ExternalLink, Eye, EyeOff } from "lucide-react";

type ConnectBlogPlatformProps = {
  children: React.ReactNode;
  clientId?: number;
};

type BlogPlatformOption = {
  id: string;
  name: string;
  icon: any;
  color?: string;
  comingSoon?: boolean;
};

const blogPlatformOptions: BlogPlatformOption[] = [
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: SiLinkedin,
    color: "#0A66C2",
  },
  {
    id: "wordpress",
    name: "WordPress",
    icon: FaWordpress,
    color: "#21759b",
  },
  {
    id: "blogger",
    name: "Blogger",
    icon: SiBlogger,
    color: "#f57c00",
    comingSoon: true,
  },
  {
    id: "reddit",
    name: "Reddit",
    icon: FaReddit,
    color: "#FF4500",
    comingSoon: true,
  },
];

export function ConnectBlogPlatform({
  children,
  clientId,
}: ConnectBlogPlatformProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSource, setSelectedSource] = useState<BlogPlatformOption | null>(null);

  // WordPress form state
  const [wpStep, setWpStep] = useState<"select" | "wordpress-form">("select");
  const [wpSiteUrl, setWpSiteUrl] = useState("");
  const [wpUsername, setWpUsername] = useState("");
  const [wpAppPassword, setWpAppPassword] = useState("");
  const [wpSiteName, setWpSiteName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const linkedinMutation = useLinkedinOrgConnect();
  const wordpressMutation = useConnectWordPress();
  const isConnecting = linkedinMutation.isPending || wordpressMutation.isPending;

  const filteredOptions = React.useMemo(() => {
    if (!searchQuery.trim()) return blogPlatformOptions;
    return blogPlatformOptions.filter((option) =>
      option.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const resetWpForm = () => {
    setWpStep("select");
    setWpSiteUrl("");
    setWpUsername("");
    setWpAppPassword("");
    setWpSiteName("");
    setShowPassword(false);
  };

  const handleConnect = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!selectedSource) {
      toast.error("Please select a platform");
      return;
    }

    if (selectedSource.comingSoon) {
      toast.info(`${selectedSource.name} integration is coming soon!`);
      return;
    }

    if (selectedSource.id === "wordpress") {
      setWpStep("wordpress-form");
      return;
    }

    if (selectedSource.id === "linkedin") {
      try {
        const response = await linkedinMutation.mutateAsync(clientId);
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
        const errorMessage =
          error instanceof Error ? error.message : "Failed to connect LinkedIn";
        toast.error(errorMessage);
      }
    }
  };

  const handleWordPressConnect = async (e: React.MouseEvent) => {
    e.preventDefault();

    const siteUrl = wpSiteUrl.trim();
    const username = wpUsername.trim();
    const appPassword = wpAppPassword.trim();

    if (!siteUrl) {
      toast.error("Site URL is required");
      return;
    }
    if (!username) {
      toast.error("Username is required");
      return;
    }
    if (!appPassword) {
      toast.error("Application Password is required");
      return;
    }

    try {
      await wordpressMutation.mutateAsync({
        siteUrl,
        username,
        applicationPassword: appPassword,
        ...(wpSiteName.trim() ? { siteName: wpSiteName.trim() } : {}),
      });
      toast.success("WordPress site connected successfully!");
      resetWpForm();
      setOpen(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to connect WordPress";
      toast.error(errorMessage);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      resetWpForm();
      setSelectedSource(null);
      setSearchQuery("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4 rounded-2xl">
        {wpStep === "select" ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl">Connect Blog Platform</DialogTitle>
              <DialogDescription>
                Select a publishing destination for your scheduled blogs.
              </DialogDescription>
            </DialogHeader>

            <form>
              <div className="mt-4">
                <Input
                  id="search-blog-platform"
                  placeholder="Search platforms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="mt-4 border rounded-xl overflow-hidden">
                {filteredOptions.length === 0 ? (
                  <div className="flex items-center justify-center p-8 text-zinc-500">
                    <p>No platforms found</p>
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-100">
                    {filteredOptions.map((option) => {
                      const isSelected = selectedSource?.id === option.id;
                      return (
                        <div
                          key={option.id}
                          onClick={() => setSelectedSource(option)}
                          className={`flex items-center gap-4 p-4 cursor-pointer transition-colors ${
                            isSelected ? "bg-blue-50/50" : "hover:bg-zinc-50"
                          } ${option.comingSoon ? "opacity-60 grayscale" : ""}`}
                        >
                          <div className="flex-shrink-0">
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                isSelected
                                  ? "border-blue-600 bg-blue-600"
                                  : "border-zinc-300"
                              }`}
                            >
                              {isSelected && (
                                <div className="w-2 h-2 rounded-full bg-white" />
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between flex-1">
                            <div className="flex items-center gap-3">
                              <option.icon
                                className="h-6 w-6 flex-shrink-0"
                                style={option.color ? { color: option.color } : undefined}
                              />
                              <span className="text-base font-medium text-zinc-800">
                                {option.name}
                              </span>
                            </div>
                            {option.comingSoon && (
                              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest bg-zinc-100 border border-zinc-200 px-2 py-1 rounded-full">
                                Coming Soon
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <DialogFooter className="mt-6 flex gap-3">
                <DialogClose asChild>
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  isLoading={isConnecting}
                  disabled={!selectedSource || isConnecting}
                  onClick={handleConnect}
                  type="button"
                  className="bg-zinc-900 hover:bg-zinc-800 text-white"
                >
                  {selectedSource?.comingSoon ? "Coming Soon" : isConnecting ? "Connecting..." : "Connect Platform"}
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={resetWpForm}
                  className="p-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 text-zinc-500" />
                </button>
                <div>
                  <DialogTitle className="text-xl flex items-center gap-2">
                    <FaWordpress className="w-6 h-6" style={{ color: "#21759b" }} />
                    Connect WordPress Site
                  </DialogTitle>
                  <DialogDescription className="mt-1">
                    Enter your WordPress site details and Application Password to connect.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <form className="mt-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-zinc-700 mb-1.5 block">
                  Site URL <span className="text-red-500">*</span>
                </label>
                <Input
                  value={wpSiteUrl}
                  onChange={(e) => setWpSiteUrl(e.target.value)}
                  placeholder="https://yourblog.com"
                  className="h-11"
                />
                <p className="text-xs text-zinc-400 mt-1">The full URL of your WordPress site</p>
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-700 mb-1.5 block">
                  WordPress Username <span className="text-red-500">*</span>
                </label>
                <Input
                  value={wpUsername}
                  onChange={(e) => setWpUsername(e.target.value)}
                  placeholder="your_wp_username"
                  className="h-11"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-700 mb-1.5 block">
                  Application Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={wpAppPassword}
                    onChange={(e) => setWpAppPassword(e.target.value)}
                    placeholder="xxxx xxxx xxxx xxxx xxxx"
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <a
                  href="https://make.wordpress.org/core/2020/11/05/application-passwords-integration-guide/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 mt-1.5"
                >
                  Where do I find my Application Password?
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-700 mb-1.5 block">
                  Site Name <span className="text-zinc-400 font-normal">(optional)</span>
                </label>
                <Input
                  value={wpSiteName}
                  onChange={(e) => setWpSiteName(e.target.value)}
                  placeholder="My Marketing Blog"
                  className="h-11"
                />
                <p className="text-xs text-zinc-400 mt-1">Defaults to the site domain if left empty</p>
              </div>

              <DialogFooter className="mt-6 flex gap-3">
                <Button variant="outline" type="button" onClick={resetWpForm}>
                  Back
                </Button>
                <Button
                  isLoading={wordpressMutation.isPending}
                  disabled={wordpressMutation.isPending}
                  onClick={handleWordPressConnect}
                  type="button"
                  className="bg-zinc-900 hover:bg-zinc-800 text-white"
                >
                  {wordpressMutation.isPending ? "Connecting..." : "Connect WordPress"}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
