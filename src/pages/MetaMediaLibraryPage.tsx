import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiMeta } from "react-icons/si";
import { Copy, Film, Images, Upload } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useMetaAccounts } from "@/features/meta/hooks/useMetaData";
import { useAdImages, useAdVideos, useUploadAdMedia } from "@/features/meta/hooks/useMetaMedia";
import { useClients } from "@/hooks/useClients";
import { cn } from "@/lib/utils";

// Normalize act_ prefix — Meta returns it inconsistently across endpoints.
const withActPrefix = (id: string) =>
  id.startsWith("act_") ? id : `act_${id}`;

const formatDuration = (secs: number) => {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
};

function MetaMediaLibraryPage() {
  const navigate = useNavigate();
  const { clientId: clientIdParam } = useParams<{ clientId?: string }>();
  const clientId = clientIdParam ? Number(clientIdParam) : null;

  const { data: clientsData } = useClients();
  const clients = clientsData || [];

  const { data: accountsData } = useMetaAccounts(clientId as number);
  const adAccounts = accountsData?.adAccounts ?? [];

  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const activeAccountId =
    selectedAccountId || (adAccounts.length > 0 ? adAccounts[0].accountId : "");

  // Auto-select single account so the library loads without user action.
  useEffect(() => {
    if (adAccounts.length === 1 && !selectedAccountId) {
      setSelectedAccountId(adAccounts[0].accountId);
    }
  }, [adAccounts, selectedAccountId]);

  const normalizedAccountId = activeAccountId ? withActPrefix(activeAccountId) : null;

  const { data: images, isLoading: isLoadingImages } = useAdImages(
    clientId,
    normalizedAccountId
  );
  const { data: videos, isLoading: isLoadingVideos } = useAdVideos(
    clientId,
    normalizedAccountId
  );

  const { mutateAsync: uploadMut } = useUploadAdMedia();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("images");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !clientId || !normalizedAccountId) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      const result = await uploadMut({
        clientId,
        accountId: normalizedAccountId,
        file,
        onProgress: setUploadProgress,
      });
      // Switch to the correct tab based on what was uploaded.
      setActiveTab(result.mime_type.startsWith("video/") ? "videos" : "images");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#fafafa]">
      {/* Hidden file input shared across all upload triggers */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-20 border-slate-200/60 shadow-sm px-8 py-6">
        <div className="flex flex-col gap-2">
          <Breadcrumb>
            <BreadcrumbList className="text-xs font-medium text-slate-400">
              <BreadcrumbItem>
                <BreadcrumbLink to="/data-sources">Data Sources</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink
                  to={clientId ? `/data-sources/meta-ads/${clientId}` : "/data-sources/meta-ads"}
                >
                  Meta Ads
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-slate-900 font-bold">Media Library</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg">
                <Images className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                  Media Library
                  <SiMeta className="w-4 h-4 text-[#0866FF]" />
                </h1>
                <p className="text-sm text-slate-500 font-medium">
                  Browse and upload ad images and videos.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Select
                value={clientId?.toString() ?? ""}
                onValueChange={(v) => navigate(`/data-sources/meta-ads/media/${v}`)}
              >
                <SelectTrigger className="h-11 w-[220px] rounded-xl">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c: { id: number; name: string }) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {adAccounts.length > 1 && (
                <Select value={activeAccountId} onValueChange={setSelectedAccountId}>
                  <SelectTrigger className="h-11 w-[220px] rounded-xl">
                    <SelectValue placeholder="Select ad account" />
                  </SelectTrigger>
                  <SelectContent>
                    {adAccounts.map((a) => (
                      <SelectItem key={a.accountId} value={a.accountId}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={!normalizedAccountId || uploading}
                className="h-11 rounded-xl gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Upload className="w-4 h-4" />
                Upload
              </Button>
            </div>
          </div>

          {uploading && (
            <div className="mt-3 space-y-1">
              <p className="text-xs text-slate-500 font-medium">
                Uploading… {uploadProgress}%
              </p>
              <Progress value={uploadProgress} className="h-1.5 rounded-full" />
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {!clientId ? (
          <Card className="rounded-2xl border-amber-100 bg-amber-50 p-6 text-sm text-amber-800">
            Select a client to browse the media library.
          </Card>
        ) : adAccounts.length === 0 ? (
          <Card className="rounded-2xl border-amber-100 bg-amber-50 p-6 text-sm text-amber-800">
            No ad accounts connected for this client.
          </Card>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4 rounded-xl bg-slate-100">
              <TabsTrigger value="images" className="rounded-lg gap-2">
                <Images className="w-4 h-4" />
                Images
              </TabsTrigger>
              <TabsTrigger value="videos" className="rounded-lg gap-2">
                <Film className="w-4 h-4" />
                Videos
              </TabsTrigger>
            </TabsList>

            {/* Images */}
            <TabsContent value="images">
              {isLoadingImages ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-square rounded-xl" />
                  ))}
                </div>
              ) : !images || images.length === 0 ? (
                <Card className="rounded-2xl border-dashed border-slate-200 p-12 text-center">
                  <Images className="w-8 h-8 mx-auto text-slate-300 mb-3" />
                  <p className="text-sm text-slate-500">
                    No images uploaded to this ad account yet.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4 rounded-xl gap-2"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={!normalizedAccountId}
                  >
                    <Upload className="w-4 h-4" />
                    Upload your first image
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {images.map((img) => (
                    <button
                      key={img.hash}
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(img.hash);
                        toast.success("Hash copied — paste into wizard");
                      }}
                      title={`${img.name ?? img.hash}\n${img.width}×${img.height}\nClick to copy hash`}
                      className="group relative aspect-square rounded-xl overflow-hidden border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all bg-slate-50"
                    >
                      <img
                        src={img.thumbnail_url ?? img.url}
                        alt={img.name ?? img.hash}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                        <Copy className="w-4 h-4 text-white" />
                        <span className="text-[9px] text-white font-bold text-center">
                          Copy hash
                        </span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-1.5 py-1 text-[9px] text-white font-medium truncate opacity-0 group-hover:opacity-100 transition-opacity">
                        {img.width}×{img.height}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Videos */}
            <TabsContent value="videos">
              {isLoadingVideos ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-square rounded-xl" />
                  ))}
                </div>
              ) : !videos || videos.length === 0 ? (
                <Card className="rounded-2xl border-dashed border-slate-200 p-12 text-center">
                  <Film className="w-8 h-8 mx-auto text-slate-300 mb-3" />
                  <p className="text-sm text-slate-500">
                    No videos uploaded to this ad account yet.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4 rounded-xl gap-2"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={!normalizedAccountId}
                  >
                    <Upload className="w-4 h-4" />
                    Upload a video
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {videos.map((vid) => (
                    <button
                      key={vid.video_id}
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(vid.video_id);
                        toast.success("Video ID copied — paste into wizard");
                      }}
                      title={`${vid.name ?? vid.video_id}\nClick to copy Video ID`}
                      className={cn(
                        "group relative aspect-square rounded-xl overflow-hidden border hover:shadow-md transition-all bg-slate-100",
                        vid.status === "encoding"
                          ? "border-amber-300"
                          : "border-slate-200 hover:border-indigo-400"
                      )}
                    >
                      {vid.thumbnail_url ? (
                        <img
                          src={vid.thumbnail_url}
                          alt={vid.name ?? vid.video_id}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Film className="w-8 h-8 text-slate-300" />
                        </div>
                      )}

                      {/* Status badge for in-progress encoding */}
                      {vid.status && vid.status !== "ready" && (
                        <div className="absolute top-1.5 right-1.5">
                          <Badge
                            className={cn(
                              "text-[9px] px-1.5 py-0",
                              vid.status === "encoding"
                                ? "bg-amber-500 text-white border-0"
                                : vid.status === "error"
                                  ? "bg-rose-500 text-white border-0"
                                  : "bg-slate-500 text-white border-0"
                            )}
                          >
                            {vid.status}
                          </Badge>
                        </div>
                      )}

                      {/* Duration overlay */}
                      {vid.duration !== undefined && (
                        <div className="absolute bottom-1.5 right-1.5 bg-black/70 text-white text-[9px] font-mono px-1 rounded">
                          {formatDuration(vid.duration)}
                        </div>
                      )}

                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                        <Copy className="w-4 h-4 text-white" />
                        <span className="text-[9px] text-white font-bold">Copy ID</span>
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-1.5 py-1 text-[9px] text-white font-medium truncate opacity-0 group-hover:opacity-100 transition-opacity">
                        {vid.created_time
                          ? format(new Date(vid.created_time), "MMM d, yyyy")
                          : vid.video_id}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

export default MetaMediaLibraryPage;
