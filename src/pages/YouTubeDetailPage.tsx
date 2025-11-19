import { useYouTubeChannel } from "@/features/YouTube/hooks/useYouTubeChannel";
import { useYouTubeSync } from "@/features/YouTube/hooks/useYouTubeSync";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, RefreshCw } from "lucide-react";
import { FaYoutube } from "react-icons/fa6";

function YouTubeDetailPage() {
  const { data: channelData, isLoading: isLoadingChannel, error: channelError } = useYouTubeChannel();
  const { mutateAsync: syncYouTube, isPending: isSyncing } = useYouTubeSync();

  const handleSync = async () => {
    try {
      await syncYouTube();
    } catch (error) {
      // Error is already handled in the hook with toast
      console.error("Sync error:", error);
    }
  };

  return (
    <div className="w-full h-full flex flex-col overflow-x-hidden bg-gradient-to-bl from-black via-zinc-950 to-zinc-800">
      <div className="w-full rounded-l-2xl overflow-hidden h-full my-4 bg-[#fdfdfd]">
        <div className="w-full h-full flex flex-col">
          {/* Header */}
          <div className="w-full h-[4.8em] bg-white border-b flex justify-between items-center px-5">
            <div className="flex items-center gap-3">
              <FaYoutube className="text-2xl text-red-600" />
              <span className="font-medium text-xl">YouTube Integration</span>
            </div>
          </div>

          {/* Content */}
          <div className="w-full px-5 py-6">
            {/* Channel Info Section */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Channel Information</CardTitle>
                <CardDescription>
                  Details about your connected YouTube channel
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingChannel ? (
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ) : channelError ? (
                  <div className="text-destructive">
                    <p className="font-medium">Failed to load channel information</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {channelError instanceof Error
                        ? channelError.message
                        : "An error occurred while fetching channel data"}
                    </p>
                  </div>
                ) : channelData?.channel ? (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">
                          {channelData.channel.title}
                        </h3>
                        <span className="px-2 py-1 text-xs font-medium rounded-md bg-green-50 text-green-700 border border-green-200">
                          Connected
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        @{channelData.channel.handle}
                      </p>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Channel ID:</span>{" "}
                        {channelData.channel.channelId}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground">
                    No channel information available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sync Button Section */}
            <Card>
              <CardHeader>
                <CardTitle>Data Sync</CardTitle>
                <CardDescription>
                  Manually sync your YouTube data to get the latest information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleSync}
                  disabled={isSyncing || isLoadingChannel}
                  className="w-full sm:w-auto"
                >
                  {isSyncing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Sync Now
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default YouTubeDetailPage;

