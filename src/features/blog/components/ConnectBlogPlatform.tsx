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
import { SiLinkedin } from "react-icons/si";
import { FaWordpress, FaReddit } from "react-icons/fa6";
import { SiBlogger } from "react-icons/si";

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
    comingSoon: true,
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
  const [selectedSource, setSelectedSource] = useState<BlogPlatformOption | null>(
    null
  );

  const linkedinMutation = useLinkedinOrgConnect();
  const isConnecting = linkedinMutation.isPending;

  const filteredOptions = React.useMemo(() => {
    if (!searchQuery.trim()) return blogPlatformOptions;
    return blogPlatformOptions.filter((option) =>
      option.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

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

    if (selectedSource.id === "linkedin") {
      try {
        const response = await linkedinMutation.mutateAsync();
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4 rounded-2xl">
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
      </DialogContent>
    </Dialog>
  );
}
