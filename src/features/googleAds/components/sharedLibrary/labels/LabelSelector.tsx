import { useState, useMemo } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Tag, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
  // @ts-expect-error unused variable
import type { GoogleAdsLabel } from "../../../types/googleAds.types";
import { useLabels } from "../../../hooks/useCampaignManagement";
import { LabelBadge } from "./LabelBadge";
import { cn } from "@/lib/utils";

interface LabelSelectorProps {
  clientId: number;
  selectedLabelIds: string[];
  onSelect: (labelId: string) => void;
  onRemove: (labelId: string) => void;
}

export function LabelSelector({ clientId, selectedLabelIds, onSelect, onRemove }: LabelSelectorProps) {
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useLabels(clientId);
  const labels = useMemo(() => data?.labels ?? [], [data?.labels]);

  const selectedLabels = useMemo(() => {
    return labels.filter(l => selectedLabelIds.includes(l.id));
  }, [labels, selectedLabelIds]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed flex gap-2">
          <Tag className="w-3.5 h-3.5 text-slate-500" />
          {selectedLabels.length > 0 ? (
            <div className="flex items-center gap-1">
              {selectedLabels.slice(0, 2).map(l => (
                <LabelBadge key={l.id} label={l} />
              ))}
              {selectedLabels.length > 2 && (
                <span className="text-xs text-slate-500 ml-1">+{selectedLabels.length - 2}</span>
              )}
            </div>
          ) : (
            <span className="text-slate-500 font-normal">Add label</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search labels..." />
          <CommandList>
            <CommandEmpty>No labels found.</CommandEmpty>
            <CommandGroup>
              {isLoading ? (
                <CommandItem disabled>Loading...</CommandItem>
              ) : (
                labels.map((label) => {
                  const isSelected = selectedLabelIds.includes(label.id);
                  return (
                    <CommandItem
                      key={label.id}
                      onSelect={() => {
                        if (isSelected) {
                          onRemove(label.id);
                        } else {
                          onSelect(label.id);
                        }
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <LabelBadge label={label} />
                    </CommandItem>
                  );
                })
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
