"use client";

import { useNavigate } from "react-router-dom";
import { SiMeta, SiGoogleads } from "react-icons/si";
import { RiAdvertisementLine } from "react-icons/ri";
import PagesEmptyPlaceHolder from "@/components/PagesEmptyPlaceHolder";

type Platform = "meta-ads" | "google-ads";

const CONTENT: Record<
  Platform,
  {
    title: string;
    subtitle: string;
    header: string;
    subHeader: string;
    pointers: string[];
    buttonText: string;
    icon: React.ReactNode;
    gradientFrom: string;
    gradientTo: string;
    glow: string;
    smallIcon: React.ComponentType<{ className?: string }>;
    bigIcon: React.ComponentType<{ className?: string }>;
  }
> = {
  "meta-ads": {
    title: "Meta Ads",
    subtitle: "Coming Soon",
    header: "Meta Ads — Coming Soon",
    subHeader:
      "Manage, track and create your Meta ad campaigns — all without leaving GreyCats. Full campaign analytics, audience management and ad creation in one place.",
    pointers: [
      "Monitor spend, impressions, CTR and ROAS in real-time",
      "Create and publish Meta ad campaigns with our AI wizard",
      "Build custom and lookalike audiences from one hub",
    ],
    buttonText: "Coming Soon",
    icon: <SiMeta className="w-8 h-8 text-white" />,
    gradientFrom: "#0866FF",
    gradientTo: "#0052cc",
    glow: "bg-blue-500",
    smallIcon: RiAdvertisementLine as any,
    bigIcon: SiMeta as any,
  },
  "google-ads": {
    title: "Google Ads",
    subtitle: "Coming Soon",
    header: "Google Ads — Coming Soon",
    subHeader:
      "Track your Google Search, Display and Performance Max campaigns with spend, CTR, CPC and ROAS insights — all in one unified dashboard.",
    pointers: [
      "Monitor campaign spend and ROAS in real-time",
      "Filter and drill into individual campaign performance",
      "Pause or adjust campaigns without leaving GreyCats",
    ],
    buttonText: "Coming Soon",
    icon: <SiGoogleads className="w-8 h-8 text-white" />,
    gradientFrom: "#4285F4",
    gradientTo: "#2563eb",
    glow: "bg-blue-400",
    smallIcon: SiGoogleads as any,
    bigIcon: SiGoogleads as any,
  },
};

interface AdsManagerComingSoonPageProps {
  activeTab?: Platform;
}

export default function AdsManagerComingSoonPage({
  activeTab = "meta-ads",
}: AdsManagerComingSoonPageProps) {
  const navigate = useNavigate();
  const c = CONTENT[activeTab];

  return (
    <div className="w-full h-full flex flex-col overflow-x-hidden bg-gradient-to-bl from-black via-zinc-950 to-zinc-800">
      <div className="w-full rounded-l-2xl overflow-hidden h-full my-4 bg-[#fdfdfd]">
        <div className="w-full h-full flex flex-col">

          {/* ── Header bar ── */}
          <div className="w-full h-[4.8em] border-b flex items-center justify-between px-8 bg-white/80 backdrop-blur-md sticky top-0 z-20 border-slate-200/60 shadow-sm rounded-t-[32px]">
            <div className="flex items-center gap-4">
              {/* Platform icon */}
              <div className="relative group">
                <div className={`absolute inset-0 blur-xl opacity-20 group-hover:opacity-30 transition-opacity ${c.glow}`} />
                <div
                  className="relative p-2.5 rounded-xl shadow-lg ring-1 ring-white/20"
                  style={{
                    background: `linear-gradient(135deg, ${c.gradientFrom}, ${c.gradientTo})`,
                  }}
                >
                  {c.icon}
                </div>
              </div>

              {/* Title */}
              <div>
                <span className="font-semibold text-xl text-slate-900">{c.title}</span>
                <span className="ml-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">
                  Coming Soon
                </span>
              </div>
            </div>

            {/* Back link */}
            <button
              onClick={() => navigate(-1)}
              className="text-xs font-medium text-zinc-400 hover:text-zinc-700 transition-colors"
            >
              ← Back
            </button>
          </div>

          {/* ── Content ── */}
          <div className="flex flex-1 justify-center px-8 items-center">
            <PagesEmptyPlaceHolder
              Header={c.header}
              subHeader={c.subHeader}
              pointers={c.pointers}
              smallIcon={c.smallIcon}
              bigIcon={c.bigIcon}
              buttonText={c.buttonText}
            />
          </div>

        </div>
      </div>
    </div>
  );
}
