import * as React from "react"
import { cn } from "@/lib/utils"

interface SelectProps {
  children: React.ReactNode
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  className?: string
  disabled?: boolean
}

const Select = ({ children, value, defaultValue, onValueChange, className, disabled }: SelectProps) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue || value || "")

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value
    setInternalValue(newValue)
    onValueChange?.(newValue)
  }

  const currentValue = value !== undefined ? value : internalValue

  // Extract SelectTrigger and SelectContent from children
  let trigger: React.ReactElement | null = null
  let content: React.ReactElement | null = null

  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child)) {
      if (child.type === SelectTrigger) {
        trigger = child
      } else if (child.type === SelectContent) {
        content = child
      }
    }
  })

  // Get options from SelectContent
  const options: React.ReactElement[] = []
  if (content && React.isValidElement(content)) {
    React.Children.forEach((content as any).props.children, (child) => {
      if (React.isValidElement(child) && child.type === SelectItem) {
        options.push(child)
      }
    })
  }

  // Get placeholder from SelectValue if present
  let placeholder = ""
  if (trigger && React.isValidElement(trigger)) {
    React.Children.forEach((trigger as any).props.children, (child) => {
      if (React.isValidElement(child) && child.type === SelectValue) {
        placeholder = (child as any).props.placeholder || ""
      }
    })
  }

  return (
    <select
      value={currentValue}
      onChange={handleChange}
      className={cn(
        "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        (trigger as any)?.props?.className,
        className
      )}
      disabled={disabled}
    >
      {placeholder && !currentValue && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option, idx) => (
        <option key={idx} value={(option as any).props.value}>
          {(option as any).props.children}
        </option>
      ))}
    </select>
  )
}

const SelectTrigger = ({ children, className, ...props }: React.ComponentProps<"div">) => {
  return <div className={className} {...props}>{children}</div>
}
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  return <>{placeholder}</>
}
SelectValue.displayName = "SelectValue"

const SelectContent = ({ children, className: _className }: { children: React.ReactNode; className?: string }) => {
  return <>{children}</>
}
SelectContent.displayName = "SelectContent"

const SelectItem = ({ children, value, ...props }: React.ComponentProps<"option">) => {
  return <option value={value} {...props}>{children}</option>
}
SelectItem.displayName = "SelectItem"

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
}
