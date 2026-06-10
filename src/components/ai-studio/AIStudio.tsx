import { useState } from "react";
import { cn } from "@/lib/utils";
import { Sparkles, Palette, Type, Image as ImageIcon, Target, Shield, BookOpen, MessageSquare } from "lucide-react";
import { BrandProfileView } from "./BrandProfileView";
import { CreativeSuiteView } from "./CreativeSuiteView";

interface Props {
  clientId: number;
}

export default function AIStudio({ clientId }: Props) {
  const [activeTab, setActiveTab] = useState<string>("brand-identity");

  const navGroups = [
    {
      label: "Brand Setup",
      items: [
        { id: "brand-identity", label: "Identity & Strategy", icon: Target },
        { id: "brand-voice", label: "Voice & Style", icon: MessageSquare },
        { id: "brand-guidelines", label: "Guidelines", icon: Shield },
        { id: "brand-knowledge", label: "Knowledge Base", icon: BookOpen },
      ]
    },
    {
      label: "Creative Suite",
      items: [
        { id: "creative-captions", label: "Generate Captions", icon: Type },
        { id: "creative-images", label: "Generate Images", icon: ImageIcon },
        { id: "creative-gallery", label: "Asset Gallery", icon: Palette },
      ]
    }
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-[700px] w-full bg-white rounded-[24px] border border-zinc-200/60 shadow-xl shadow-zinc-200/20 overflow-hidden">
      {/* Sidebar */}
      <div className="w-full md:w-[260px] border-r border-zinc-100 bg-zinc-50/50 flex flex-col p-4 shrink-0">
        <div className="flex items-center gap-3 px-3 py-4 mb-4">
          <div className="w-10 h-10 rounded-[14px] bg-zinc-900 flex items-center justify-center shadow-md">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-900 tracking-tight">AI Studio</h2>
            <p className="text-[11px] font-medium text-zinc-500">Train & Generate</p>
          </div>
        </div>

        <div className="space-y-6 flex-1 overflow-y-auto pr-2 scrollbar-thin">
          {navGroups.map((group) => (
            <div key={group.label}>
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-3 px-3">
                {group.label}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                      activeTab === item.id
                        ? "bg-zinc-200/60 text-zinc-900 shadow-none font-bold"
                        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                    )}
                  >
                    <item.icon className={cn("h-4 w-4", activeTab === item.id ? "text-zinc-900" : "text-zinc-400")} />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white relative flex flex-col min-h-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8 relative z-10">
          <div className={cn(activeTab.startsWith("brand-") ? "block" : "hidden")}>
            <BrandProfileView clientId={clientId} activeSubTab={activeTab.startsWith("brand-") ? activeTab.replace("brand-", "") : "identity"} />
          </div>
          <div className={cn(activeTab.startsWith("creative-") ? "block" : "hidden")}>
            <CreativeSuiteView clientId={clientId} activeSubTab={activeTab.startsWith("creative-") ? activeTab.replace("creative-", "") : "captions"} />
          </div>
        </div>
      </div>
    </div>
  );
}
