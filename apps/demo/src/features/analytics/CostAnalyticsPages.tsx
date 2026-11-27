import { useId, useMemo, useState } from "react"

import { AppIcon, SolarReceiptText, SolarSearch } from "@marismoon/ui/icons"
import { DataTable } from "@marismoon/ui/shared/DataTable"
import { EmptyState } from "@marismoon/ui/shared/EmptyState"
import { FrostCard } from "@marismoon/ui/shared/FrostCard"
import { StatusBadge } from "@marismoon/ui/shared/StatusBadge"
import {
  createDataTableColumns,
  useDataTable,
} from "@marismoon/ui/shared/use-data-table"
import { Input } from "@marismoon/ui/ui/input"
import {
  RingKpiCard,
  SparklineKpiCard,
} from "@/features/settings/SettingsSummaryVisuals"
import { useUiText } from "@/lib/i18n/use-ui-text"
import { AnalyticsBarCard, AnalyticsTrendCard } from "./AnalyticsCharts"
import {
  costAllocationRows,
  costTrendSeries,
  rangeDaysLabels,
  type AnalyticsRange,
  type CostAllocationRow,
} from "./analytics-data"

import "../bills/components/bills-controls.css"
import "../bills/components/bills-table.css"
import "../settings/settings-table.css"
import "./analytics.css"

const costCol = createDataTableColumns<CostAllocationRow>()
const costAlign = {
  monthlyCostWan: "end",
  budgetWan: "end",
  momDeltaPct: "end",
  idleRatioPct: "end",
} as const

export function CostOverviewSummary() {
  const tl = useUiText()
  const totalCost = costAllocationRows.reduce((s, r) => s + r.monthlyCostWan, 0)
  const totalBudget = costAllocationRows.reduce((s, r) => s + r.budgetWan, 0)
  const budgetPct = Math.round((totalCost / Math.max(totalBudget, 1)) * 100)
  const avgIdle = Math.round(
    costAllocationRows.reduce((s, r) => s + r.idleRatioPct, 0) /
      costAllocationRows.length
  )

  const spendTrend = (costTrendSeries["30d"][0]?.values ?? []).map((v, i) => ({
    label: rangeDaysLabels["30d"][i] ?? `P${i + 1}`,
    value: v,
  }))
  const budgetPaceTrend = [
    { label: "W1", value: Math.round(budgetPct * 0.28) },
    { label: "W2", value: Math.round(budgetPct * 0.52) },
    { label: "W3", value: Math.round(budgetPct * 0.77) },
    { label: "W4", value: budgetPct },
  ]
  const deptCostBars = costAllocationRows.map((r) => ({
    label: tl(r.department),
    value: Math.round(r.monthlyCostWan),
  }))
  const idleTrend = [
    { label: "W1", value: 9.4 },
    { label: "W2", value: 8.6 },
    { label: "W3", value: 7.9 },
    { label: "W4", value: 7.1 },
    { label: "W5", value: 6.6 },
    { label: "W6", value: 6.2 },
  ]

  return (
    <section
      className="settings-summary-grid"
      data-cols="4"
      aria-label={tl("成本数据概况")}
    >
      <SparklineKpiCard
        featured
        label={tl("本月累计多云成本")}
        value={`¥${totalCost.toFixed(1)} ${tl("万")}`}
        formatHoverValue={(v) => `¥${v} ${tl("万")}`}
        badge="+6.8%"
        badgeTone="info"
        note={tl("预算总额 ¥{{budget}} 万，含计算与存储资源", {
          budget: totalBudget,
        })}
        data={spendTrend}
        variant="area"
        color="var(--chart-1)"
      />

      <SparklineKpiCard
        label={tl("整体预算执行率")}
        value={`${budgetPct}%`}
        formatHoverValue={(v) => `${v}%`}
        badge={budgetPct >= 85 ? tl("接近上限") : tl("进度正常")}
        badgeTone={budgetPct >= 85 ? "warning" : "success"}
        note={tl("本月按周累计预算消耗进度曲线")}
        data={budgetPaceTrend}
        variant="line"
        color={budgetPct >= 85 ? "var(--chart-warning)" : "var(--chart-2)"}
      />

      <SparklineKpiCard
        label={tl("部门成本分摊分布")}
        value={`${costAllocationRows.length} ${tl("个部门")}`}
        formatHoverValue={(v) => `¥${v} ${tl("万")}`}
        badge={tl("已全量分摊")}
        badgeTone="neutral"
        note={tl("悬停柱状查看各业务部门本月核算金额")}
        data={deptCostBars}
        variant="bar"
        color="var(--chart-3)"
      />

      <SparklineKpiCard
        label={tl("可优化闲置成本")}
        value={`¥6.2 ${tl("万")}`}
        formatHoverValue={(v) => `¥${v.toFixed(1)} ${tl("万")}`}
        badge={`${tl("均闲置")} ${avgIdle}%`}
        badgeTone="success"
        note={tl("近 6 周闲置资源持续收敛，可进一步降本")}
        data={idleTrend}
        variant="area"
        color="var(--chart-positive)"
      />
    </section>
  )
}

