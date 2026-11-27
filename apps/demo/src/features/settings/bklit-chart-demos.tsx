import { useEffect, useMemo, useState, type ReactNode } from "react"

import {
  Area,
  AreaChart,
  AreaSparkline,
  Bar,
  BarChart,
  BarLollipop,
  BarSparkline,
  BarXAxis,
  ChartTooltip,
  ComposedChart,
  FunnelChart,
  Grid,
  HeatmapCells,
  HeatmapChart,
  HeatmapLegend,
  HeatmapTooltip,
  Line,
  LineChart,
  LineSparkline,
  LiveLine,
  LiveLineChart,
  LiveXAxis,
  LiveYAxis,
  type LiveLinePoint,
  PieCenter,
  PieChart,
  PieSlice,
  RadarArea,
  RadarAxis,
  RadarChart,
  RadarGrid,
  RadarLabels,
  Ring,
  RingCenter,
  RingChart,
  SeriesBar,
  useSparklineHover,
  XAxis,
  YAxis,
} from "@marismoon/ui/charts"
import { SolarRefreshCcw } from "@marismoon/ui/icons"
import { Button } from "@marismoon/ui/ui/button"
import { Card, CardContent, CardTitle } from "@marismoon/ui/ui/card"
import { useUiText } from "@/lib/i18n/use-ui-text"
import "./components-preview.css"

function useSeriesRows(
  rows: Record<string, unknown>[],
  tl: ReturnType<typeof useUiText>
) {
  return useMemo(
    () =>
      rows.map((row) => {
        const translated: Record<string, unknown> = {}
        for (const [key, value] of Object.entries(row)) {
          const seriesKey = /\p{Script=Han}/u.test(key) ? tl(key) : key
          translated[seriesKey] = typeof value === "string" ? tl(value) : value
        }
        return translated
      }),
    [rows, tl]
  )
}

function useChartLabels<T extends { label: string }>(rows: T[]) {
  const tl = useUiText()
  return useMemo(
    () => rows.map((row) => ({ ...row, label: tl(row.label) })),
    [rows, tl]
  )
}

function useReplay() {
  const [run, setRun] = useState(0)
  return [run, () => setRun((v) => v + 1)] as const
}

/** Single-layer flat card for Bklit chart demos (no nested inner cards). */
function BklitDemoCard({
  title,
  usage,
  onReplay,
  wide = false,
  children,
}: {
  title: string
  usage: string
  onReplay: () => void
  wide?: boolean
  children: ReactNode
}) {
  const tl = useUiText()
  return (
    <Card className="surface component-card" data-wide={wide ? "" : undefined}>
      <div className="flex items-center justify-between gap-2">
        <CardTitle className="text-sm">{tl(title)}</CardTitle>
        <Button variant="outline" onClick={onReplay}>
          <SolarRefreshCcw data-icon="inline-start" />
          {tl("重播")}
        </Button>
      </div>
      <CardContent className="grid grid-cols-[minmax(0,1fr)] gap-3 p-0">
        <div className="min-w-0">{children}</div>
        <p className="text-xs text-muted-foreground">
          {tl("用法：")}
          {tl(usage)}
        </p>
      </CardContent>
    </Card>
  )
}

/* ---------- Mock datasets ---------- */

const timeSeriesData = Array.from({ length: 14 }, (_, i) => {
  const date = new Date(2026, 9, 1 + i * 2)
  const aliyun = [
    92, 98, 105, 102, 114, 121, 118, 128, 134, 131, 142, 149, 146, 158,
  ][i]!
  const tencent = [64, 68, 72, 75, 79, 84, 82, 90, 95, 92, 99, 104, 108, 114][
    i
  ]!
  const huawei = [34, 38, 41, 44, 48, 52, 50, 56, 59, 62, 65, 68, 71, 76][i]!
  return { date, 阿里云: aliyun, 腾讯云: tencent, 华为云: huawei }
})

