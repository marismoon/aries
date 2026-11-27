import type { ReactNode } from "react"

import {
  BarChart as BklitBarChart,
  Bar,
  BarXAxis,
  ChartTooltip,
  ComposedChart,
  Grid,
  HeatmapChart as BklitHeatmapChart,
  HeatmapCells,
  HeatmapTooltip,
  PieChart,
  PieSlice,
  PieCenter,
  RadarChart as BklitRadarChart,
  RadarGrid,
  RadarAxis,
  RadarLabels,
  RadarArea,
  RingChart,
  Ring,
  RingCenter,
  Scatter,
  TooltipContent,
  XAxis,
  YAxis,
} from "@marismoon/ui/charts"
import {
  TrendPlot,
  RankingPlot,
  seriesColor,
} from "@/shared/charts/BusinessPlots"
import { demoPeriod } from "@/shared/mocks/period"
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

const year = Number(demoPeriod.slice(0, 4))
const monthDate = (month: string) => Date.UTC(year, parseInt(month, 10) - 1, 1)
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
      <div className="chart-plot" role="img" aria-label={label}>
        {children}
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

function LineChart() {
  const tl = useUiText()

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
      <TrendPlot
        dates={chartMonths.map(monthDate)}
        labels={chartMonths.map((m) => tl(m))}
        series={providerSeries.map((s) => ({ ...s, label: tl(s.label) }))}
        unit={tl("万")}
      />
    </ChartCard>
  )
}

function AreaChart() {
  const tl = useUiText()
  const cumulative = yearMonthly.map((_, i) =>
    Number(sum(yearMonthly.slice(0, i + 1).map((m) => m.amount)).toFixed(2))
  )

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
      <TrendPlot
        area
        dates={yearMonthly.map((m) => monthDate(m.month))}
        labels={yearMonthly.map((m) => tl(m.month))}
        series={[{ id: "issued", label: tl("累计已出账"), values: cumulative }]}
        unit={tl("万")}
      />
    </ChartCard>
  )
}

function StackedChart() {
  const tl = useUiText()
  const totals = chartMonths.map((_, i) =>
    sum(billingTypeSeries.map((s) => s.values[i]!))
  )
  const data = chartMonths.map((month, i) => ({
    month: tl(month),
    ...Object.fromEntries(billingTypeSeries.map((s) => [s.id, s.values[i]])),
  }))

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
      <BklitBarChart
        data={data}
        xDataKey="month"
        stacked
        stackGap={3}
        className="h-full"
        aspectRatio="auto"
        margin={{ top: 10, left: 34, right: 10, bottom: 26 }}
      >
        <Grid horizontal />
        <YAxis numTicks={4} />
        <BarXAxis />
        {billingTypeSeries.map((s, i) => (
          <Bar
            key={s.id}
            dataKey={s.id}
            fill={seriesColor(i)}
            lineCap="round"
          />
        ))}
        <ChartTooltip
          showDatePill={false}
          content={({ point }) => (
            <TooltipContent
              title={typeof point.month === "string" ? point.month : ""}
              rows={billingTypeSeries.map((s, i) => ({
                label: tl(s.label),
                color: seriesColor(i),
                value: `${Number(point[s.id] ?? 0)} ${tl("万")}`,
              }))}
            />
          )}
        />
      </BklitBarChart>
    </ChartCard>
  )
}

function DonutChart() {
  const tl = useUiText()
  const values = providerSeries.map((s) => s.values[5])
  const total = sum(values)
  const data = providerSeries.map((s, i) => ({
    label: tl(s.label),
    value: values[i]!,
    color: seriesColor(i),
  }))

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
      <div className="overview-donut-layout">
        <PieChart
          data={data}
          size={140}
          innerRadius={44}
          padAngle={0.03}
          cornerRadius={5}
        >
          {data.map((item, i) => (
            <PieSlice key={item.label} index={i} hoverEffect="grow" />
          ))}
          <PieCenter
            formatOptions={{
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            }}
            defaultLabel={tl("万元")}
          />
        </PieChart>
        <ul className="overview-donut-list">
          {data.map((item) => (
            <li key={item.label}>
              <span className="overview-donut-name">
                <i style={{ background: item.color }} aria-hidden="true" />
                <span>{item.label}</span>
              </span>
              <strong className="financial-number">
                {((item.value / total) * 100).toFixed(1)}%
              </strong>
            </li>
          ))}
        </ul>
      </div>
    </ChartCard>
  )
}

function BarChart() {
  const tl = useUiText()

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
      <RankingPlot
        items={topAccounts.map((a) => ({
          label: tl(a.label),
          value: a.amount,
        }))}
        unit={tl("万")}
      />
    </ChartCard>
  )
}