export function CostOverviewPage() {
  const tl = useUiText()
  const [range, setRange] = useState<AnalyticsRange>("30d")

  return (
    <div className="analytics-page">
      <div className="analytics-toolbar-row">
        <div
          className="analytics-range-pills"
          role="group"
          aria-label={tl("时间范围")}
        >
          {(
            [
              ["7d", "近 7 天"],
              ["30d", "近 30 天"],
              ["90d", "近 90 天"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className="analytics-range-btn"
              aria-pressed={range === key}
              onClick={() => setRange(key)}
            >
              {tl(label)}
            </button>
          ))}
        </div>
      </div>

      <div className="analytics-charts-grid">
        <AnalyticsTrendCard
          title={tl("资源类别成本趋势")}
          description={tl("计算 / 存储 / 网络费用变化（万元）")}
          labels={rangeDaysLabels[range]}
          series={costTrendSeries[range]}
        />
        <AnalyticsBarCard
          title={tl("部门成本分摊排行")}
          description={tl("本月已核算金额（万元）")}
          items={costAllocationRows.map((r) => ({
            label: r.department,
            value: Math.round(r.monthlyCostWan),
          }))}
          unit={tl("万")}
        />
      </div>

      <CostAllocationTable />
    </div>
  )
}

function CostAllocationTable() {
  const tl = useUiText()
  const searchId = useId()
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return [...costAllocationRows]
    return costAllocationRows.filter(
      (r) =>
        r.department.toLowerCase().includes(q) ||
        tl(r.department).toLowerCase().includes(q) ||
        r.project.toLowerCase().includes(q) ||
        r.provider.toLowerCase().includes(q)
    )
  }, [query, tl])

  const columns = useMemo(
    () =>
      costCol.columns([
        costCol.accessor("department", {
          header: tl("部门 / 业务项目"),
          cell: ({ row }) => (
            <>
              <span className="bill-row-id">{tl(row.original.department)}</span>
              <span className="bill-row-account">
                {tl(row.original.project)} · {tl(row.original.owner)}
              </span>
            </>
          ),
        }),
        costCol.accessor("provider", {
          header: tl("主云厂商"),
          cell: ({ getValue }) => (
            <span className="bill-row-pill">{tl(getValue())}</span>
          ),
        }),
        costCol.accessor("monthlyCostWan", {
          header: tl("本月成本"),
          cell: ({ getValue }) => (
            <span className="font-semibold financial-number">
              ¥{getValue()} {tl("万")}
            </span>
          ),
        }),
        costCol.accessor("budgetWan", {
          header: tl("月度预算"),
          cell: ({ row }) => {
            const pct = Math.round(
              (row.original.monthlyCostWan / row.original.budgetWan) * 100
            )
            return (
              <>
                <span className="financial-number">
                  ¥{row.original.budgetWan} {tl("万")}
                </span>
                <span className="bill-row-account financial-number">
                  {pct}%
                </span>
              </>
            )
          },
        }),
        costCol.accessor("momDeltaPct", {
          header: tl("环比变化"),
          cell: ({ getValue }) => (
            <StatusBadge
              tone={
                getValue() > 10
                  ? "warning"
                  : getValue() < 0
                    ? "success"
                    : "info"
              }
            >
              {getValue() > 0 ? `+${getValue()}%` : `${getValue()}%`}
            </StatusBadge>
          ),
        }),
        costCol.accessor("idleRatioPct", {
          header: tl("估算闲置率"),
          cell: ({ getValue }) => (
            <span className="text-muted-foreground financial-number">
              {getValue()}%
            </span>
          ),
        }),
      ]),
    [tl]
  )

  const table = useDataTable({
    columns,
    data: filtered,
    getRowId: (row) => row.id,
    initialState: { pagination: { pageIndex: 0, pageSize: 10 } },
  })

  return (
    <FrostCard className="settings-register analytics-cost-table">
      <div className="bills-toolbar">
        <div className="bills-toolbar-head">
          <span className="bills-toolbar-title">
            {tl("部门与项目成本分摊明细")}
          </span>
        </div>
        <div className="bills-toolbar-fields" role="search">
          <div
            className="bills-search data-table-search field-surface"
            data-field-focus="quiet"
          >
            <label className="sr-only" htmlFor={searchId}>
              {tl("搜索部门、项目或云厂商")}
            </label>
            <AppIcon icon={SolarSearch} size={16} />
            <Input
              embedded
              id={searchId}
              type="search"
              controlSize="dense"
              className="bills-search-input"
              value={query}
              onChange={(e) => {
                table.firstPage()
                setQuery(e.target.value)
              }}
              placeholder={tl("搜索部门、项目或云厂商")}
            />
          </div>
        </div>
      </div>
      <DataTable
        table={table}
        caption={tl("部门与项目成本分摊明细")}
        columnAlign={costAlign}
        rowHeaderColumn="department"
        selectAllLabel={tl("选择全部分摊行")}
        selectRowLabel={(row) => tl(row.department)}
        paginationLabel={tl("分摊分页")}
        empty={
          <EmptyState
            icon={SolarReceiptText}
            title={tl("没有匹配的分摊记录")}
          />
        }
      />
    </FrostCard>
  )
}

