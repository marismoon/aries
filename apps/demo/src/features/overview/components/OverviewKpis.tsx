import { IssuedTrendPlot } from "@/shared/charts/IssuedTrendPlot"
import type { CSSProperties, ReactNode } from "react"

import { AppIcon, SolarCheck } from "@marismoon/ui/icons"
import { FrostCard } from "@marismoon/ui/shared/FrostCard"
import { StatusBadge } from "@marismoon/ui/shared/StatusBadge"
import { formatWan } from "@marismoon/ui/lib/format"
import {
  collectionChannels,
  collectionStates,
  dashboardMetrics,
  issuedTrend,
} from "@/shared/mocks/overview"
import { demoPeriod } from "@/shared/mocks/period"

import "./overview-metrics.css"
import { useUiText } from "@/lib/i18n/use-ui-text"

const changeFormat = new Intl.NumberFormat("zh-CN", {
  style: "percent",
  maximumFractionDigits: 1,
  signDisplay: "exceptZero",
})
const maxIssued = Math.max(...issuedTrend.map(({ amount }) => amount))
const previousIssued = issuedTrend.at(-2)?.amount ?? dashboardMetrics.issued
const monthInYear = Number(demoPeriod.slice(-2))

function WanValue({ amount }: { amount: number }) {
  const tl = useUiText()

  return (
    <>
      ¥{formatWan(amount)}
      <span className="overview-kpi-unit">{tl("万")}</span>
    </>
  )
}

function IssuedKpi() {
  const tl = useUiText()

  const change = dashboardMetrics.issued / previousIssued - 1

  return (
    <FrostCard className="overview-kpi-issued hero-surface">
      <div>
        <div className="overview-kpi-heading">
          <h2>{tl("本期已出账")}</h2>
          <span className="issued-chart-chip">{tl("近 6 月 · CNY")}</span>
        </div>
        <strong className="issued-kpi-amount financial-number">
          <WanValue amount={dashboardMetrics.issued} />
        </strong>
        <p className="issued-kpi-change">
          <span className="financial-number">
            {changeFormat.format(change)}
          </span>

          {tl("较上月")}
        </p>
      </div>

      <figure className="issued-chart" aria-label={tl("近 6 个月 CNY 出账")}>
        <IssuedTrendPlot className="h-[88px]" />
      </figure>
    </FrostCard>
  )
}

function SummaryKpi({
  label,
  value,
  badge,
  badgeTone,
  facts,
  footer,
}: {
  label: string
  value: ReactNode
  badge: ReactNode
  badgeTone: "warning" | "info" | "neutral"
  facts: readonly [string, string]
  footer: string
}) {
  return (
    <FrostCard className="overview-kpi-secondary" data-metric-tone={badgeTone}>
      <div className="overview-kpi-heading">
        <h2>{label}</h2>
        <StatusBadge tone={badgeTone} className="overview-kpi-badge">
          {badge}
        </StatusBadge>
      </div>
      <strong className="overview-kpi-value financial-number">{value}</strong>
      <ul className="overview-kpi-facts">
        {facts.map((fact) => (
          <li key={fact}>
            <AppIcon icon={SolarCheck} size={12} />
            <span>{fact}</span>
          </li>
        ))}
      </ul>
      <p className="overview-kpi-footer">{footer}</p>
    </FrostCard>
  )
}

export function OverviewKpis({ visible }: { visible: readonly string[] }) {
  const tl = useUiText()

  const showIssued = visible.includes("issued")
  const showEstimated = visible.includes("estimated")
  const showCollection = visible.includes("collection-kpi")
  const showAnnual = visible.includes("annual")
  const secondaryCount = [showEstimated, showCollection, showAnnual].filter(
    Boolean
  ).length
  const count = secondaryCount + Number(showIssued)
  if (count === 0) return null

  const [cny, usd, eur] = collectionChannels
  const { processing, manual } = collectionStates
  const { estimated, completed, accountCount, annualIssued } = dashboardMetrics

  return (
    <section
      aria-label={tl("核心指标")}
      className="overview-kpis"
      data-odd-secondary={secondaryCount % 2 === 1 || undefined}
      data-featured={(showIssued && secondaryCount > 0) || undefined}
      style={
        {
          "--kpi-columns": count,
          "--kpi-secondary-columns": secondaryCount,
        } as CSSProperties
      }
    >
      {showIssued && <IssuedKpi />}
      {showEstimated && (
        <SummaryKpi
          label={tl("本期暂估")}
          value={<WanValue amount={estimated} />}
          badge={tl("暂估单列")}
          badgeTone="warning"
          facts={[tl("按 CNY 原币列示"), tl("待供应商正式出账后核对")]}
          footer={tl("暂估归属账期 · {{demoPeriod}}", { demoPeriod })}
        />
      )}
      {showCollection && (
        <SummaryKpi
          label={tl("采集已完成")}
          value={
            <>
              {completed}
              <span className="overview-kpi-denominator">
                {" "}
                / {accountCount}
              </span>
            </>
          }
          badge={`${((completed / accountCount) * 100).toFixed(1)}%`}
          badgeTone="info"
          facts={[
            tl("CNY 完成 {{completed}} 个账号", { completed: cny.completed }),
            tl("USD / EUR 完成 {{value}} 个账号", {
              value: usd.completed + eur.completed,
            }),
          ]}
          footer={tl("{{processing}} 个解析中 · {{manual}} 个待介入", {
            processing,
            manual,
          })}
        />
      )}
      {showAnnual && (
        <SummaryKpi
          label={tl("年累计已出账")}
          value={<WanValue amount={annualIssued} />}
          badge="CNY"
          badgeTone="neutral"
          facts={[
            tl("月均已出账 ¥{{value}} 万", {
              value: formatWan(annualIssued / monthInYear),
            }),
            tl("近 6 月峰值 ¥{{value}} 万", { value: formatWan(maxIssued) }),
          ]}
          footer={tl("累计账期 · 1–{{monthInYear}} 月", { monthInYear })}
        />
      )}
    </section>
  )
}
