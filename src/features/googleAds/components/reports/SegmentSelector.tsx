import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SegmentSelectorProps {
  selectedSegments: string[];
  onChange: (segments: string[]) => void;
}

const AVAILABLE_SEGMENTS = [
  { id: "segments.date", label: "Date" },
  { id: "segments.week", label: "Week" },
  { id: "segments.month", label: "Month" },
  { id: "segments.quarter", label: "Quarter" },
  { id: "segments.year", label: "Year" },
  { id: "segments.day_of_week", label: "Day of week" },
  { id: "segments.device", label: "Device" },
  { id: "segments.conversion_action_name", label: "Conversion action" },
  { id: "segments.conversion_action_category", label: "Conversion category" },
  { id: "segments.geo_target_city", label: "City" },
  { id: "segments.geo_target_region", label: "Region" },
  { id: "segments.geo_target_country", label: "Country" }
];

export function SegmentSelector({ selectedSegments, onChange }: SegmentSelectorProps) {
  const [search, setSearch] = useState("");
  
  const filteredSegments = AVAILABLE_SEGMENTS.filter(s => 
    s.label.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSegment = (id: string) => {
    if (selectedSegments.includes(id)) {
      onChange(selectedSegments.filter(s => s !== id));
    } else {
      onChange([...selectedSegments, id]);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-2 border-b border-slate-200">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input 
            placeholder="Search segments..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          {filteredSegments.map((seg) => (
            <div key={seg.id} className="flex items-center space-x-2">
              <Checkbox 
                id={seg.id} 
                checked={selectedSegments.includes(seg.id)}
                onCheckedChange={() => toggleSegment(seg.id)}
              />
              <Label htmlFor={seg.id} className="text-sm font-normal text-slate-700 cursor-pointer">
                {seg.label}
              </Label>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
