import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  BarYAxis,
  ChartTooltip,
  Grid,
  Line,
  LineChart,
  TooltipContent,
  XAxis,
  YAxis,
} from "@marismoon/ui/charts"

export const seriesColor = (index: number) => `var(--chart-${(index % 5) + 1})`

export function TrendPlot({
  dates,
  labels,
  series,
  unit = "",
  area = false,
}: {
  dates: number[]
  labels: string[]
  series: readonly { id: string; label: string; values: readonly number[] }[]
  unit?: string
  area?: boolean
}) {
  const Plot = area ? AreaChart : LineChart
  const data = dates.map((date, i) => ({
    date,
    ...Object.fromEntries(series.map((s) => [s.id, s.values[i]])),
  }))

  return (
    <Plot
      data={data}
      aspectRatio="auto"
      className="h-full"
      margin={{ top: 10, left: 46, bottom: 26, right: 12 }}
    >
      <Grid horizontal />
      <YAxis numTicks={4} formatValue={(v) => `${v}${unit}`} />
      <XAxis labels={labels} numTicks={Math.min(labels.length, 6)} />
      {series.map((s, i) =>
        area ? (
          <Area
            key={s.id}
            dataKey={s.id}
            fill={seriesColor(i)}
            fillOpacity={0.26}
            stroke={seriesColor(i)}
            strokeWidth={2}
          />
        ) : (
          <Line
            key={s.id}
            dataKey={s.id}
            stroke={seriesColor(i)}
            strokeWidth={2}
          />
        )
      )}
      <ChartTooltip
        showDatePill={false}
        content={({ index }) => (
          <TooltipContent
            title={labels[index]}
            rows={series.map((s, i) => ({
              label: s.label,
              color: seriesColor(i),
              value: `${s.values[index] ?? 0}${unit}`,
            }))}
          />
        )}
      />
    </Plot>
  )
}

export function RankingPlot({
  items,
  unit,
}: {
  items: readonly { label: string; value: number }[]
  unit: string
}) {
  const data = items.slice(0, 5).map((item, i) => ({
    ...item,
    first: i === 0 ? item.value : 0,
    others: i === 0 ? 0 : item.value,
  }))

  return (
    <BarChart
      data={data}
      xDataKey="label"
      orientation="horizontal"
      stacked
      aspectRatio="auto"
      className="h-full"
      margin={{ top: 4, right: 44, left: 104, bottom: 4 }}
    >
      <BarYAxis />
      <Bar
        dataKey="first"
        fill={seriesColor(0)}
        lineCap="round"
        showValue
        valueLabelColor="var(--foreground)"
        valueLabelFormatter={(v) => `${v}${unit}`}
      />
      <Bar
        dataKey="others"
        fill={seriesColor(1)}
        lineCap="round"
        showValue
        valueLabelColor="var(--muted-foreground)"
        valueLabelFormatter={(v) => `${v}${unit}`}
      />
      <ChartTooltip
        showDatePill={false}
        content={({ index }) => {
          const item = data[index]
          if (!item) return null
          return (
            <TooltipContent
              rows={[
                {
                  label: item.label,
                  color: seriesColor(index === 0 ? 0 : 1),
                  value: `${item.value}${unit}`,
                },
              ]}
            />
          )
        }}
      />
    </BarChart>
  )
}

export function DistributionPlot({
  segments,
}: {
  segments: readonly { key: string; value: number; color: string }[]
}) {
  const data = [
    {
      name: "total",
      ...Object.fromEntries(segments.map((s) => [s.key, s.value])),
    },
  ]

  return (
    <div className="relative flex h-3 items-center">
      <div
        className="pointer-events-none absolute inset-x-0 h-2 rounded-full bg-(--recess)"
        aria-hidden="true"
      />
      <BarChart
        data={data}
        stacked
        stackGap={2}
        orientation="horizontal"
        aspectRatio="auto"
        className="pointer-events-none relative h-3 w-full"
        margin={{ top: 2, bottom: 2, left: 0, right: 0 }}
        barGap={0}
        animationDuration={0}
      >
        {segments.map((s) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            fill={s.color}
            animate={false}
            lineCap="round"
          />
        ))}
      </BarChart>
    </div>
  )
}

export function MeterPlot({
  value,
  max = 100,
  color,
  label,
}: {
  value: number
  max?: number
  color: string
  label: string
}) {
  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
    >
      <DistributionPlot
        segments={[
          { key: "used", value, color },
          {
            key: "remaining",
            value: Math.max(max - value, 0),
            color: "transparent",
          },
        ]}
      />
    </div>
  )
}
