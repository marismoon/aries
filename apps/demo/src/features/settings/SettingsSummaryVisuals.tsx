import { useState } from "react"

import {
  AreaSparkline,
  BarSparkline,
  LineSparkline,
  Ring,
  RingChart,
  useSparklineHover,
} from "@marismoon/ui/charts"
import { FrostCard } from "@marismoon/ui/shared/FrostCard"

export interface SparklinePoint {
  label: string
  value: number
}

export type SparklineKind = "area" | "line" | "bar"
export type KpiTone = "success" | "info" | "warning" | "danger" | "neutral"

export interface SparklineKpiCardProps {
  label: string
  value: string | number
  /** Formats hovered sparkline datum when the pointer moves across the chart. */
  formatHoverValue?: (value: number) => string
  note?: string
  badge?: string
  badgeTone?: KpiTone
  data: readonly SparklinePoint[]
  variant?: SparklineKind
  color?: string
  featured?: boolean
  height?: number
}

/**
 * Single-layer KPI card with interactive Bklit sparkline (hovering updates
 * the displayed figure and period label without shifting card layout).
 */
export function SparklineKpiCard({
  label,
  value,
  formatHoverValue,
  note,
  badge,
  badgeTone = "neutral",
  data,
  variant = "area",
  color = "var(--chart-1)",
  featured = false,
  height = 44,
}: SparklineKpiCardProps) {
  const hover = useSparklineHover<SparklinePoint>()
  const hovered = hover.datum
  const shownValue = hovered
    ? formatHoverValue
      ? formatHoverValue(hovered.value)
      : hovered.value.toLocaleString("en-US")
    : value

  return (
    <FrostCard
      className={
        featured
          ? "settings-summary-card settings-kpi-card hero-surface"
          : "settings-summary-card settings-kpi-card"
      }
    >
      <div className="settings-kpi-head">
        <div className="settings-summary-meta">
          <div className="settings-kpi-label-row">
            <span className="settings-summary-label">{label}</span>
            {hovered ? (
              <span className="settings-kpi-period financial-number">
                {hovered.label}
              </span>
            ) : badge ? (
              <span className="settings-kpi-pill" data-tone={badgeTone}>
                {badge}
              </span>
            ) : null}
          </div>
          <div className="settings-summary-value financial-number">
            {shownValue}
          </div>
          {note ? <p className="settings-summary-note">{note}</p> : null}
        </div>
      </div>

      <div className="settings-kpi-spark">
        {variant === "line" ? (
          <LineSparkline
            data={data}
            dataKey="value"
            color={color}
            height={height}
            {...hover.sparklineProps}
          />
        ) : variant === "bar" ? (
          <BarSparkline
            data={data}
            dataKey="value"
            color={color}
            height={height}
            barRadius={3}
            {...hover.sparklineProps}
          />
        ) : (
          <AreaSparkline
            data={data}
            dataKey="value"
            color={color}
            height={height}
            {...hover.sparklineProps}
          />
        )}
      </div>
    </FrostCard>
  )
}

export interface RingKpiItem {
  label: string
  value: number
  maxValue: number
  color?: string
}

export interface RingKpiCardProps {
  label: string
  value: string | number
  note?: string
  badge?: string
  badgeTone?: KpiTone
  rings: readonly RingKpiItem[]
  centerLabel?: string
  centerSuffix?: string
  featured?: boolean
}

/**
 * Single-layer KPI card pairing metric figures with a compact Bklit RingChart
 * for capacity, SLA error budget, or multi-target progress gauges.
 * Shares the exact top header baseline with SparklineKpiCard; hovering a ring
 * updates the displayed figure and label smoothly without overflowing the ring.
 */
export function RingKpiCard({
  label,
  value,
  note,
  badge,
  badgeTone = "info",
  rings,
  centerSuffix = "%",
  featured = false,
}: RingKpiCardProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
  const hoveredRing = hoveredIdx !== null ? rings[hoveredIdx] : undefined
  const shownValue = hoveredRing ? `${hoveredRing.value}${centerSuffix}` : value

  const ringCount = rings.length
  const strokeWidth = ringCount >= 3 ? 5.5 : 7
  const ringGap = ringCount >= 3 ? 3.5 : 4.5
  const baseInnerRadius = ringCount >= 3 ? 16 : 20

  return (
    <FrostCard
      className={
        featured
          ? "settings-summary-card settings-kpi-card settings-ring-kpi-card hero-surface"
          : "settings-summary-card settings-kpi-card settings-ring-kpi-card"
      }
    >
      <div className="settings-kpi-label-row">
        <span className="settings-summary-label">{label}</span>
        {hoveredRing ? (
          <span className="settings-kpi-period">{hoveredRing.label}</span>
        ) : badge ? (
          <span className="settings-kpi-pill" data-tone={badgeTone}>
            {badge}
          </span>
        ) : null}
      </div>

      <div className="settings-ring-kpi-body">
        <div className="settings-summary-meta">
          <div className="settings-summary-value financial-number">
            {shownValue}
          </div>
          {note ? <p className="settings-summary-note">{note}</p> : null}
        </div>

        <div className="settings-ring-kpi-chart">
          <RingChart
            data={[...rings]}
            size={76}
            strokeWidth={strokeWidth}
            ringGap={ringGap}
            baseInnerRadius={baseInnerRadius}
            padding={2}
            hoveredIndex={hoveredIdx}
            onHoverChange={setHoveredIdx}
          >
            {rings.map((ring, idx) => (
              <Ring key={ring.label} index={idx} />
            ))}
          </RingChart>
        </div>
      </div>
    </FrostCard>
  )
}