const revenueCostData = Array.from({ length: 12 }, (_, i) => ({
  date: new Date(2026, i, 1),
  营收: [320, 352, 390, 378, 426, 468, 495, 512, 548, 590, 624, 672][i]!,
  成本: [184, 196, 210, 205, 224, 240, 248, 255, 268, 282, 294, 310][i]!,
}))

const monthlyBarData = [
  { month: "5月", 阿里云: 96, 腾讯云: 68, 华为云: 38 },
  { month: "6月", 阿里云: 108, 腾讯云: 74, 华为云: 44 },
  { month: "7月", 阿里云: 118, 腾讯云: 79, 华为云: 49 },
  { month: "8月", 阿里云: 112, 腾讯云: 86, 华为云: 53 },
  { month: "9月", 阿里云: 132, 腾讯云: 94, 华为云: 61 },
  { month: "10月", 阿里云: 148, 腾讯云: 106, 华为云: 70 },
]

const composedData = Array.from({ length: 10 }, (_, i) => ({
  date: new Date(2026, 9, 2 + i * 3),
  账单量: [420, 480, 460, 540, 590, 560, 630, 680, 650, 740][i]!,
  出账额: [180, 215, 205, 260, 295, 285, 330, 368, 355, 412][i]!,
}))

const providerShareData = [
  { label: "阿里云", value: 412, color: "var(--chart-1)" },
  { label: "腾讯云", value: 288, color: "var(--chart-2)" },
  { label: "华为云", value: 172, color: "var(--chart-3)" },
  { label: "AWS", value: 134, color: "var(--chart-4)" },
  { label: "Azure", value: 96, color: "var(--chart-5)" },
]

const ringTargetData = [
  { label: "采集完成率", value: 94, maxValue: 100, color: "var(--chart-1)" },
  { label: "预算执行率", value: 78, maxValue: 100, color: "var(--chart-2)" },
  { label: "告警响应 SLA", value: 89, maxValue: 100, color: "var(--chart-3)" },
]

const radarMetrics = [
  { key: "collect", label: "采集" },
  { key: "parse", label: "解析" },
  { key: "verify", label: "核对" },
  { key: "archive", label: "归档" },
  { key: "invoice", label: "开票" },
]

const radarSeries = [
  {
    label: "本月",
    color: "var(--chart-1)",
    values: { collect: 96, parse: 91, verify: 86, archive: 94, invoice: 82 },
  },
  {
    label: "上月",
    color: "var(--chart-3)",
    values: { collect: 84, parse: 88, verify: 76, archive: 85, invoice: 78 },
  },
]

const funnelStages = [
  { label: "访问", value: 120000, color: "var(--chart-1)" },
  { label: "注册", value: 64200, color: "var(--chart-2)" },
  { label: "试用", value: 31800, color: "var(--chart-3)" },
  { label: "付费", value: 11400, color: "var(--chart-4)" },
]

const lollipopData = [
  { service: "API 网关", 延迟: 42 },
  { service: "账单解析", 延迟: 128 },
  { service: "成本聚合", 延迟: 94 },
  { service: "告警引擎", 延迟: 36 },
  { service: "报表导出", 延迟: 164 },
  { service: "权限校验", 延迟: 24 },
]

const heatmapColumns = Array.from({ length: 16 }, (_, week) => ({
  bin: week,
  bins: Array.from({ length: 7 }, (_, day) => {
    const date = new Date(2026, 7, 3 + week * 7 + day)
    const count =
      ((week * 7 + day * 5 + (week % 3) * 4) % 18) + (day < 5 ? 3 : 0)
    return { bin: day, count, date }
  }),
}))

