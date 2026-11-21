import * as React from "react"
import { cn } from "cn"

import "./text-field.css"

const controlSizes = {
  default: "h-(--control-size)",
  dense: "h-(--control-size-dense)",
  compact: "h-(--control-size-compact)",
} as const

function Input({
  className,
  type,
  controlSize = "dense",
  embedded = false,
  ...props
}: React.ComponentProps<"input"> & {
  controlSize?: keyof typeof controlSizes
  embedded?: boolean
}) {
  return (
    <input
      type={type}
      data-slot="input"
      data-embedded={embedded || undefined}
      className={cn(
        "field-control w-full min-w-0 border border-transparent px-3 py-1 text-base file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground md:text-sm",
        !embedded && "field-surface",
        controlSizes[controlSize],
        className
      )}
      {...props}
    />
  )
}

export { Input }
