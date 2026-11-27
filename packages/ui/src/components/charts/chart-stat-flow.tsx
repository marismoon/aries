"use client"

import { type ReactNode, useMemo } from "react"
import { cn } from "cn"

/** Subset of `Intl.NumberFormatOptions` supported by ChartStatFlow. */
export interface ChartStatFlowFormat {
  notation?: "standard" | "compact"
  compactDisplay?: "short" | "long"
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  minimumIntegerDigits?: number
  minimumSignificantDigits?: number
  maximumSignificantDigits?: number
  style?: "decimal" | "percent" | "currency"
  currency?: string
  currencyDisplay?: "symbol" | "narrowSymbol" | "code" | "name"
  unit?: string
  unitDisplay?: "short" | "long" | "narrow"
}

export const defaultChartStatFlowFormat: ChartStatFlowFormat = {
  notation: "standard",
  maximumFractionDigits: 0,
}

function formatStatValue(
  value: number,
  formatOptions: ChartStatFlowFormat,
  prefix?: string,
  suffix?: string
): string {
  const formatted = new Intl.NumberFormat(undefined, formatOptions).format(
    value
  )
  return `${prefix ?? ""}${formatted}${suffix ?? ""}`
}

export function useNumberFlowElementReady(): boolean {
  return false
}

export interface ChartStatFlowProps {
  value: number
  label: string
  formatOptions?: ChartStatFlowFormat
  prefix?: string
  suffix?: string
  valueClassName?: string
  labelClassName?: string
  icon?: ReactNode
}

/**
 * Shared value + label stack for pie / ring centers.
 * Renders formatted tabular figures directly via Intl.NumberFormat.
 */
export function ChartStatFlow({
  value,
  label,
  formatOptions = defaultChartStatFlowFormat,
  prefix,
  suffix,
  valueClassName = "text-2xl font-bold",
  labelClassName = "text-xs",
  icon,
}: ChartStatFlowProps) {
  const staticValue = useMemo(
    () => formatStatValue(value, formatOptions, prefix, suffix),
    [value, formatOptions, prefix, suffix]
  )

  return (
    <>
      {icon ? (
        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
          {icon}
        </div>
      ) : null}
      <span className={cn("text-foreground tabular-nums", valueClassName)}>
        {staticValue}
      </span>
      <span className={cn("mt-0.5 text-chart-label", labelClassName)}>
        {label}
      </span>
    </>
  )
}

ChartStatFlow.displayName = "ChartStatFlow"