const sparkDau = [
  { label: "11/13", value: 12400 },
  { label: "11/14", value: 13100 },
  { label: "11/15", value: 12850 },
  { label: "11/16", value: 14200 },
  { label: "11/17", value: 15100 },
  { label: "11/18", value: 14800 },
  { label: "11/19", value: 16300 },
  { label: "11/20", value: 17150 },
  { label: "11/21", value: 16900 },
  { label: "11/22", value: 18420 },
]

const sparkQps = [
  { label: "00:00", value: 820 },
  { label: "03:00", value: 640 },
  { label: "06:00", value: 910 },
  { label: "09:00", value: 1680 },
  { label: "12:00", value: 2140 },
  { label: "15:00", value: 2490 },
  { label: "18:00", value: 2310 },
  { label: "21:00", value: 1890 },
  { label: "23:00", value: 1420 },
]

const sparkErrors = [
  { label: "周一", value: 18 },
  { label: "周二", value: 12 },
  { label: "周三", value: 26 },
  { label: "周四", value: 9 },
  { label: "周五", value: 14 },
  { label: "周六", value: 6 },
  { label: "周日", value: 8 },
]

/* ---------- Bklit Chart Demos (12 everyday data/analytics charts) ---------- */

export function BklitLineDemo() {
  const tl = useUiText()
  const rows = useSeriesRows(timeSeriesData, tl)
  const [run, replay] = useReplay()
  return (
    <BklitDemoCard
      title="折线图 Line"
      usage="Bklit LineChart + Line + ChartTooltip；原生 SVG 描边入场，悬停高亮当前区间并平滑跟随"
      onReplay={replay}
    >
      <LineChart
        key={run}
        data={rows}
        aspectRatio="2.2 / 1"
        margin={{ top: 16, right: 16, bottom: 28, left: 36 }}
      >
        <Grid horizontal />
        <YAxis numTicks={4} />
        <XAxis numTicks={5} />
        <Line
          dataKey={tl("阿里云")}
          stroke="var(--chart-1)"
          strokeWidth={2.2}
        />
        <Line
          dataKey={tl("腾讯云")}
          stroke="var(--chart-2)"
          strokeWidth={2.2}
        />
        <Line
          dataKey={tl("华为云")}
          stroke="var(--chart-3)"
          strokeWidth={2.2}
        />
        <ChartTooltip />
      </LineChart>
    </BklitDemoCard>
  )
}

export function BklitAreaDemo() {
  const tl = useUiText()
  const rows = useSeriesRows(revenueCostData, tl)
  const [run, replay] = useReplay()
  return (
    <BklitDemoCard
      title="面积图 Area"
      usage="Bklit AreaChart + Area；多系列平滑渐变面积，悬停时非聚焦线自动降暗并突出当前段"
      onReplay={replay}
    >
      <AreaChart
        key={run}
        data={rows}
        aspectRatio="2.2 / 1"
        margin={{ top: 16, right: 16, bottom: 28, left: 36 }}
      >
        <Grid horizontal />
        <YAxis numTicks={4} />
        <XAxis numTicks={6} />
        <Area dataKey={tl("营收")} fill="var(--chart-1)" fillOpacity={0.34} />
        <Area dataKey={tl("成本")} fill="var(--chart-2)" fillOpacity={0.28} />
        <ChartTooltip />
      </AreaChart>
    </BklitDemoCard>
  )
}

export function BklitBarDemo() {
  const tl = useUiText()
  const rows = useSeriesRows(monthlyBarData, tl)
  const [run, replay] = useReplay()
  return (
    <BklitDemoCard
      title="柱状图 Bar"
      usage="Bklit BarChart + Bar；自底向上平滑生长，悬停单柱时其余柱子平滑退让"
      onReplay={replay}
    >
      <BarChart
        key={run}
        data={rows}
        xDataKey="month"
        aspectRatio="2.2 / 1"
        margin={{ top: 16, right: 16, bottom: 28, left: 36 }}
      >
        <Grid horizontal />
        <YAxis numTicks={4} />
        <BarXAxis />
        <Bar dataKey={tl("阿里云")} fill="var(--chart-1)" lineCap="round" />
        <Bar dataKey={tl("腾讯云")} fill="var(--chart-2)" lineCap="round" />
        <ChartTooltip />
      </BarChart>
    </BklitDemoCard>
  )
}

