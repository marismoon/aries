import type { ComponentProps } from "react"

import { Card } from "../ui/card"
import { cn } from "../../lib/utils"

export function FrostCard({ className, ...props }: ComponentProps<"div">) {
  return (
    <Card
      className={cn(
        "surface gap-0 overflow-visible bg-transparent p-0 shadow-none ring-0",
        className
      )}
      {...props}
    />
  )
}
