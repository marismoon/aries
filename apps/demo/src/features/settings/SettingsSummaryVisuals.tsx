export interface SegmentItem {
  label: string
  count: number
  tone: "success" | "info" | "warning" | "danger" | "neutral"
}

const segmentColors: Record<SegmentItem["tone"], string> = {
  success: "var(--success)",
  info: "var(--info)",
  warning: "var(--warning)",
  danger: "var(--danger)",
  neutral: "var(--muted-foreground)",
}

export function SummarySegmentedBar({
  items,
  total,
}: {
  items: readonly SegmentItem[]
  total: number
}) {
  const safeTotal = Math.max(total, 1)

  return (
    <div className="settings-seg-wrap">
      <div className="settings-seg-track" aria-hidden="true">
        {items.map((item) =>
          item.count > 0 ? (
            <span
              key={item.label}
              className="settings-seg-piece"
              style={{
                width: `${(item.count / safeTotal) * 100}%`,
                background: segmentColors[item.tone],
              }}
            />
          ) : null
        )}
      </div>
      <ul className="settings-seg-legend">
        {items.map((item) => (
          <li key={item.label}>
            <span
              className="settings-seg-dot"
              style={{ background: segmentColors[item.tone] }}
              aria-hidden="true"
            />
            <span>{item.label}</span>
            <strong className="financial-number">{item.count}</strong>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function SummaryRingGauge({
  percent,
  tone = "success",
  label,
}: {
  percent: number
  tone?: "success" | "warning" | "info" | "danger"
  label: string
}) {
  const clamped = Math.max(0, Math.min(100, percent))
  const radius = 20
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - clamped / 100)

  return (
    <svg
      className="settings-ring"
      viewBox="0 0 52 52"
      role="img"
      aria-label={`${label} ${clamped}%`}
    >
      <circle className="settings-ring-track" cx="26" cy="26" r={radius} />
      <circle
        className="settings-ring-fill"
        cx="26"
        cy="26"
        r={radius}
        stroke={segmentColors[tone]}
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
      />
      <text
        x="26"
        y="26"
        textAnchor="middle"
        dominantBaseline="central"
        className="settings-ring-text financial-number"
      >
        {clamped}%
      </text>
    </svg>
  )
}

export interface MiniBarItem {
  label: string
  value: number
  max: number
  colorVar?: string
}

const defaultChartVars = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
] as const

export function SummaryMiniBars({ items }: { items: readonly MiniBarItem[] }) {
  return (
    <ul className="settings-mini-bars">
      {items.map((item, idx) => {
        const ratio = item.max > 0 ? Math.min(1, item.value / item.max) : 0
        const color =
          item.colorVar ?? defaultChartVars[idx % defaultChartVars.length]
        return (
          <li key={item.label}>
            <span className="settings-mini-bar-label">{item.label}</span>
            <span className="settings-mini-bar-track" aria-hidden="true">
              <span
                className="settings-mini-bar-fill"
                style={{
                  width: `${Math.max(ratio * 100, item.value > 0 ? 8 : 0)}%`,
                  background: color,
                }}
              />
            </span>
            <strong className="settings-mini-bar-value financial-number">
              {item.value}
            </strong>
          </li>
        )
      })}
    </ul>
  )
}
