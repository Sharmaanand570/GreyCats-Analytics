import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface DimensionsSelectorProps {
  selectedDimensions: string[];
  onChange: (dimensions: string[]) => void;
}

const AVAILABLE_DIMENSIONS = [
  { id: "campaign.id", label: "Campaign ID" },
  { id: "campaign.name", label: "Campaign" },
  { id: "campaign.status", label: "Campaign status" },
  { id: "ad_group.id", label: "Ad group ID" },
  { id: "ad_group.name", label: "Ad group" },
  { id: "ad_group.status", label: "Ad group status" },
  { id: "ad_group_ad.ad.id", label: "Ad ID" },
  { id: "ad_group_ad.ad.type", label: "Ad type" },
  { id: "ad_group_criterion.criterion_id", label: "Keyword ID" },
  { id: "ad_group_criterion.keyword.text", label: "Keyword" },
  { id: "ad_group_criterion.keyword.match_type", label: "Match type" },
  { id: "customer.descriptive_name", label: "Account name" },
  { id: "customer.currency_code", label: "Currency" }
];

export function DimensionsSelector({ selectedDimensions, onChange }: DimensionsSelectorProps) {
  const [search, setSearch] = useState("");
  
  const filteredDimensions = AVAILABLE_DIMENSIONS.filter(d => 
    d.label.toLowerCase().includes(search.toLowerCase())
  );

  const toggleDimension = (id: string) => {
    if (selectedDimensions.includes(id)) {
      onChange(selectedDimensions.filter(d => d !== id));
    } else {
      onChange([...selectedDimensions, id]);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-2 border-b border-slate-200">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input 
            placeholder="Search dimensions..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          {filteredDimensions.map((dim) => (
            <div key={dim.id} className="flex items-center space-x-2">
              <Checkbox 
                id={dim.id} 
                checked={selectedDimensions.includes(dim.id)}
                onCheckedChange={() => toggleDimension(dim.id)}
              />
              <Label htmlFor={dim.id} className="text-sm font-normal text-slate-700 cursor-pointer">
                {dim.label}
              </Label>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
