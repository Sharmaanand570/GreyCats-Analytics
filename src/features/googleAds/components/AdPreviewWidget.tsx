  // @ts-expect-error unused variable
import React from "react";
import { MoreVertical } from "lucide-react";

interface AdPreviewWidgetProps {
  headlines: string[];
  descriptions: string[];
  finalUrl: string;
  path1?: string;
  path2?: string;
  businessName?: string;
  isMobile?: boolean;
}

export default function AdPreviewWidget({ 
  headlines, 
  descriptions, 
  finalUrl, 
  path1, 
  path2,
  businessName = "Your Business",
  isMobile = true
}: AdPreviewWidgetProps) {

  // Process URL
  const displayUrl = finalUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const finalDisplayUrl = `${displayUrl}${path1 ? ` / ${path1}` : ''}${path2 ? ` / ${path2}` : ''}`;

  // Build headline string (up to 3 headlines separated by |)
  const validHeadlines = headlines.filter(h => h.trim().length > 0);
  const headlineString = validHeadlines.slice(0, 3).join(" | ") || "Enter your headlines";

  // Build description string (up to 2 descriptions)
  const validDescriptions = descriptions.filter(d => d.trim().length > 0);
  const descriptionString = validDescriptions.slice(0, 2).join(" ") || "Enter a description for your ad.";

  return (
    <div className={`bg-white border border-slate-200 rounded-lg shadow-sm p-4 ${isMobile ? 'max-w-[360px]' : 'max-w-[600px]'} font-sans`}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-400 text-xs shrink-0">
          {businessName.charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-col overflow-hidden">
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] font-bold text-slate-800 truncate">{businessName}</span>
          </div>
          <div className="flex items-center text-[12px] text-slate-800">
            <span className="font-bold pr-1">Sponsored</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-500 pl-1 truncate">{finalDisplayUrl || 'example.com'}</span>
          </div>
        </div>
        <div className="ml-auto p-1 text-slate-500">
          <MoreVertical className="w-4 h-4" />
        </div>
      </div>
      
      <div className="mb-1">
        <h3 className="text-[18px] leading-[22px] text-[#1a0dab] hover:underline cursor-pointer truncate whitespace-normal" style={{ wordBreak: 'break-word' }}>
          {headlineString}
        </h3>
      </div>
      
      <div className="text-[14px] leading-[20px] text-[#4d5156] line-clamp-3">
        {descriptionString}
      </div>
    </div>
  );
}
