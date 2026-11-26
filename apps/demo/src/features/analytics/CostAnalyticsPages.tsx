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
  SummaryMiniBars,
  SummaryRingGauge,
  SummarySegmentedBar,
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
  const budgetPct = Math.round((totalCost / totalBudget) * 100)
  const over85 = costAllocationRows.filter(
    (r) => r.monthlyCostWan / r.budgetWan >= 0.85
  ).length

  return (
    <section className="settings-summary-grid" aria-label={tl("成本数据概况")}>
      <FrostCard className="settings-summary-card hero-surface">
        <div className="settings-summary-meta">
          <div className="settings-summary-label">{tl("本月累计多云成本")}</div>
          <div className="settings-summary-value financial-number">
            ¥{totalCost.toFixed(1)} {tl("万")}
          </div>
        </div>
        <SummarySegmentedBar
          total={costAllocationRows.length}
          items={[
            {
              label: tl("预算正常"),
              count: costAllocationRows.length - over85,
              tone: "success",
            },
            { label: tl("接近上限"), count: over85, tone: "warning" },
          ]}
        />
      </FrostCard>

      <FrostCard className="settings-summary-card">
        <div className="settings-summary-label">
          {tl("部门月度成本排行（万元）")}
        </div>
        <SummaryMiniBars
          items={costAllocationRows.slice(0, 4).map((r) => ({
            label: tl(r.department),
            value: Math.round(r.monthlyCostWan),
            max: 260,
          }))}
        />
      </FrostCard>

      <FrostCard className="settings-summary-card">
        <div className="settings-summary-top">
          <div className="settings-summary-meta">
            <div className="settings-summary-label">{tl("整体预算执行率")}</div>
            <div className="settings-summary-value financial-number">
              {budgetPct}%
            </div>
            <p className="settings-summary-note">
              {tl("预算总额 ¥{{budget}} 万，可优化闲置约 ¥6.2 万", {
                budget: totalBudget,
              })}
            </p>
          </div>
          <SummaryRingGauge
            percent={budgetPct}
            tone={budgetPct >= 85 ? "warning" : "success"}
            label={tl("整体预算执行率")}
          />
        </div>
      </FrostCard>
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
          <div className="bills-search field-surface" data-field-focus="quiet">
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
  return <CostOverviewSummary />
}

export function CostAllocationPage() {
  return (
    <div className="analytics-page">
      <CostAllocationTable />
    </div>
  )
}
