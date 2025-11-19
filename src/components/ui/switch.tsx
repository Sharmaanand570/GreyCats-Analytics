import * as React from "react"
import { cn } from "@/lib/utils"

type SwitchProps = React.ComponentProps<"input">

function Switch({ className, ...props }: SwitchProps) {
  return (
    <label className="inline-flex items-center gap-3 cursor-pointer">
      <input
        type="checkbox"
        className={cn("sr-only peer", className)}
        {...props}
      />
      <div className="peer h-5 w-9 rounded-full bg-gray-200 transition after:content-[''] after:block after:h-4 after:w-4 after:rounded-full after:bg-white after:translate-x-[2px] after:transition peer-checked:bg-black peer-checked:after:translate-x-[18px]" />
    </label>
  )
}

export { Switch }












