import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Loader2, RefreshCw } from "lucide-react";
import { useAdPreview } from "@/features/meta/hooks/useMetaEstimates";
import type { WizardState } from "./types";

// Ad format options — Meta's `ad_format` enum. We expose the most common ones
// so the user can preview the same creative across surfaces.
const AD_FORMAT_OPTIONS = [
  { value: "DESKTOP_FEED_STANDARD", label: "Facebook Desktop Feed" },
  { value: "MOBILE_FEED_STANDARD", label: "Facebook Mobile Feed" },
  { value: "INSTAGRAM_STANDARD", label: "Instagram Feed" },
  { value: "INSTAGRAM_STORY", label: "Instagram Stories" },
  { value: "INSTAGRAM_REELS", label: "Instagram Reels" },
  { value: "FACEBOOK_STORY_MOBILE", label: "Facebook Stories" },
  { value: "RIGHT_COLUMN_STANDARD", label: "Right Column" },
  { value: "AUDIENCE_NETWORK_OUTSTREAM_VIDEO", label: "Audience Network Video" },
];

type Props = {
  form: WizardState;
  adId?: string;          // when editing an existing ad, fetch its real preview
};

export function AdPreviewPanel({ form, adId }: Props) {
  const [adFormat, setAdFormat] = useState("MOBILE_FEED_STANDARD");
  const { mutate, data, isPending, isError, error, reset } = useAdPreview();

  const handlePreview = () => {
    reset();
    // For new ads (no adId), send the creative spec assembled from the wizard.
    // Backend builds a temp preview. For existing ads we let Meta render the
    // live creative — more accurate but only available in edit mode.
    if (adId) {
      mutate({ adId, adFormat, pagePageId: form.campaign.pageId });
    } else {
      mutate({
        adFormat,
        pagePageId: form.campaign.pageId,
        creativeSpec: {
          adType: form.ad.format,
          adText: form.ad.primaryTexts[0] ?? "",
          adHeadline: form.ad.headlines[0] ?? "",
          description: form.ad.descriptions[0] ?? "",
          adLink: form.ad.websiteUrl,
          imageUrl: form.ad.images[0] ?? "",
          ctaButton: form.ad.callToAction,
          videoUrl: form.ad.videos[0] ?? "",
          videoThumbnailUrl: form.ad.videoThumbnailUrl,
          carouselCards: form.ad.carouselCards,
        },
      });
    }
  };

  return (
    <Card className="rounded-[20px] border-slate-100 p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
            <Eye className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">Ad Preview</h3>
            <p className="text-xs text-slate-500">See how the ad renders on a real surface.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={adFormat} onValueChange={setAdFormat}>
            <SelectTrigger className="h-9 w-[200px] rounded-lg border-slate-200 bg-white text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AD_FORMAT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handlePreview}
            size="sm"
            disabled={isPending}
            className="h-9 rounded-lg gap-1.5 bg-slate-900 hover:bg-slate-800"
          >
            {isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            {data ? "Refresh" : "Generate"}
          </Button>
        </div>
      </div>

      {isError && (
        <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error?.message || "Couldn't load preview."}
        </div>
      )}

      {!isPending && !data && !isError && (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
          Click "Generate" to render this ad at the selected surface.
        </div>
      )}

      {data?.[0]?.body && (
        <div
          className="rounded-xl border border-slate-100 bg-white overflow-hidden flex justify-center p-3"
          // Meta returns a full <iframe> HTML string. Embed it verbatim so
          // the rendered preview matches what Ads Manager shows.
          // Safe because backend sanitizes — the response is a wrapped iframe
          // pointing at facebook.com, not arbitrary HTML.
          dangerouslySetInnerHTML={{ __html: data[0].body }}
        />
      )}
    </Card>
  );
}
