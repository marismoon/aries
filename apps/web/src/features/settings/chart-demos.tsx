import { useState } from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  Sector,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Demo, useReplay } from "./motion-shared"

/** Categorical palette shared by every chart demo. The hues are soft and
 * bright, blended a little with the active theme's primary (--chart-soft-N in
 * motion-demos.css), so every palette and light/dark mode stays harmonious. */
export const chartPalette = Array.from(
  { length: 8 },
  (_, i) => `var(--chart-soft-${i + 1})`
)

const months = ["5月", "6月", "7月", "8月", "9月", "10月"]
const trend = months.map((name, i) => ({
  name,
  阿里云: [80, 94, 112, 106, 118, 129][i],
  腾讯云: [60, 72, 70, 88, 92, 101][i],
  华为云: [32, 40, 52, 49, 63, 70][i],
}))
const providers = ["阿里云", "腾讯云", "华为云"] as const

function useHidden() {
  const [hidden, setHidden] = useState<string[]>([])
  const toggle = (name: unknown) =>
    setHidden((current) =>
      current.includes(String(name))
        ? current.filter((item) => item !== name)
        : [...current, String(name)]
    )
  return { hidden, toggle, isHidden: (name: string) => hidden.includes(name) }
}

const tooltipStyle = {
  borderRadius: 14,
  border: "none",
  boxShadow: "var(--floating-shadow)",
  background: "var(--popover)",
  fontSize: 12,
}

const axis = { axisLine: false, tickLine: false, fontSize: 11 } as const

function Chart({ children }: { children: React.ReactElement }) {
  return (
    <div className="h-44 w-full">
      <ResponsiveContainer>{children}</ResponsiveContainer>
    </div>
  )
}

export function LineDemo() {
  const [run, replay] = useReplay()
  const { toggle, isHidden } = useHidden()
  return (
    <Demo
      title="折线图 Line"
      usage="每条线一个色相；点击图例显示/隐藏系列，悬停出现圆点，key 重新挂载即重播"
      onReplay={replay}
    >
      <Chart key={run}>
        <LineChart data={trend}>
          <CartesianGrid vertical={false} stroke="var(--border-subtle)" />
          <XAxis dataKey="name" {...axis} />
          <YAxis width={32} {...axis} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend
            iconType="circle"
            wrapperStyle={{ fontSize: 12, cursor: "pointer" }}
            onClick={(entry) => toggle(entry.dataKey)}
          />
          {providers.map((name, i) => (
            <Line
              key={name}
              type="monotone"
              dataKey={name}
              hide={isHidden(name)}
              stroke={chartPalette[i]}
              strokeWidth={3}
              strokeLinecap="round"
              dot={false}
              activeDot={{ r: 6, strokeWidth: 3, stroke: "var(--popover)" }}
              animationDuration={1000}
            />
          ))}
        </LineChart>
      </Chart>
    </Demo>
  )
}

