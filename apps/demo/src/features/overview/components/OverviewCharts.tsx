import type { CSSProperties, ReactNode } from "react"

import { FrostCard } from "@marismoon/ui/shared/FrostCard"
import {
  annualBudget,
  billingTypeSeries,
  chartMonths,
  collectionHeat,
  parseScatter,
  providerSeries,
  qualityAxes,
  qualitySeries,
  topAccounts,
  yearMonthly,
} from "@/features/overview/mocks/charts"
import { formatWan } from "@marismoon/ui/lib/format"

import "./overview-charts.css"
import { useUiText } from "@/lib/i18n/use-ui-text"

const W = 320
const H = 168
const seriesColor = (index: number) => `var(--chart-${(index % 4) + 1})`
/** Stagger slot for the `chart-in-*` entrance utilities (motion.css). */
const at = (index: number, extra?: Record<string, string>) =>
  ({ "--chart-index": index, ...extra }) as CSSProperties

const linear =
  (d0: number, d1: number, r0: number, r1: number) => (value: number) =>
    r0 + ((value - d0) / (d1 - d0)) * (r1 - r0)

const niceMax = (value: number) => {
  const step = 10 ** Math.floor(Math.log10(value))
  return Math.ceil(value / step / 2) * step * 2
}

const sum = (values: readonly number[]) =>
  values.reduce((total, value) => total + value, 0)

