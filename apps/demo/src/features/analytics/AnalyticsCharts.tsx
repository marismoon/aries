import {
  TrendPlot,
  RankingPlot,
  seriesColor,
} from "@/shared/charts/BusinessPlots"
import { demoPeriod } from "@/shared/mocks/period"

import { FrostCard } from "@marismoon/ui/shared/FrostCard"
import { useUiText } from "@/lib/i18n/use-ui-text"

import "../overview/components/overview-charts.css"

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
  const dates = labels.map((label) =>
    Date.parse(`${demoPeriod.slice(0, 4)}-${label.replace("/", "-")}T00:00:00Z`)
  )
  return (
    <FrostCard className="chart-card" role="group" aria-label={title}>
      <header className="chart-card-header">
        <h2>{title}</h2>
        <p>{description}</p>
      </header>
      <div className="chart-plot" role="img" aria-label={title}>
        <TrendPlot
          dates={dates}
          labels={[...labels]}
          series={series.map((s) => ({ ...s, label: tl(s.label) }))}
          unit={unit}
        />
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
  return (
    <FrostCard className="chart-card" role="group" aria-label={title}>
      <header className="chart-card-header">
        <h2>{title}</h2>
        <p>{description}</p>
      </header>
      <div className="chart-plot" role="img" aria-label={title}>
        <RankingPlot
          items={items.map((item) => ({ ...item, label: tl(item.label) }))}
          unit={unit}
        />
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
