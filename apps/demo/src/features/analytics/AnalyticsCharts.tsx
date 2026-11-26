import type { CSSProperties } from "react"

import { FrostCard } from "@marismoon/ui/shared/FrostCard"
import { useUiText } from "@/lib/i18n/use-ui-text"

import "../overview/components/overview-charts.css"

const W = 520
const H = 176
const seriesColor = (index: number) => `var(--chart-${(index % 4) + 1})`
const at = (index: number) => ({ "--chart-index": index }) as CSSProperties

const linear =
  (d0: number, d1: number, r0: number, r1: number) => (value: number) =>
    r0 + ((value - d0) / Math.max(d1 - d0, 1)) * (r1 - r0)

const niceMax = (value: number) => {
  if (value <= 0) return 10
  const step = 10 ** Math.floor(Math.log10(value))
  return Math.ceil(value / step / 2) * step * 2
}

export function AnalyticsTrendCard({
  title,
  description,
  labels,
  series,
  unit = "",
}: {
  title: string
  description: string
  labels: readonly string[]
  series: readonly { id: string; label: string; values: readonly number[] }[]
  unit?: string
}) {
  const tl = useUiText()
  const [l, r, t, b] = [42, 504, 14, 148]
  const max = niceMax(Math.max(...series.flatMap((s) => s.values), 1))
  const y = linear(0, max, b, t)
  const count = Math.max(labels.length - 1, 1)
  const x = (index: number) => l + 14 + (index * (r - l - 28)) / count

  return (
    <FrostCard className="chart-card" role="group" aria-label={title}>
      <header className="chart-card-header">
        <h2>{title}</h2>
        <p>{description}</p>
      </header>
      <div className="chart-plot">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={title}
          preserveAspectRatio="xMidYMid meet"
        >
          <g className="chart-axis">
            {[0, 1, 2, 3].map((idx) => {
              const val = (max / 3) * idx
              return (
                <g key={idx}>
                  <line x1={l} x2={r} y1={y(val)} y2={y(val)} />
                  <text x={l - 8} y={y(val) + 3.5} textAnchor="end">
                    {Math.round(val)}
                    {unit}
                  </text>
                </g>
              )
            })}
            {labels.map((label, idx) => (
              <text key={label} x={x(idx)} y={166} textAnchor="middle">
                {label}
              </text>
            ))}
          </g>

          {series.map((item, sIdx) => {
            const pts = item.values
              .map((val, idx) => `${x(idx)},${y(val)}`)
              .join(" ")
            return (
              <g
                key={item.id}
                className="chart-series"
                data-chart-mark=""
                style={{ color: seriesColor(sIdx) }}
              >
                <polyline
                  className="chart-in-draw"
                  pathLength={1}
                  points={pts}
                  style={at(sIdx)}
                />
                {item.values.map((val, idx) => (
                  <circle
                    key={idx}
                    className="chart-in-pop"
                    cx={x(idx)}
                    cy={y(val)}
                    r={idx === item.values.length - 1 ? 3.5 : 2.2}
                    style={at(idx + sIdx)}
                  />
                ))}
              </g>
            )
          })}
        </svg>
      </div>
      <ul className="chart-legend" aria-hidden="true">
        {series.map((item, idx) => (
          <li key={item.id}>
            <i style={{ background: seriesColor(idx) }} />
            {tl(item.label)}
          </li>
        ))}
      </ul>
    </FrostCard>
  )
}

export function AnalyticsBarCard({
  title,
  description,
  items,
  unit = "",
}: {
  title: string
  description: string
  items: readonly { label: string; value: number }[]
  unit?: string
}) {
  const tl = useUiText()
  const max = niceMax(Math.max(...items.map((item) => item.value), 1))
  const barTrackX = 148
  const barTrackW = 304
  const x = linear(0, max, 0, barTrackW - 12)

  return (
    <FrostCard className="chart-card" role="group" aria-label={title}>
      <header className="chart-card-header">
        <h2>{title}</h2>
        <p>{description}</p>
      </header>
      <div className="chart-plot">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={title}
          preserveAspectRatio="xMidYMid meet"
        >
          {items.slice(0, 5).map((item, idx) => {
            const rowY = 14 + idx * 31
            return (
              <g
                key={item.label}
                data-chart-mark=""
                transform={`translate(0 ${rowY})`}
              >
                <text className="chart-axis-label" x="4" y="14">
                  {tl(item.label)}
                </text>
                <rect
                  x={barTrackX}
                  y="3"
                  width={barTrackW}
                  height="15"
                  rx="7.5"
                  fill="var(--muted)"
                />
                <rect
                  className="chart-in-grow-x"
                  style={at(idx)}
                  x={barTrackX}
                  y="3"
                  width={Math.max(x(item.value) + 8, 10)}
                  height="15"
                  rx="7.5"
                  fill={idx === 0 ? "var(--chart-1)" : "var(--chart-2)"}
                />
                <text
                  className="chart-value chart-in-fade"
                  style={at(idx + 5)}
                  x="508"
                  y="14"
                  textAnchor="end"
                >
                  {item.value}
                  {unit}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
      <ul className="chart-legend" aria-hidden="true">
        <li>
          <i style={{ background: "var(--chart-1)" }} />
          {tl("Top 1")}
        </li>
        <li>
          <i style={{ background: "var(--chart-2)" }} />
          {tl("其他分布")}
        </li>
      </ul>
    </FrostCard>
  )
}