export function BklitStackedBarDemo() {
  const tl = useUiText()
  const rows = useSeriesRows(monthlyBarData, tl)
  const [run, replay] = useReplay()
  return (
    <BklitDemoCard
      title="堆叠柱状图 Stacked Bar"
      usage="Bklit BarChart stacked 模式；多云账单构成按月堆叠，支持实时悬停汇总"
      onReplay={replay}
    >
      <BarChart
        key={run}
        data={rows}
        xDataKey="month"
        stacked
        stackGap={3}
        aspectRatio="2.2 / 1"
        margin={{ top: 16, right: 16, bottom: 28, left: 36 }}
      >
        <Grid horizontal />
        <YAxis numTicks={4} />
        <BarXAxis />
        <Bar dataKey={tl("阿里云")} fill="var(--chart-1)" lineCap="round" />
        <Bar dataKey={tl("腾讯云")} fill="var(--chart-2)" lineCap="round" />
        <Bar dataKey={tl("华为云")} fill="var(--chart-3)" lineCap="round" />
        <ChartTooltip />
      </BarChart>
    </BklitDemoCard>
  )
}

export function BklitComposedDemo() {
  const tl = useUiText()
  const rows = useSeriesRows(composedData, tl)
  const [run, replay] = useReplay()
  return (
    <BklitDemoCard
      title="组合图 Composed"
      usage="Bklit ComposedChart + SeriesBar + Line；柱状体量与折线趋势同屏联动"
      onReplay={replay}
    >
      <ComposedChart
        key={run}
        data={rows}
        aspectRatio="2.2 / 1"
        margin={{ top: 16, right: 16, bottom: 28, left: 36 }}
      >
        <Grid horizontal />
        <YAxis numTicks={4} />
        <XAxis numTicks={5} />
        <SeriesBar
          dataKey={tl("账单量")}
          fill="color-mix(in srgb, var(--chart-2) 38%, transparent)"
          stroke="var(--chart-2)"
          radius={6}
        />
        <Line
          dataKey={tl("出账额")}
          stroke="var(--chart-1)"
          strokeWidth={2.4}
        />
        <ChartTooltip />
      </ComposedChart>
    </BklitDemoCard>
  )
}

export function BklitPieDemo() {
  const tl = useUiText()
  const rows = useChartLabels(providerShareData)
  const [run, replay] = useReplay()
  return (
    <BklitDemoCard
      title="饼图 / 环形图 Pie"
      usage="Bklit PieChart + PieSlice + PieCenter；原生 SVG 弧形无锯齿，悬停扇区弹性外移并切换中心汇总"
      onReplay={replay}
    >
      <div className="flex items-center justify-center py-1">
        <PieChart
          key={run}
          data={rows}
          size={212}
          innerRadius={62}
          padAngle={0.03}
          cornerRadius={6}
        >
          {providerShareData.map((item, index) => (
            <PieSlice key={item.label} index={index} hoverEffect="grow" />
          ))}
          <PieCenter defaultLabel={tl("总计（万）")} />
        </PieChart>
      </div>
    </BklitDemoCard>
  )
}

export function BklitRingDemo() {
  const tl = useUiText()
  const rows = useChartLabels(ringTargetData)
  const [run, replay] = useReplay()
  return (
    <BklitDemoCard
      title="多环进度图 Ring"
      usage="Bklit RingChart + Ring + RingCenter；多维度 SLA 与预算达标进度同心环展示"
      onReplay={replay}
    >
      <div className="flex items-center justify-center py-1">
        <RingChart
          key={run}
          data={rows}
          size={212}
          strokeWidth={12}
          ringGap={7}
          baseInnerRadius={48}
        >
          {ringTargetData.map((item, index) => (
            <Ring key={item.label} index={index} />
          ))}
          <RingCenter defaultLabel={tl("核心指标")} suffix="%" />
        </RingChart>
      </div>
    </BklitDemoCard>
  )
}

