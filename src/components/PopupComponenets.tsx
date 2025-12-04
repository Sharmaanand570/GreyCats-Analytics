"use client";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import type { ReactNode } from "react";

interface PopupComponentsProps {
  trigger: ReactNode;
  content: ReactNode;
}

export function PopupComponents({ trigger, content }: PopupComponentsProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="z-[9999]  rounded-md shadow-lg p-3">
        {content}
      </PopoverContent>
    </Popover>
  );
}
