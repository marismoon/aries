"use client"

import type { ReactNode } from "react"
import { cn } from "cn"
import { intFmt } from "../chart-formatters"

export interface TooltipRow {
  color: string
  label: string
  value: string | number
}

export interface TooltipContentProps {
  title?: string
  rows: TooltipRow[]
  /** Optional additional content (e.g., markers) */
  children?: ReactNode
}

export interface TooltipHeaderProps {
  children: ReactNode
  className?: string
}

/**
 * Aries-proportioned tooltip header: 12px semibold title separated from body
 * by a subtle hairline divider.
 */
export function TooltipHeader({ children, className }: TooltipHeaderProps) {
  return (
    <div
      className={cn(
        "border-b border-(--border-subtle) px-3 py-1.5 text-left text-xs leading-snug font-semibold tracking-tight text-chart-tooltip-foreground",
        className
      )}
    >
      {children}
    </div>
  )
}

TooltipHeader.displayName = "TooltipHeader"

export function TooltipContent({ title, rows, children }: TooltipContentProps) {
  const hasBody = rows.length > 0 || Boolean(children)
  return (
    <div>
      {title && <TooltipHeader>{title}</TooltipHeader>}
      {hasBody && (
        <div className="px-3 py-2">
          {rows.length > 0 && (
            <div className="space-y-1.5">
              {rows.map((row) => (
                <div
                  className="flex items-center justify-between gap-5"
                  key={`${row.label}-${row.color}`}
                >
                  <div className="flex min-w-0 items-center gap-1.5">
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: row.color }}
                    />
                    <span className="truncate text-xs text-chart-tooltip-muted">
                      {row.label}
                    </span>
                  </div>
                  <span className="shrink-0 text-right text-xs font-semibold text-chart-tooltip-foreground tabular-nums financial-number">
                    {typeof row.value === "number"
                      ? intFmt(row.value)
                      : row.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {children && (
            <div
              className={
                rows.length > 0
                  ? "mt-1.5 transition-opacity duration-200 ease-out"
                  : "transition-opacity duration-200 ease-out"
              }
            >
              {children}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

TooltipContent.displayName = "TooltipContent"

export default TooltipContent