export function BklitRadarDemo() {
  const rows = useChartLabels(radarSeries)
  const metrics = useChartLabels(radarMetrics)
  const [run, replay] = useReplay()
  return (
    <BklitDemoCard
      title="雷达图 Radar"
      usage="Bklit RadarChart；多阶段入场（网格→轴线→标签→多边形），悬停高亮单组能力评估"
      onReplay={replay}
    >
      <div className="flex items-center justify-center py-1">
        <RadarChart
          key={run}
          data={rows}
          metrics={metrics}
          size={224}
          levels={4}
          margin={42}
        >
          <RadarGrid />
          <RadarAxis />
          <RadarLabels />
          {radarSeries.map((series, index) => (
            <RadarArea key={series.label} index={index} />
          ))}
        </RadarChart>
      </div>
    </BklitDemoCard>
  )
}

export function BklitFunnelDemo() {
  const rows = useChartLabels(funnelStages)
  const [run, replay] = useReplay()
  return (
    <BklitDemoCard
      title="转化漏斗图 Funnel"
      usage="Bklit FunnelChart；多层光环错峰展开，悬停单段弹性放大并降暗其余阶段"
      onReplay={replay}
    >
      <FunnelChart
        key={run}
        data={rows}
        orientation="horizontal"
        layers={3}
        gap={6}
      />
    </BklitDemoCard>
  )
}

export function BklitLollipopDemo() {
  const tl = useUiText()
  const rows = useSeriesRows(lollipopData, tl)
  const [run, replay] = useReplay()
  return (
    <BklitDemoCard
      title="棒棒糖图 Bar Lollipop"
      usage="Bklit BarChart + BarLollipop；适合接口延迟、耗时排行等稀疏高对比指标"
      onReplay={replay}
    >
      <BarChart
        key={run}
        data={rows}
        xDataKey="service"
        aspectRatio="2.2 / 1"
        margin={{ top: 16, right: 16, bottom: 28, left: 36 }}
      >
        <Grid horizontal />
        <YAxis numTicks={4} />
        <BarXAxis />
        <BarLollipop dataKey={tl("延迟")} fill="var(--chart-4)" />
        <ChartTooltip showCrosshair={false} showDots={false} />
      </BarChart>
    </BklitDemoCard>
  )
}

export function BklitHeatmapDemo() {
  const tl = useUiText()
  const [run, replay] = useReplay()
  return (
    <BklitDemoCard
      title="热力图 Heatmap"
      usage="Bklit HeatmapChart + HeatmapCells + HeatmapTooltip；按周分布活跃度热力与色阶图例"
      onReplay={replay}
    >
      <div className="grid gap-3">
        <HeatmapChart key={run} data={heatmapColumns} layout="fluid">
          <HeatmapCells cornerRadius={4} />
          <HeatmapTooltip
            formatLabel={(count) => tl("{{count}} 次采集任务", { count })}
          />
        </HeatmapChart>
        <HeatmapLegend
          variant="gradient"
          lessLabel={tl("少")}
          moreLabel={tl("多")}
        />
      </div>
    </BklitDemoCard>
  )
}

