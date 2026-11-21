import type { ComponentProps } from "react"
import { cn } from "cn"

import "./text-field.css"

function Textarea({
  className,
  embedded = false,
  ...props
}: ComponentProps<"textarea"> & { embedded?: boolean }) {
  return (
    <textarea
      data-slot="textarea"
      data-embedded={embedded || undefined}
      className={cn(
        "field-control w-full min-w-0",
        !embedded &&
          "field-surface min-h-16 border border-transparent px-3 py-2 text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