function ChartCard({
  title,
  description,
  legend,
  label,
  data,
  children,
}: {
  title: string
  description: string
  legend: readonly { label: string; color: string }[]
  label: string
  /** The exact values behind the drawing, as a screen-reader table. */
  data: {
    columns: readonly string[]
    rows: readonly (readonly (string | number)[])[]
  }
  children: ReactNode
}) {
  const tl = useUiText()

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
          aria-label={label}
          preserveAspectRatio="xMidYMid meet"
        >
          {children}
        </svg>
      </div>
      <table className="sr-only">
        <caption>{tl("{{title}}数据", { title })}</caption>
        <thead>
          <tr>
            {data.columns.map((column) => (
              <th key={column} scope="col">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row) => (
            <tr key={String(row[0]) + String(row[1])}>
              {row.map((cell, index) =>
                index === 0 ? (
                  <th key={index} scope="row">
                    {cell}
                  </th>
                ) : (
                  <td key={index}>{cell}</td>
                )
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <ul className="chart-legend" aria-hidden="true">
        {legend.map((item) => (
          <li key={item.label}>
            <i style={{ background: item.color }} />
            {tl(item.label)}
          </li>
        ))}
      </ul>
    </FrostCard>
  )
}

function YGrid({
  top,
  bottom,
  left,
  right,
  max,
  unit = "",
}: {
  top: number
  bottom: number
  left: number
  right: number
  max: number
  unit?: string
}) {
  const y = linear(0, max, bottom, top)
  return (
    <g className="chart-axis">
      {[0, 1, 2, 3].map((index) => {
        const value = (max / 3) * index
        return (
          <g key={index}>
            <line x1={left} x2={right} y1={y(value)} y2={y(value)} />
            <text x={left - 5} y={y(value) + 3} textAnchor="end">
              {Math.round(value)}
              {unit}
            </text>
          </g>
        )
      })}
    </g>
  )
}

function MonthLabels({
  labels,
  x,
  y,
}: {
  labels: readonly string[]
  x: (index: number) => number
  y: number
}) {
  const tl = useUiText()
  return (
    <g className="chart-axis">
      {labels.map((label, index) => (
        <text key={label} x={x(index)} y={y} textAnchor="middle">
          {tl(label)}
        </text>
      ))}
    </g>
  )
}

function LineChart() {
  const tl = useUiText()

  const [l, r, t, b] = [28, 308, 10, 146]
  const max = niceMax(Math.max(...providerSeries.flatMap((s) => s.values)))
  const y = linear(0, max, b, t)
  const x = (index: number) => l + 10 + (index * (r - l - 20)) / 5

  return (
    <ChartCard
      title={tl("供应商出账趋势")}
      description={tl("近 6 月，万元")}
      legend={providerSeries.map((s, i) => ({
        label: tl(s.label),
        color: seriesColor(i),
      }))}
      label={tl("近 6 月各供应商出账趋势，10 月 {{value}}", {
        value: providerSeries
          .map((s) =>
            tl("{{label}} {{amount}} 万", {
              label: tl(s.label),
              amount: s.values[5] ?? 0,
            })
          )
          .join(tl("，")),
      })}
      data={{
        columns: [tl("月份"), ...providerSeries.map((s) => tl(s.label))],
        rows: chartMonths.map((month, i) => [
          tl(month),
          ...providerSeries.map((s) => s.values[i]!),
        ]),
      }}
    >
      <YGrid top={t} bottom={b} left={l} right={r} max={max} />
      {providerSeries.map((series, index) => {
        const points = series.values.map((value, i) => `${x(i)},${y(value)}`)
        return (
          <g
            key={series.id}
            className="chart-series"
            data-chart-mark=""
            style={{ color: seriesColor(index) }}
          >
            <polyline
              className="chart-in-draw"
              pathLength={1}
              points={points.join(" ")}
              style={at(index)}
            />
            {series.values.map((value, i) => (
              <circle
                key={i}
                className="chart-in-pop"
                cx={x(i)}
                cy={y(value)}
                r={i === 5 ? 3 : 1.8}
                style={at(i + index)}
              />
            ))}
          </g>
        )
      })}
      <MonthLabels labels={chartMonths} x={x} y={162} />
    </ChartCard>
  )
}

function AreaChart() {
  const tl = useUiText()

  const [l, r, t, b] = [30, 308, 10, 146]
  const cumulative = yearMonthly.map((_, index) =>
    sum(yearMonthly.slice(0, index + 1).map((month) => month.amount))
  )
  const max = niceMax(cumulative.at(-1)!)
  const y = linear(0, max, b, t)
  const x = (index: number) => l + 8 + (index * (r - l - 16)) / 9
  const line = cumulative.map((value, i) => `${x(i)},${y(value)}`).join(" L")

  return (
    <ChartCard
      title={tl("年累计出账")}
      description={tl("1–10 月累计，万元")}
      legend={[{ label: tl("累计已出账"), color: "var(--chart-1)" }]}
      label={tl("1 至 10 月累计出账 {{value}} 万", {
        value: formatWan(sum(yearMonthly.map((m) => m.amount)) * 10000),
      })}
      data={{
        columns: [tl("月份"), tl("出账（万元）")],
        rows: yearMonthly.map((m) => [tl(m.month), m.amount]),
      }}
    >
      <defs>
        <linearGradient id="area-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="var(--chart-1)" stopOpacity="0.34" />
          <stop offset="1" stopColor="var(--chart-1)" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <YGrid top={t} bottom={b} left={l} right={r} max={max} />
      <path
        className="chart-in-fade"
        d={`M${x(0)},${b} L${line} L${x(9)},${b}Z`}
        fill="url(#area-fill)"
        style={at(4)}
      />
      <path
        className="chart-in-draw"
        pathLength={1}
        d={`M${line}`}
        fill="none"
        stroke="var(--chart-1)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle
        className="chart-in-pop"
        cx={x(9)}
        cy={y(cumulative[9]!)}
        r="3.2"
        fill="var(--chart-1)"
        style={at(10)}
      />
      <text
        className="chart-value chart-in-fade"
        style={at(12)}
        x={x(9)}
        y={y(cumulative[9]!) - 7}
        textAnchor="end"
      >
        {Math.round(cumulative[9]!)}
      </text>
      <MonthLabels labels={yearMonthly.map((m) => m.month)} x={x} y={162} />
    </ChartCard>
  )
}

function StackedChart() {
  const tl = useUiText()

  const [l, r, t, b] = [28, 308, 10, 146]
  const totals = chartMonths.map((_, i) =>
    sum(billingTypeSeries.map((s) => s.values[i]!))
  )
  const max = niceMax(Math.max(...totals))
  const y = linear(0, max, b, t)
  const slot = (r - l) / 6
  const barWidth = 26

  return (
    <ChartCard
      title={tl("账单类型构成")}
      description={tl("近 6 月，万元")}
      legend={billingTypeSeries.map((s, i) => ({
        label: tl(s.label),
        color: seriesColor(i),
      }))}
      label={tl("近 6 月按账单类型堆叠，10 月合计 {{value}} 万", {
        value: totals[5]!.toFixed(2),
      })}
      data={{
        columns: [tl("月份"), ...billingTypeSeries.map((s) => tl(s.label))],
        rows: chartMonths.map((month, i) => [
          tl(month),
          ...billingTypeSeries.map((s) => s.values[i]!),
        ]),
      }}
    >
      <YGrid top={t} bottom={b} left={l} right={r} max={max} />
      {chartMonths.map((month, i) => {
        let base = 0
        const cx = l + slot * i + slot / 2
        return (
          <g
            key={month}
            className="chart-in-grow-y"
            data-chart-mark=""
            style={at(i)}
          >
            {billingTypeSeries.map((series, index) => {
              const value = series.values[i]!
              const top = y(base + value)
              const height = y(base) - top
              base += value
              return (
                <rect
                  key={series.id}
                  x={cx - barWidth / 2}
                  y={top}
                  width={barWidth}
                  height={Math.max(height - 1, 0)}
                  rx={index === billingTypeSeries.length - 1 ? 3 : 0}
                  fill={seriesColor(index)}
                />
              )
            })}
          </g>
        )
      })}
      <MonthLabels
        labels={chartMonths}
        x={(i) => l + slot * i + slot / 2}
        y={162}
      />
    </ChartCard>
  )
}

function DonutChart() {
  const tl = useUiText()

  const values = providerSeries.map((s) => s.values[5])
  const total = sum(values)
  const radius = 50
  const circumference = 2 * Math.PI * radius
  const offsets = values.map(
    (_, index) => (sum(values.slice(0, index)) / total) * circumference
  )

  return (
    <ChartCard
      title={tl("供应商费用占比")}
      description={tl("10 月，占比")}
      legend={providerSeries.map((s, i) => ({
        label: tl(s.label),
        color: seriesColor(i),
      }))}
      label={tl("10 月供应商费用占比，阿里云 {{value}}%", {
        value: ((values[0]! / total) * 100).toFixed(1),
      })}
      data={{
        columns: [tl("供应商"), tl("10 月出账（万元）"), tl("占比")],
        rows: providerSeries.map((s, i) => [
          tl(s.label),
          values[i]!,
          `${((values[i]! / total) * 100).toFixed(1)}%`,
        ]),
      }}
    >
      <g transform="translate(92 84) rotate(-90)">
        <circle r={radius} fill="none" stroke="var(--muted)" strokeWidth="16" />
        {values.map((value, i) => {
          const length = (value / total) * circumference
          return (
            <circle
              key={i}
              className="chart-in-sweep"
              data-chart-mark=""
              style={at(i * 3, { "--chart-dash-from": `0 ${circumference}` })}
              r={radius}
              fill="none"
              stroke={seriesColor(i)}
              strokeWidth="16"
              strokeDasharray={`${Math.max(length - 2, 0)} ${circumference}`}
              strokeDashoffset={-offsets[i]!}
            />
          )
        })}
      </g>
      <text
        className="chart-total chart-in-fade"
        x="92"
        y="86"
        textAnchor="middle"
        style={at(6)}
      >
        {total.toFixed(1)}
      </text>
      <text className="chart-axis-label" x="92" y="100" textAnchor="middle">
        {tl("万元")}
      </text>
      <g className="chart-axis">
        {providerSeries.map((series, i) => (
          <g key={series.id} transform={`translate(176 ${46 + i * 26})`}>
            <rect width="9" height="9" rx="2.5" fill={seriesColor(i)} />
            <text x="16" y="8">
              {tl(series.label)}
            </text>
            <text className="chart-value" x="132" y="8" textAnchor="end">
              {((values[i]! / total) * 100).toFixed(1)}%
            </text>
          </g>
        ))}
      </g>
    </ChartCard>
  )
}

function BarChart() {
  const tl = useUiText()

  const max = niceMax(Math.max(...topAccounts.map((a) => a.amount)))
  const x = linear(0, max, 0, 150)

  return (
    <ChartCard
      title={tl("Top 5 云账号")}
      description={tl("10 月出账，万元")}
      legend={[{ label: tl("10 月出账"), color: "var(--chart-1)" }]}
      label={tl("10 月出账最高的云账号为{{label}}，{{amount}} 万", {
        label: tl(topAccounts[0].label),
        amount: topAccounts[0].amount,
      })}
      data={{
        columns: [tl("云账号"), tl("10 月出账（万元）")],
        rows: topAccounts.map((a) => [tl(a.label), a.amount]),
      }}
    >
      {topAccounts.map((account, i) => {
        const y = 12 + i * 30
        return (
          <g
            key={tl(account.label)}
            data-chart-mark=""
            transform={`translate(0 ${y})`}
          >
            <text className="chart-axis-label" x="0" y="13">
              {tl(account.label)}
            </text>
            <rect
              x="104"
              y="3"
              width="160"
              height="14"
              rx="7"
              fill="var(--muted)"
            />
            <rect
              className="chart-in-grow-x"
              style={at(i)}
              x="104"
              y="3"
              width={Math.max(x(account.amount) + 6, 8)}
              height="14"
              rx="7"
              fill={i === 0 ? "var(--chart-1)" : "var(--chart-2)"}
            />
            <text
              className="chart-value chart-in-fade"
              style={at(i + 6)}
              x="272"
              y="13"
            >
              {account.amount}
            </text>
          </g>
        )
      })}
    </ChartCard>
  )
}

function RadarChart() {
  const tl = useUiText()

  const [cx, cy, radius] = [160, 84, 58]
  const [min, max] = [70, 100]
  const angle = (i: number) =>
    -Math.PI / 2 + (i * 2 * Math.PI) / qualityAxes.length
  const point = (i: number, value: number) => {
    const ratio = Math.max(value - min, 0) / (max - min)
    return `${cx + Math.cos(angle(i)) * radius * ratio},${cy + Math.sin(angle(i)) * radius * ratio}`
  }
  const ring = (level: number) =>
    qualityAxes.map((_, i) => point(i, min + (max - min) * level)).join(" ")

  return (
    <ChartCard
      title={tl("采集质量")}
      description={tl("本月 vs 上月，刻度 70–100")}
      legend={qualitySeries.map((s, i) => ({
        label: tl(s.label),
        color: seriesColor(i),
      }))}
      label={tl("本月采集质量五项指标，解析成功率 {{value}}%", {
        value: qualitySeries[0].values[1],
      })}
      data={{
        columns: [
          tl("指标"),
          ...qualitySeries.map((s) => `${tl(s.label)}（%）`),
        ],
        rows: qualityAxes.map((axis, i) => [
          tl(axis),
          ...qualitySeries.map((s) => s.values[i]!),
        ]),
      }}
    >
      <g className="chart-axis">
        {[1 / 3, 2 / 3, 1].map((level) => (
          <polygon key={level} points={ring(level)} fill="none" />
        ))}
        {qualityAxes.map((label, i) => (
          <g key={label}>
            <line
              x1={cx}
              y1={cy}
              x2={point(i, max).split(",")[0]}
              y2={point(i, max).split(",")[1]}
            />
            <text
              x={cx + Math.cos(angle(i)) * (radius + 14)}
              y={cy + Math.sin(angle(i)) * (radius + 12) + 3}
              textAnchor="middle"
            >
              {tl(label)}
            </text>
          </g>
        ))}
      </g>
      {[...qualitySeries].reverse().map((series) => {
        const index = qualitySeries.findIndex((s) => s.id === series.id)
        return (
          <polygon
            key={series.id}
            className="chart-in-pop"
            data-chart-mark=""
            style={at(index === 0 ? 2 : 0)}
            points={series.values.map((v, i) => point(i, v)).join(" ")}
            fill={seriesColor(index)}
            fillOpacity={index === 0 ? 0.24 : 0.1}
            stroke={seriesColor(index)}
            strokeWidth={index === 0 ? 2 : 1.4}
            strokeLinejoin="round"
          />
        )
      })}
    </ChartCard>
  )
}

function HeatmapChart() {
  const tl = useUiText()

  const days = [
    tl("一"),
    tl("二"),
    tl("三"),
    tl("四"),
    tl("五"),
    tl("六"),
    tl("日"),
  ]
  const max = Math.max(...collectionHeat.flat())

  return (
    <ChartCard
      title={tl("采集任务热力")}
      description={tl("近 5 周每日任务数")}
      legend={[
        {
          label: tl("少"),
          color: "color-mix(in srgb, var(--chart-1) 12%, var(--muted))",
        },
        { label: tl("多"), color: "var(--chart-1)" },
      ]}
      label={tl("近 5 周采集任务，单日最多 {{max}} 个", { max })}
      data={{
        columns: [
          tl("周"),
          tl("周一"),
          tl("周二"),
          tl("周三"),
          tl("周四"),
          tl("周五"),
          tl("周六"),
          tl("周日"),
        ],
        rows: collectionHeat.map((row, i) => [
          tl("第 {{value}} 周", { value: i + 1 }),
          ...row,
        ]),
      }}
    >
      <g className="chart-axis">
        {days.map((day, i) => (
          <text key={day} x={48 + i * 34 + 14} y="12" textAnchor="middle">
            {tl("周{{day}}", { day })}
          </text>
        ))}
        {collectionHeat.map((_, row) => (
          <text key={row} x="34" y={36 + row * 27} textAnchor="end">
            {tl("第 {{week}} 周", { week: row + 1 })}
          </text>
        ))}
      </g>
      {collectionHeat.map((week, row) =>
        week.map((count, col) => (
          <rect
            key={`${row}-${col}`}
            className="chart-in-fade"
            data-chart-mark=""
            style={at(row + col)}
            x={48 + col * 34}
            y={20 + row * 27}
            width="28"
            height="21"
            rx="6"
            fill={`color-mix(in srgb, var(--chart-1) ${12 + (count / max) * 88}%, var(--muted))`}
          >
            <title>
              {tl("第 {{value}} 周 周{{value2}}：{{count}} 个任务", {
                value: row + 1,
                value2: days[col] ?? "",
                count,
              })}
            </title>
          </rect>
        ))
      )}
    </ChartCard>
  )
}

function ScatterChart() {
  const tl = useUiText()

  const [l, r, t, b] = [30, 308, 10, 146]
  const x = linear(0, 50, l + 6, r - 6)
  const y = linear(0, 80, b, t)
  const providerIndex = new Map(providerSeries.map((s, i) => [s.id, i]))

  return (
    <ChartCard
      title={tl("金额与解析耗时")}
      description={tl("单张账单，万元 / 秒")}
      legend={providerSeries.map((s, i) => ({
        label: tl(s.label),
        color: seriesColor(i),
      }))}
      label={tl("{{length}} 张账单的金额与解析耗时，金额越大耗时越长", {
        length: parseScatter.length,
      })}
      data={{
        columns: [tl("供应商"), tl("金额（万元）"), tl("解析耗时（秒）")],
        rows: parseScatter.map((p) => [
          tl(
            providerSeries.find((s) => s.id === p.provider)?.label ?? p.provider
          ),
          p.amount,
          p.seconds,
        ]),
      }}
    >
      <g className="chart-axis">
        {[0, 20, 40, 60, 80].map((value) => (
          <g key={value}>
            <line x1={l} x2={r} y1={y(value)} y2={y(value)} />
            <text x={l - 5} y={y(value) + 3} textAnchor="end">
              {value}
            </text>
          </g>
        ))}
        {[0, 10, 20, 30, 40, 50].map((value) => (
          <text key={value} x={x(value)} y="162" textAnchor="middle">
            {value}
          </text>
        ))}
      </g>
      {parseScatter.map((point, i) => (
        <circle
          key={i}
          className="chart-in-pop"
          data-chart-mark=""
          style={at(i)}
          cx={x(point.amount)}
          cy={y(point.seconds)}
          r="5"
          fill={seriesColor(providerIndex.get(point.provider) ?? 0)}
          fillOpacity="0.72"
          stroke="var(--card)"
          strokeWidth="1"
        >
          <title>
            {tl("{{amount}} 万 · {{seconds}} 秒", {
              amount: point.amount,
              seconds: point.seconds,
            })}
          </title>
        </circle>
      ))}
    </ChartCard>
  )
}

function GaugeChart() {
  const tl = useUiText()

  const { budget, used } = annualBudget
  const ratio = used / budget
  const tone = "var(--chart-1)"
  const arc = "M 92 128 A 68 68 0 0 1 228 128"

  return (
    <ChartCard
      title={tl("年度预算使用率")}
      description={tl("1–10 月累计 / 年度预算")}
      legend={[
        { label: tl("已使用"), color: tone },
        { label: tl("剩余预算"), color: "var(--muted)" },
      ]}
      label={tl(
        "年度预算使用 {{value}}%，已用 {{used}} 万，预算 {{budget}} 万",
        { value: (ratio * 100).toFixed(1), used, budget }
      )}
      data={{
        columns: [tl("项目"), tl("数值")],
        rows: [
          [tl("已使用（万元）"), used],
          [tl("年度预算（万元）"), budget],
          [tl("使用率"), `${(ratio * 100).toFixed(1)}%`],
        ],
      }}
    >
      <path
        d={arc}
        pathLength="100"
        fill="none"
        stroke="var(--muted)"
        strokeWidth="14"
        strokeLinecap="round"
      />
      <path
        className="chart-in-sweep"
        style={at(0, { "--chart-dash-from": "0 100" })}
        d={arc}
        pathLength="100"
        fill="none"
        stroke={tone}
        strokeWidth="14"
        strokeLinecap="round"
        strokeDasharray={`${ratio * 100} 100`}
      />
      <text
        className="chart-total chart-in-fade"
        x="160"
        y="112"
        textAnchor="middle"
        style={at(6)}
      >
        {(ratio * 100).toFixed(1)}%
      </text>
      <text className="chart-axis-label" x="160" y="150" textAnchor="middle">
        {tl("已用 ¥{{used}} 万 / 预算 ¥{{budget}} 万", { used, budget })}
      </text>
      <g className="chart-axis">
        <text x="92" y="150" textAnchor="middle">
          0
        </text>
        <text x="228" y="150" textAnchor="middle">
          {budget}
        </text>
      </g>
    </ChartCard>
  )
}

const charts = [
  { id: "chart-line", Chart: LineChart },
  { id: "chart-area", Chart: AreaChart },
  { id: "chart-stack", Chart: StackedChart },
  { id: "chart-donut", Chart: DonutChart },
  { id: "chart-bar", Chart: BarChart },
  { id: "chart-radar", Chart: RadarChart },
  { id: "chart-heat", Chart: HeatmapChart },
  { id: "chart-scatter", Chart: ScatterChart },
  { id: "chart-gauge", Chart: GaugeChart },
] as const

export function OverviewCharts({ visible }: { visible: readonly string[] }) {
  const tl = useUiText()

  const shown = charts.filter(({ id }) => visible.includes(id))
  if (shown.length === 0) return null

  return (
    <section aria-label={tl("数据图表")} className="overview-charts">
      {shown.map(({ id, Chart }) => (
        <Chart key={id} />
      ))}
    </section>
  )
}