export function BklitSparklineDemo() {
  const tl = useUiText()
  const [run, replay] = useReplay()
  const dauHover = useSparklineHover<(typeof sparkDau)[number]>()
  const qpsHover = useSparklineHover<(typeof sparkQps)[number]>()
  const errHover = useSparklineHover<(typeof sparkErrors)[number]>()

  const dauPoint = dauHover.datum ?? sparkDau.at(-1)!
  const qpsPoint = qpsHover.datum ?? sparkQps.at(-1)!
  const errPoint = errHover.datum ?? sparkErrors.at(-1)!

  return (
    <BklitDemoCard
      title="迷你趋势图 Sparkline"
      usage="Bklit Line / Area / Bar Sparkline + useSparklineHover；无坐标轴轻量嵌入，悬停实时联动数值"
      onReplay={replay}
    >
      <div className="divide-y divide-border/60">
        <div className="flex items-center justify-between gap-4 py-2.5 first:pt-0">
          <div className="min-w-28">
            <p className="text-xs text-muted-foreground">
              {tl("日活用户")} · {dauPoint.label}
            </p>
            <p className="text-base font-semibold tabular-nums">
              {dauPoint.value.toLocaleString("en-US")}
            </p>
          </div>
          <div className="min-w-0 flex-1">
            <AreaSparkline
              key={`dau-${run}`}
              data={sparkDau}
              dataKey="value"
              color="var(--chart-1)"
              height={40}
              {...dauHover.sparklineProps}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 py-2.5">
          <div className="min-w-28">
            <p className="text-xs text-muted-foreground">
              {tl("网关 QPS")} · {qpsPoint.label}
            </p>
            <p className="text-base font-semibold tabular-nums">
              {qpsPoint.value.toLocaleString("en-US")}
            </p>
          </div>
          <div className="min-w-0 flex-1">
            <LineSparkline
              key={`qps-${run}`}
              data={sparkQps}
              dataKey="value"
              color="var(--chart-2)"
              height={40}
              {...qpsHover.sparklineProps}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 py-2.5 last:pb-0">
          <div className="min-w-28">
            <p className="text-xs text-muted-foreground">
              {tl("异常告警")} · {tl(errPoint.label)}
            </p>
            <p className="text-base font-semibold tabular-nums">
              {tl("{{count}} 次", { count: errPoint.value })}
            </p>
          </div>
          <div className="min-w-0 flex-1">
            <BarSparkline
              key={`err-${run}`}
              data={sparkErrors}
              dataKey="value"
              color="var(--chart-3)"
              height={40}
              barRadius={4}
              {...errHover.sparklineProps}
            />
          </div>
        </div>
      </div>
    </BklitDemoCard>
  )
}

/**
 * Bklit Sparkline - KPI cards (three standalone single-layer cards, no outer
 * wrapper card so there is zero card-in-card nesting).
 */
export function BklitSparklineKpiCardsDemo() {
  const tl = useUiText()
  const dauHover = useSparklineHover<(typeof sparkDau)[number]>()
  const qpsHover = useSparklineHover<(typeof sparkQps)[number]>()
  const errHover = useSparklineHover<(typeof sparkErrors)[number]>()

  const dauPoint = dauHover.datum ?? sparkDau.at(-1)!
  const qpsPoint = qpsHover.datum ?? sparkQps.at(-1)!
  const errPoint = errHover.datum ?? sparkErrors.at(-1)!

  return (
    <div
      className="col-span-full grid grid-cols-1 gap-3 md:grid-cols-3"
      role="group"
      aria-label={tl("Sparkline KPI 指标卡")}
    >
      <Card className="surface component-card">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">
              {tl("日活用户")} · {dauPoint.label}
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">
              {dauPoint.value.toLocaleString("en-US")}
            </p>
          </div>
          <span className="rounded-full bg-(--success-bg) px-2 py-0.5 text-xs font-medium text-(--success) tabular-nums">
            +14.2%
          </span>
        </div>
        <AreaSparkline
          data={sparkDau}
          dataKey="value"
          color="var(--chart-1)"
          height={56}
          {...dauHover.sparklineProps}
        />
      </Card>

      <Card className="surface component-card">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">
              {tl("网关吞吐 QPS")} · {qpsPoint.label}
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">
              {qpsPoint.value.toLocaleString("en-US")}
            </p>
          </div>
          <span className="rounded-full bg-(--info-bg) px-2 py-0.5 text-xs font-medium text-(--info) tabular-nums">
            +8.6%
          </span>
        </div>
        <LineSparkline
          data={sparkQps}
          dataKey="value"
          color="var(--chart-2)"
          height={56}
          {...qpsHover.sparklineProps}
        />
      </Card>

      <Card className="surface component-card">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">
              {tl("每日异常告警")} · {tl(errPoint.label)}
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">
              {errPoint.value}
            </p>
          </div>
          <span className="rounded-full bg-(--success-bg) px-2 py-0.5 text-xs font-medium text-(--success) tabular-nums">
            -33.3%
          </span>
        </div>
        <BarSparkline
          data={sparkErrors}
          dataKey="value"
          color="var(--chart-3)"
          height={56}
          barRadius={4}
          {...errHover.sparklineProps}
        />
      </Card>
    </div>
  )
}