function RadarChart() {
  const tl = useUiText()
  const metrics = qualityAxes.map((axis) => ({ key: axis, label: tl(axis) }))
  // Bklit expects 0–100 radial coordinates. The business scale starts at 70.
  const data = qualitySeries.map((s, i) => ({
    label: tl(s.label),
    color: seriesColor(i),
    values: Object.fromEntries(
      qualityAxes.map((a, j) => [a, ((s.values[j]! - 70) / 30) * 100])
    ),
  }))

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
      <div className="flex h-full items-center justify-center">
        <BklitRadarChart
          size={182}
          margin={34}
          levels={3}
          data={data}
          metrics={metrics}
          className="mx-auto"
        >
          <RadarGrid showLabels={false} />
          <RadarAxis />
          <RadarLabels />
          {data.map((s, i) => (
            <RadarArea key={s.label} index={i} />
          ))}
        </BklitRadarChart>
      </div>
    </ChartCard>
  )
}

function HeatmapChart() {
  const tl = useUiText()
  const days = [
    tl("周一"),
    tl("周二"),
    tl("周三"),
    tl("周四"),
    tl("周五"),
    tl("周六"),
    tl("周日"),
  ]
  const max = Math.max(...collectionHeat.flat())
  // Align the five rows to calendar weeks covering the October reporting period.
  const first = new Date(year, Number(demoPeriod.slice(-2)) - 1, 1)
  const monday = 1 - ((first.getDay() + 6) % 7)
  const data = days.map((_, day) => ({
    bin: day,
    bins: collectionHeat.map((week, i) => ({
      bin: i,
      count: week[day]!,
      date: new Date(year, first.getMonth(), monday + 7 * i + day),
    })),
  }))

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
      <div className="overview-heatmap">
        <div aria-hidden="true" className="overview-heatmap-days">
          {days.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div aria-hidden="true" className="overview-heatmap-weeks">
          {collectionHeat.map((_, i) => (
            <span key={i}>{tl("第 {{value}} 周", { value: i + 1 })}</span>
          ))}
        </div>
        <BklitHeatmapChart
          layout="fill"
          data={data}
          margin={{ top: 0, left: 0, right: 0, bottom: 0 }}
          className="h-full"
          gap={3}
          colorScale={(v) =>
            `color-mix(in srgb, var(--chart-1) ${12 + ((v ?? 0) / max) * 88}%, var(--muted))`
          }
        >
          <HeatmapCells cornerRadius={4} />
          <HeatmapTooltip
            formatLabel={(count) => tl("{{count}} 个任务", { count })}
          />
        </BklitHeatmapChart>
      </div>
    </ChartCard>
  )
}

function ScatterChart() {
  const tl = useUiText()
  // The Bklit scatter series uses a time scale. Scaling hundredths to integers preserves the
  // linear spacing between bill amounts, including fractional amounts.
  const points = [...parseScatter].sort((a, b) => a.amount - b.amount)
  const data = points.map((p) => ({
    x: Math.round(p.amount * 100),
    [p.provider]: p.seconds,
  }))
  const labels = points.map((p) => String(p.amount))

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
      <ComposedChart
        data={data}
        xDataKey="x"
        className="h-full"
        aspectRatio="auto"
        margin={{ top: 10, right: 14, bottom: 26, left: 34 }}
      >
        <Grid horizontal />
        <YAxis numTicks={4} />
        <XAxis labels={labels} numTicks={4} />
        {providerSeries.map((s, i) => (
          <Scatter
            key={s.id}
            dataKey={s.id}
            fill={seriesColor(i)}
            radius={4.5}
          />
        ))}
        <ChartTooltip
          dateLabels={labels}
          showDatePill={false}
          content={({ index }) => {
            const p = points[index]!
            const i = providerSeries.findIndex((s) => s.id === p.provider)
            return (
              <TooltipContent
                title={tl(providerSeries[i]!.label)}
                rows={[
                  {
                    label: tl("金额（万元）"),
                    value: String(p.amount),
                    color: seriesColor(i),
                  },
                  {
                    label: tl("解析耗时（秒）"),
                    value: p.seconds,
                    color: seriesColor(i),
                  },
                ]}
              />
            )
          }}
        />
      </ComposedChart>
    </ChartCard>
  )
}

function GaugeChart() {
  const tl = useUiText()
  const { budget, used } = annualBudget
  const ratio = used / budget
  const tone = seriesColor(0)

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
      <div className="overview-gauge-layout">
        <div className="overview-gauge-ring">
          <RingChart
            size={156}
            startAngle={-Math.PI / 2}
            endAngle={Math.PI / 2}
            strokeWidth={12}
            baseInnerRadius={58}
            data={[
              {
                label: tl("已使用"),
                value: Number((ratio * 100).toFixed(1)),
                maxValue: 100,
                color: tone,
              },
            ]}
          >
            <Ring index={0} />
            <RingCenter
              formatOptions={{
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              }}
              defaultLabel={tl("使用率")}
              suffix="%"
            />
          </RingChart>
        </div>
        <span className="text-xs text-muted-foreground financial-number">
          {tl("已用 ¥{{used}} 万 / 预算 ¥{{budget}} 万", { used, budget })}
        </span>
      </div>
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
