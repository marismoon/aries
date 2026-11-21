import type { ReactNode } from "react"

import { AppIcon, SolarInbox, type AppIconComponent } from "../icons"
import { cn } from "../../lib/utils"

type EmptyStateProps = {
  title: string
  description?: string
  icon?: AppIconComponent
  action?: ReactNode
  className?: string
}

export function EmptyState({
  title,
  description,
  icon = SolarInbox,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "grid justify-items-center gap-2 px-5 py-10 text-center",
        className
      )}
    >
      <div className="mb-1 grid size-12 place-items-center rounded-2xl bg-accent text-accent-foreground">
        <AppIcon icon={icon} aria-hidden="true" />
      </div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
