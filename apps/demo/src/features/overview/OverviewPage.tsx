import { useTranslation } from "react-i18next"

import { SolarCloud, SolarPercent } from "@marismoon/ui/icons"
import { EmptyState } from "@marismoon/ui/shared/EmptyState"
import { FrostCard } from "@marismoon/ui/shared/FrostCard"
import { MetricCard } from "@marismoon/ui/shared/MetricCard"
import { Button } from "@marismoon/ui/ui/button"
import { dashboardMetrics } from "@marismoon/core/mocks/overview"
import { ActivityTimeline } from "./components/ActivityTimeline"
import { AttentionList } from "./components/AttentionList"
import { CollectionProgress } from "./components/CollectionProgress"
import { OverviewCharts } from "./components/OverviewCharts"
import { OverviewKpis } from "./components/OverviewKpis"
import { useDashboardDemo } from "./hooks/useDashboardDemo"
import "./overview.css"
import { useUiText } from "@/lib/i18n/use-ui-text"

export function OverviewSubtitle() {
  const { t } = useTranslation()
  const tl = useUiText()
  const { activities } = useDashboardDemo()
  const pending = dashboardMetrics.pendingCount - activities.length

  return (
    <p className="overview-status financial-number" aria-live="polite">
      {tl("{{count}} 个{{label}}", {
        count: dashboardMetrics.accountCount,
        label: t("overview.accounts"),
      })}
      <span aria-hidden="true"> · </span>
      {tl("{{count}} 项{{label}}", {
        count: pending,
        label: t("overview.pending"),
      })}
    </p>
  )
}

export function OverviewPage() {
  const tl = useUiText()

  const dashboard = useDashboardDemo()
  const { visible, attentionCardItems, activities } = dashboard
  const showAttention = visible.includes("attention")
  const showProgress = visible.includes("progress")
  const showEstimateShare = visible.includes("estimate-share")
  const showRemaining = visible.includes("remaining")
  const estimateShare =
    dashboardMetrics.estimated /
    (dashboardMetrics.issued + dashboardMetrics.estimated)

  return (
    <>
      <OverviewKpis visible={visible} />

      {(showAttention || showProgress) && (
        <div
          className="overview-workflow-grid"
          data-single={!(showAttention && showProgress)}
        >
          {showAttention && (
            <AttentionList
              items={attentionCardItems}
              onResolve={dashboard.resolveAttention}
            />
          )}
          {showProgress && <CollectionProgress />}
        </div>
      )}

      {visible.includes("activity") && (
        <ActivityTimeline addedActivities={activities} />
      )}

      <OverviewCharts visible={visible} />

      {(showEstimateShare || showRemaining) && (
        <section aria-label={tl("示例卡片")} className="overview-extras">
          {showEstimateShare && (
            <MetricCard
              label={tl("暂估占比")}
              value={new Intl.NumberFormat("zh-CN", {
                style: "percent",
                maximumFractionDigits: 1,
              }).format(estimateShare)}
              icon={SolarPercent}
              description={tl("暂估占本期 CNY 金额快照的比例")}
            />
          )}
          {showRemaining && (
            <MetricCard
              label={tl("未完成采集")}
              value={dashboardMetrics.accountCount - dashboardMetrics.completed}
              icon={SolarCloud}
              description={tl("包括解析中及待介入的云账号")}
            />
          )}
        </section>
      )}

      {visible.length === 0 && (
        <FrostCard>
          <EmptyState
            title={tl("当前没有可见卡片")}
            description={tl("恢复默认卡片，或在定制菜单中重新选择。")}
            action={
              <Button variant="outline" onClick={dashboard.resetCards}>
                {tl("恢复默认卡片")}
              </Button>
            }
          />
        </FrostCard>
      )}
    </>
  )
}