export function AreaDemo() {
  const [run, replay] = useReplay()
  return (
    <Demo
      title="面积图 Area"
      usage="linearGradient 渐变填充，叠加 stackId 堆叠；颜色同折线图"
      onReplay={replay}
    >
      <Chart key={run}>
        <AreaChart data={trend}>
          <defs>
            {providers.map((name, i) => (
              <linearGradient
                key={name}
                id={`area-${name}`}
                x1="0"
                x2="0"
                y1="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor={chartPalette[i]}
                  stopOpacity={0.5}
                />
                <stop
                  offset="100%"
                  stopColor={chartPalette[i]}
                  stopOpacity={0.04}
                />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid vertical={false} stroke="var(--border-subtle)" />
          <XAxis dataKey="name" {...axis} />
          <YAxis width={32} {...axis} />
          <Tooltip contentStyle={tooltipStyle} />
          {providers.map((name, i) => (
            <Area
              key={name}
              type="monotone"
              dataKey={name}
              stackId="1"
              stroke={chartPalette[i]}
              strokeWidth={2}
              fill={`url(#area-${name})`}
              animationDuration={1000}
            />
          ))}
        </AreaChart>
      </Chart>
    </Demo>
  )
}

export function ColorBarDemo() {
  const [run, replay] = useReplay()
  const [active, setActive] = useState<number | null>(null)
  const data = months.map((name, i) => ({ name, value: trend[i]!.阿里云 }))
  return (
    <Demo
      title="柱状图 Bar"
      usage="点击柱子选中，其余变淡并显示数值；再点一次取消。圆角柱 + 自下而上生长"
      onReplay={replay}
    >
      <div className="grid w-full gap-1">
        <Chart key={run}>
          <BarChart data={data} onClick={() => undefined}>
            <CartesianGrid vertical={false} stroke="var(--border-subtle)" />
            <XAxis dataKey="name" {...axis} />
            <YAxis width={32} {...axis} />
            <Tooltip
              contentStyle={tooltipStyle}
              cursor={false}
              formatter={(value) => [`¥${String(value)}万`, "出账"]}
            />
            <Bar
              dataKey="value"
              radius={[10, 10, 10, 10]}
              maxBarSize={34}
              animationDuration={800}
              cursor="pointer"
              onClick={(_, index) =>
                setActive((current) => (current === index ? null : index))
              }
            >
              {data.map((item, i) => (
                <Cell
                  key={item.name}
                  fill={chartPalette[i]}
                  fillOpacity={active === null || active === i ? 1 : 0.28}
                  style={{ transition: "fill-opacity 200ms" }}
                />
              ))}
            </Bar>
          </BarChart>
        </Chart>
        <p className="h-4 text-center text-xs text-muted-foreground">
          {active === null
            ? "点击柱子查看数值"
            : `${data[active]!.name} · ¥${data[active]!.value}万`}
        </p>
      </div>
    </Demo>
  )
}

export function StackedBarDemo() {
  const [run, replay] = useReplay()
  const { toggle, isHidden } = useHidden()
  return (
    <Demo
      title="堆叠柱状图 Stacked Bar"
      usage="多个 Bar 共用 stackId，圆角加描边分隔；点击图例切换系列"
      onReplay={replay}
    >
      <Chart key={run}>
        <BarChart data={trend}>
          <CartesianGrid vertical={false} stroke="var(--border-subtle)" />
          <XAxis dataKey="name" {...axis} />
          <YAxis width={32} {...axis} />
          <Tooltip contentStyle={tooltipStyle} cursor={false} />
          <Legend
            iconType="circle"
            wrapperStyle={{ fontSize: 12, cursor: "pointer" }}
            onClick={(entry) => toggle(entry.dataKey)}
          />
          {providers.map((name, i) => (
            <Bar
              key={name}
              dataKey={name}
              hide={isHidden(name)}
              stackId="s"
              maxBarSize={34}
              fill={chartPalette[i]}
              stroke="var(--popover)"
              strokeWidth={2}
              radius={8}
              animationDuration={800}
            />
          ))}
        </BarChart>
      </Chart>
    </Demo>
  )
}

const share = [
  { name: "阿里云", value: 412 },
  { name: "腾讯云", value: 288 },
  { name: "华为云", value: 172 },
  { name: "AWS", value: 134 },
  { name: "Azure", value: 96 },
]

export function PieDemo() {
  const [run, replay] = useReplay()
  const [active, setActive] = useState<number | null>(null)
  const total = share.reduce((sum, item) => sum + item.value, 0)
  return (
    <Demo
      title="饼图 / 环形图 Pie"
      usage="点击扇区弹出并显示占比，再点取消；innerRadius 为 0 是饼图，大于 0 是环形"
      onReplay={replay}
    >
      <div className="grid w-full grid-cols-2 gap-2">
        {[0, 46].map((inner) => (
          <div key={`${run}-${inner}`} className="relative">
            <Chart>
              <PieChart>
                <Tooltip contentStyle={tooltipStyle} />
                <Pie
                  data={share}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={inner}
                  outerRadius={64}
                  paddingAngle={inner ? 4 : 2}
                  cornerRadius={inner ? 8 : 6}
                  stroke="var(--popover)"
                  strokeWidth={inner ? 0 : 2}
                  animationDuration={900}
                  cursor="pointer"
                  onClick={(_, index) =>
                    setActive((current) => (current === index ? null : index))
                  }
                  shape={(props) => {
                    const sector = props as unknown as React.ComponentProps<
                      typeof Sector
                    > & { index: number }
                    const picked = active === sector.index
                    return (
                      <Sector
                        {...sector}
                        outerRadius={
                          (sector.outerRadius ?? 0) + (picked ? 10 : 0)
                        }
                        fill={chartPalette[sector.index]}
                        fillOpacity={active === null || picked ? 1 : 0.35}
                        style={{ transition: "fill-opacity 200ms" }}
                      />
                    )
                  }}
                />
              </PieChart>
            </Chart>
            {inner > 0 && (
              <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
                <div>
                  <p className="text-[11px] text-muted-foreground">
                    {active === null ? "合计" : share[active]!.name}
                  </p>
                  <p className="text-sm font-semibold tabular-nums">
                    {active === null
                      ? total
                      : `${Math.round((share[active]!.value / total) * 100)}%`}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Demo>
  )
}

const radar = [
  { name: "采集", 阿里云: 96, 腾讯云: 82 },
  { name: "解析", 阿里云: 88, 腾讯云: 91 },
  { name: "核对", 阿里云: 79, 腾讯云: 74 },
  { name: "归档", 阿里云: 92, 腾讯云: 85 },
  { name: "开票", 阿里云: 70, 腾讯云: 88 },
]

export function RadarDemo() {
  const [run, replay] = useReplay()
  const { toggle, isHidden } = useHidden()
  return (
    <Demo
      title="雷达图 Radar"
      usage="多条 Radar 叠加对比，半透明填充 + 同色描边"
      onReplay={replay}
    >
      <Chart key={run}>
        <RadarChart data={radar} outerRadius={56} margin={{ bottom: 8 }}>
          <PolarGrid stroke="var(--border)" />
          <PolarAngleAxis dataKey="name" fontSize={11} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend
            iconType="circle"
            wrapperStyle={{ fontSize: 12, cursor: "pointer" }}
            onClick={(entry) => toggle(entry.dataKey)}
          />
          {(["阿里云", "腾讯云"] as const).map((name, i) => (
            <Radar
              key={name}
              hide={isHidden(name)}
              dataKey={name}
              stroke={chartPalette[i * 2]}
              fill={chartPalette[i * 2]}
              fillOpacity={0.28}
              strokeWidth={2}
              animationDuration={900}
            />
          ))}
        </RadarChart>
      </Chart>
    </Demo>
  )
}
