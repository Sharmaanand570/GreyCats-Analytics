import { Tag } from "lucide-react";
import type { GoogleAdsLabel } from "../../../types/googleAds.types";
import { cn } from "@/lib/utils";

interface LabelBadgeProps {
  label: GoogleAdsLabel;
  className?: string;
  onRemove?: () => void;
}

export function LabelBadge({ label, className, onRemove }: LabelBadgeProps) {
  const bgColor = label.textLabel?.backgroundColor || "#e2e8f0";
  
  // Quick helper to determine text color based on bg brightness
  const getContrastYIQ = (hexcolor: string) => {
    hexcolor = hexcolor.replace("#", "");
    const r = parseInt(hexcolor.substr(0, 2), 16);
    const g = parseInt(hexcolor.substr(2, 2), 16);
    const b = parseInt(hexcolor.substr(4, 2), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? 'black' : 'white';
  };

  const textColor = getContrastYIQ(bgColor);

  return (
    <div 
      className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium max-w-[200px] truncate", className)}
      style={{ backgroundColor: bgColor, color: textColor }}
      title={label.textLabel?.description || label.name}
    >
      <Tag className="w-3 h-3 shrink-0" />
      <span className="truncate">{label.name}</span>
      {onRemove && (
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 hover:opacity-70 focus:outline-none shrink-0"
        >
          &times;
        </button>
      )}
    </div>
  );
}
