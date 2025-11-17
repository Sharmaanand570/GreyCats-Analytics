"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import { ChevronsUpDown, Check } from "lucide-react";

const OPTIONS = [
  { id: "react", label: "React" },
  { id: "nextjs", label: "Next.js" },
  { id: "vue", label: "Vue" },
  { id: "angular", label: "Angular" },
];

export function CheckBoxInput() {
  const [selected, setSelected] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const selectOption = (id: string) => {
    setSelected(id);
    setOpen(false); // close dropdown after selecting
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between"
        >
          {selected
            ? OPTIONS.find((opt) => opt.id === selected)?.label
            : "Select option"}
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="lg:w-[300px] p-0 bg-white">
        <Command>
          <CommandGroup>
            {OPTIONS.map((option) => {
              const isSelected = selected === option.id;

              return (
                <CommandItem
                  key={option.id}
                  onSelect={() => selectOption(option.id)}
                  className="cursor-pointer flex items-center gap-2"
                >
                  <Check
                    className={`h-4 w-4 ${
                      isSelected ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  {option.label}
                </CommandItem>
              );
            })}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
export default CheckBoxInput;