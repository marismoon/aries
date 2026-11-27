import {
  Bar,
  BarChart,
  BarXAxis,
  ChartTooltip,
  TooltipContent,
} from "@marismoon/ui/charts"
import { formatCurrency, formatWan } from "@marismoon/ui/lib/format"
import { useUiText } from "@/lib/i18n/use-ui-text"
import { issuedTrend } from "@/shared/mocks/overview"

export function IssuedTrendPlot({ className }: { className: string }) {
  const tl = useUiText()
  const data = issuedTrend.map(({ month, amount }, i) => ({
    month: tl(month),
    amount,
    previous: i === issuedTrend.length - 1 ? 0 : amount,
    current: i === issuedTrend.length - 1 ? amount : 0,
  }))

  return (
    <div className={className}>
      <BarChart
        data={data}
        aspectRatio="auto"
        className="h-full"
        xDataKey="month"
        stacked
        margin={{ top: 18, left: 2, right: 2, bottom: 22 }}
      >
        <BarXAxis />
        <Bar
          dataKey="previous"
          fill="color-mix(in srgb, var(--chart-1) 38%, transparent)"
          lineCap="round"
          showValue
          valueLabelColor="var(--muted-foreground)"
          valueLabelFormatter={(v) => formatWan(v)}
        />
        <Bar
          dataKey="current"
          fill="var(--chart-1)"
          lineCap="round"
          showValue
          valueLabelColor="var(--foreground)"
          valueLabelFormatter={(v) => formatWan(v)}
        />
        <ChartTooltip
          showDatePill={false}
          content={({ point }) => (
            <TooltipContent
              title={typeof point.month === "string" ? point.month : ""}
              rows={[
                {
                  label: tl("出账金额（CNY 万元）"),
                  color: "var(--chart-1)",
                  value: `¥${formatWan(Number(point.amount ?? 0))} ${tl("万")}`,
                },
              ]}
            />
          )}
        />
      </BarChart>
      <ul className="sr-only" aria-label={tl("各月出账金额")}>
        {data.map((d) => (
          <li key={d.month}>
            {d.month} · {formatCurrency(d.amount, "CNY")}
          </li>
        ))}
      </ul>
    </div>
  )
}
