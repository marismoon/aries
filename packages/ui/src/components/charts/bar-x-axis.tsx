"use client"

import * as m from "motion/react-m"
import { memo, useMemo } from "react"
import { createPortal } from "react-dom"
import { cn } from "cn"
import {
  useChart,
  useChartPortalContainer,
  useChartStable,
} from "./chart-context"
import { useDatePillPresent } from "./date-pill-store"
import {
  type ChartLabelCount,
  resolveResponsiveChartLabelCount,
} from "./responsive-chart-label-count"

export interface BarXAxisProps {
  /** Width of the date ticker box for fade calculation. Default: 50 */
  tickerHalfWidth?: number
  /** Whether to show all labels or skip some for dense data. Default: false */
  showAllLabels?: boolean
  /** Maximum number of labels to show. Supports responsive breakpoints. */
  maxLabels?: ChartLabelCount
}

interface BarXAxisLabelProps {
  label: string
  x: number
  top: number
  crosshairX: number | null
  isHovering: boolean
  isHoveredBar: boolean
  datePillPresent: boolean
  tickerHalfWidth: number
}

function BarXAxisLabel({
  label,
  x,
  top,
  crosshairX,
  isHovering,
  isHoveredBar,
  datePillPresent,
  tickerHalfWidth,
}: BarXAxisLabelProps) {
  const fadeBuffer = 20
  const fadeRadius = tickerHalfWidth + fadeBuffer

  let opacity = 1
  if (datePillPresent && isHovering && crosshairX !== null) {
    const distance = Math.abs(x - crosshairX)
    if (distance < tickerHalfWidth) {
      opacity = 0
    } else if (distance < fadeRadius) {
      opacity = (distance - tickerHalfWidth) / fadeBuffer
    }
  }

  // Zero-width container approach for perfect centering below the bar baseline
  return (
    <div
      className="absolute"
      style={{
        left: x,
        top,
        width: 0,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <m.span
        animate={{
          opacity,
          color:
            !datePillPresent && isHoveredBar
              ? "var(--foreground)"
              : "var(--chart-label)",
        }}
        className={cn(
          "text-xs leading-none whitespace-nowrap financial-number",
          !datePillPresent && isHoveredBar ? "font-medium" : "font-normal"
        )}
        initial={{ opacity: 1, color: "var(--chart-label)" }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {label}
      </m.span>
    </div>
  )
}

export function BarXAxis(props: BarXAxisProps) {
  const { containerRef, barScale } = useChartStable()
  const container = useChartPortalContainer(containerRef)
  if (!container) {
    return null
  }

  if (!barScale) {
    return null
  }

  return <BarXAxisInner {...props} container={container} />
}

const BarXAxisInner = memo(function BarXAxisInner({
  tickerHalfWidth = 50,
  showAllLabels = false,
  maxLabels = 12,
  container,
}: BarXAxisProps & { container: HTMLDivElement }) {
  const {
    margin,
    tooltipData,
    barScale,
    bandWidth,
    barXAccessor,
    hoveredBarIndex,
    data,
    width,
    height,
  } = useChart()
  const datePillPresent = useDatePillPresent(container)

  const resolvedMaxLabels = useMemo(
    () => resolveResponsiveChartLabelCount(maxLabels, width, 12),
    [maxLabels, width]
  )

  // Generate labels for each bar
  const labelsToShow = useMemo(() => {
    if (!(barScale && bandWidth && barXAccessor)) {
      return []
    }

    const allLabels = data.map((d, index) => {
      const label = barXAccessor(d)
      const bandX = barScale(label) ?? 0
      // Center the label under the bar group
      const x = bandX + bandWidth / 2 + margin.left
      return { label, x, index }
    })

    // If showAllLabels is true or we have fewer than maxLabels, show all
    if (showAllLabels || allLabels.length <= resolvedMaxLabels) {
      return allLabels
    }

    // Otherwise, skip some labels to avoid crowding
    const step = Math.ceil(allLabels.length / Math.max(1, resolvedMaxLabels))
    return allLabels.filter((_, i) => i % step === 0)
  }, [
    barScale,
    bandWidth,
    barXAccessor,
    data,
    margin.left,
    showAllLabels,
    resolvedMaxLabels,
  ])

  const isHovering = tooltipData !== null
  const crosshairX = tooltipData ? tooltipData.x + margin.left : null
  const labelTop = Math.max(0, height - margin.bottom + 6)

  return createPortal(
    <div className="pointer-events-none absolute inset-0">
      {labelsToShow.map((item) => (
        <BarXAxisLabel
          crosshairX={crosshairX}
          datePillPresent={datePillPresent}
          isHoveredBar={hoveredBarIndex === item.index}
          isHovering={isHovering}
          key={`${item.label}-${item.x}`}
          label={item.label}
          tickerHalfWidth={tickerHalfWidth}
          top={labelTop}
          x={item.x}
        />
      ))}
    </div>,
    container
  )
})

BarXAxis.displayName = "BarXAxis"

export default BarXAxis