export function CostAllocationSummary() {
  const tl = useUiText()
  const totalCost = costAllocationRows.reduce((s, r) => s + r.monthlyCostWan, 0)
  const totalBudget = costAllocationRows.reduce((s, r) => s + r.budgetWan, 0)
  const budgetPct = Math.round((totalCost / Math.max(totalBudget, 1)) * 100)
  const over85 = costAllocationRows.filter(
    (r) => r.monthlyCostWan / r.budgetWan >= 0.85
  ).length
  const maxDeltaRow = [...costAllocationRows].sort(
    (a, b) => b.momDeltaPct - a.momDeltaPct
  )[0]

  const momBars = costAllocationRows.map((r) => ({
    label: tl(r.department),
    value: Math.max(r.momDeltaPct, 0),
  }))
  const utilBars = costAllocationRows.map((r) => ({
    label: tl(r.department),
    value: Math.round((r.monthlyCostWan / Math.max(r.budgetWan, 1)) * 100),
  }))

  return (
    <section
      className="settings-summary-grid"
      data-cols="3"
      aria-label={tl("预算与分摊概况")}
    >
      <RingKpiCard
        featured
        label={tl("预算执行与分摊归属")}
        value={`¥${totalCost.toFixed(1)} / ¥${totalBudget} ${tl("万")}`}
        badge={`${budgetPct}%`}
        badgeTone={budgetPct >= 85 ? "warning" : "success"}
        note={tl("外环预算执行率 · 内环标签分摊归属率 100%")}
        rings={[
          {
            label: tl("预算执行率"),
            value: budgetPct,
            maxValue: 100,
            color: "var(--chart-1)",
          },
          {
            label: tl("分摊归属率"),
            value: 100,
            maxValue: 100,
            color: "var(--chart-positive)",
          },
        ]}
      />

      <SparklineKpiCard
        label={tl("部门成本环比增速")}
        value={maxDeltaRow ? `+${maxDeltaRow.momDeltaPct}%` : "0%"}
        formatHoverValue={(v) => `+${v}%`}
        badge={maxDeltaRow ? tl(maxDeltaRow.department) : undefined}
        badgeTone="warning"
        note={tl("悬停柱状对比各部门月度费用环比增幅")}
        data={momBars}
        variant="bar"
        color="var(--chart-2)"
      />

      <SparklineKpiCard
        label={tl("高水位预算项目")}
        value={`${over85} / ${costAllocationRows.length}`}
        formatHoverValue={(v) => `${v}%`}
        badge={over85 > 0 ? tl("≥ 85% 预警") : tl("全部充裕")}
        badgeTone={over85 > 0 ? "warning" : "success"}
        note={tl("悬停柱状查看各业务项目预算使用占比")}
        data={utilBars}
        variant="bar"
        color="var(--chart-warning)"
      />
    </section>
  )
}

export function CostAllocationPage() {
  return (
    <div className="analytics-page">
      <CostAllocationTable />
    </div>
  )
}
