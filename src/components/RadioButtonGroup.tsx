import * as React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

export function RadioButtonGroup() {
  const [value, setValue] = React.useState("daily");

  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(val) => val && setValue(val)}
      className="flex gap-2"
    >
      <ToggleGroupItem
        value="daily"
        className={cn(
          "px-3 py-1 rounded-[0.6rem] border lg:text-xs font-medium transition-colors",
          value === "daily"
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-transparent hover:bg-muted"
        )}
      >
        Live Data
      </ToggleGroupItem>

      {/* <ToggleGroupItem
        value="monthly"
        className={cn(
          "px-3 py-1 rounded-[0.6rem] border lg:text-xs font-medium transition-colors",
          value === "monthly"
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-transparent hover:bg-muted"
        )}
      >
        Sample Data
      </ToggleGroupItem> */}
    </ToggleGroup>
  );
}