function createInitialLivePoints(): LiveLinePoint[] {
  const now = Date.now() / 1000
  let v = 168
  return Array.from({ length: 24 }, (_, i) => {
    const delta = Math.sin(i * 0.65) * 4.2 + ((i % 3) - 1) * 1.4
    v = Math.max(120, Math.min(220, v + delta))
    return { time: now - (23 - i), value: Number(v.toFixed(2)) }
  })
}

/**
 * Bklit Live Line Chart: real-time streaming line with sliding window,
 * pulsing tip dot, animated axes, and pause/resume control (single-layer card).
 */
export function BklitLiveLineDemo() {
  const tl = useUiText()
  const [points, setPoints] = useState<LiveLinePoint[]>(createInitialLivePoints)
  const [paused, setPaused] = useState(false)
  const latestValue = points.at(-1)?.value ?? 168

  useEffect(() => {
    if (paused) return
    const id = window.setInterval(() => {
      setPoints((prev) => {
        const last = prev.at(-1)?.value ?? 168
        const step = (Math.random() - 0.48) * 7.5
        const next = Number(
          Math.max(120, Math.min(220, last + step)).toFixed(2)
        )
        return [...prev.slice(-120), { time: Date.now() / 1000, value: next }]
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [paused])

  return (
    <Card className="surface component-card" data-wide="">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <CardTitle className="text-sm">
            {tl("实时流折线图 Live Line")}
          </CardTitle>
          <span className="rounded-full bg-(--success-bg) px-2 py-0.5 text-xs font-medium text-(--success) tabular-nums">
            {paused ? tl("已暂停") : `${latestValue.toFixed(1)} ms`}
          </span>
        </div>
        <Button variant="outline" onClick={() => setPaused((v) => !v)}>
          {paused ? tl("继续流式更新") : tl("暂停更新")}
        </Button>
      </div>
      <CardContent className="grid grid-cols-[minmax(0,1fr)] gap-3 p-0">
        <div className="h-64 min-w-0">
          <LiveLineChart
            data={points}
            value={latestValue}
            window={30}
            nowOffsetUnits={1}
            paused={paused}
            margin={{ top: 18, right: 56, bottom: 30, left: 48 }}
          >
            <LiveLine
              dataKey="value"
              stroke="var(--chart-1)"
              formatValue={(v) => `${v.toFixed(1)} ms`}
            />
            <ChartTooltip showDatePill={false} />
            <LiveXAxis />
            <LiveYAxis
              position="left"
              formatValue={(v) => `${Math.round(v)} ms`}
            />
          </LiveLineChart>
        </div>
        <p className="text-xs text-muted-foreground">
          {tl("用法：")}
          {tl(
            "Bklit LiveLineChart + LiveLine + LiveXAxis / LiveYAxis；30 秒滑动时间窗、实时脉动端点与暂停巡检"
          )}
        </p>
      </CardContent>
    </Card>
  )
}
