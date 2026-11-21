import type { ReactNode } from "react"

import { AppIcon, type AppIconComponent } from "../icons"
import { FrostCard } from "./FrostCard"
import { cn } from "../../lib/utils"

type MetricCardProps = {
  label: string
  value: ReactNode
  icon?: AppIconComponent
  description?: ReactNode
  children?: ReactNode
  className?: string
  featured?: boolean
  density?: "default" | "compact"
}

export function MetricCard({
  label,
  value,
  icon,
  description,
  children,
  className,
  featured = false,
  density = "default",
}: MetricCardProps) {
  const compact = density === "compact"

  return (
    <FrostCard
      className={cn(
        "min-w-0",
        compact ? "p-(--card-inset)" : "gap-3 p-(--card-inset)",
        className
      )}
    >
      <dl className="min-w-0">
        <dt
          className={cn(
            "flex items-center justify-between gap-2",
            compact
              ? "text-(length:--metric-label-size) leading-(--metric-label-leading) font-(number:--metric-label-weight)"
              : "min-h-8 text-sm font-medium text-muted-foreground"
          )}
        >
          {label}
          {icon && (
            <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
              <AppIcon icon={icon} size={16} aria-hidden="true" />
            </span>
          )}
        </dt>
        <dd
          className={cn(
            "break-words tabular-nums",
            compact
              ? "mt-1 text-(length:--metric-value-size) leading-(--metric-value-leading) font-(number:--metric-value-weight) tracking-(--metric-value-tracking)"
              : "mt-2 leading-tight font-semibold tracking-tight",
            !compact &&
              (featured
                ? "text-3xl sm:text-4xl"
                : "text-[clamp(1.35rem,2.1vw,1.85rem)]")
          )}
        >
          {value}
        </dd>
        {description && (
          <dd
            className={cn(
              compact
                ? "mt-1 text-(length:--metric-note-size) leading-(--metric-note-leading)"
                : "mt-1.5 text-xs",
              compact && featured
                ? "text-(--hero-muted)"
                : "text-muted-foreground"
            )}
          >
            {description}
          </dd>
        )}
      </dl>
      {children}
    </FrostCard>
  )
}
