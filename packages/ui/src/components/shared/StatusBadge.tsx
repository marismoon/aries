import type { ReactNode } from "react"

import { Badge } from "../ui/badge"
import { cn } from "../../lib/utils"

const tones = {
  neutral: { color: "--muted-foreground", background: "--muted" },
  success: { color: "--success", background: "--success-bg" },
  warning: { color: "--warning", background: "--warning-bg" },
  danger: { color: "--danger", background: "--danger-bg" },
  info: { color: "--info", background: "--info-bg" },
} as const

type StatusBadgeProps = {
  tone?: keyof typeof tones
  children: ReactNode
  className?: string
  /** Slow breathing dot for work that is still in progress. */
  pulse?: boolean
}

export function StatusBadge({
  tone = "neutral",
  children,
  className,
  pulse = false,
}: StatusBadgeProps) {
  const { color, background } = tones[tone]

  return (
    <Badge
      className={cn(
        "h-6 gap-1.5 rounded-full border-[color:var(--status-badge-edge,transparent)] px-2 text-xs font-medium",
        className
      )}
      style={{ color: `var(${color})`, backgroundColor: `var(${background})` }}
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-1.5 rounded-full bg-current",
          pulse && "status-pulse"
        )}
      />
      {children}
    </Badge>
  )
}
