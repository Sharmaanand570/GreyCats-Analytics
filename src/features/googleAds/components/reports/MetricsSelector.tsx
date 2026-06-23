import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface MetricsSelectorProps {
  selectedMetrics: string[];
  onChange: (metrics: string[]) => void;
}

const AVAILABLE_METRICS = [
  { id: "metrics.clicks", label: "Clicks" },
  { id: "metrics.impressions", label: "Impressions" },
  { id: "metrics.ctr", label: "CTR" },
  { id: "metrics.average_cpc", label: "Avg. CPC" },
  { id: "metrics.cost_micros", label: "Cost" },
  { id: "metrics.conversions", label: "Conversions" },
  { id: "metrics.conversions_value", label: "Conv. value" },
  { id: "metrics.cost_per_conversion", label: "Cost / conv." },
  { id: "metrics.conversion_rate", label: "Conv. rate" },
  { id: "metrics.interaction_rate", label: "Interaction rate" },
  { id: "metrics.interactions", label: "Interactions" },
  { id: "metrics.video_views", label: "Video views" },
  { id: "metrics.view_through_conversions", label: "View-through conv." }
];

export function MetricsSelector({ selectedMetrics, onChange }: MetricsSelectorProps) {
  const [search, setSearch] = useState("");
  
  const filteredMetrics = AVAILABLE_METRICS.filter(m => 
    m.label.toLowerCase().includes(search.toLowerCase())
  );

  const toggleMetric = (id: string) => {
    if (selectedMetrics.includes(id)) {
      onChange(selectedMetrics.filter(m => m !== id));
    } else {
      onChange([...selectedMetrics, id]);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-2 border-b border-slate-200">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input 
            placeholder="Search metrics..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          {filteredMetrics.map((metric) => (
            <div key={metric.id} className="flex items-center space-x-2">
              <Checkbox 
                id={metric.id} 
                checked={selectedMetrics.includes(metric.id)}
                onCheckedChange={() => toggleMetric(metric.id)}
              />
              <Label htmlFor={metric.id} className="text-sm font-normal text-slate-700 cursor-pointer">
                {metric.label}
              </Label>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
