import { useId, useMemo, useState } from "react"

import {
  AppIcon,
  SolarSearch,
  SolarUsersGroupRounded,
} from "@marismoon/ui/icons"
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
  moduleUsageBars,
  platformDauSeries,
  rangeDaysLabels,
  tenantUsageRows,
  type AnalyticsRange,
  type TenantUsageRow,
} from "./analytics-data"

import "../bills/components/bills-controls.css"
import "../bills/components/bills-table.css"
import "../settings/settings-table.css"
import "./analytics.css"

const tenantCol = createDataTableColumns<TenantUsageRow>()
const tenantAlign = {
  activeUsers: "end",
  apiCallsK: "end",
  retentionPct: "end",
} as const

const tenantStatusMeta = {
  healthy: { label: "健康活跃", tone: "success" as const },
  growing: { label: "高速增长", tone: "info" as const },
  risk: { label: "留存预警", tone: "warning" as const },
}

export function PlatformOverviewSummary() {
  const tl = useUiText()
  const totalActive = tenantUsageRows.reduce((s, r) => s + r.activeUsers, 0)
  const totalSeats = tenantUsageRows.reduce((s, r) => s + r.seatLimit, 0)
  const avgRetention = Math.round(
    tenantUsageRows.reduce((s, r) => s + r.retentionPct, 0) /
      tenantUsageRows.length
  )

  return (
    <section className="settings-summary-grid" aria-label={tl("平台数据概况")}>
      <FrostCard className="settings-summary-card hero-surface">
        <div className="settings-summary-meta">
          <div className="settings-summary-label">
            {tl("平台日活用户（DAU）")}
          </div>
          <div className="settings-summary-value financial-number">2,390</div>
        </div>
        <SummarySegmentedBar
          total={totalSeats}
          items={[
            { label: tl("活跃席位"), count: totalActive, tone: "success" },
            {
              label: tl("待激活席位"),
              count: Math.max(totalSeats - totalActive, 0),
              tone: "neutral",
            },
          ]}
        />
      </FrostCard>

      <FrostCard className="settings-summary-card">
        <div className="settings-summary-label">
          {tl("核心模块周活跃度（%）")}
        </div>
        <SummaryMiniBars
          items={moduleUsageBars.slice(0, 4).map((item) => ({
            label: tl(item.label),
            value: item.value,
            max: 100,
          }))}
        />
      </FrostCard>

      <FrostCard className="settings-summary-card">
        <div className="settings-summary-top">
          <div className="settings-summary-meta">
            <div className="settings-summary-label">
              {tl("30 日平均租户留存")}
            </div>
            <div className="settings-summary-value financial-number">
              {avgRetention}%
            </div>
            <p className="settings-summary-note">
              {tl("较上周期提升 +2.4%，旗舰版留存领先")}
            </p>
          </div>
          <SummaryRingGauge
            percent={avgRetention}
            tone="success"
            label={tl("30 日平均租户留存")}
          />
        </div>
      </FrostCard>
    </section>
  )
}

export function PlatformOverviewPage() {
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
          title={tl("平台活跃用户趋势")}
          description={tl("日活与核心操作用户变化")}
          labels={rangeDaysLabels[range]}
          series={platformDauSeries[range]}
        />
        <AnalyticsBarCard
          title={tl("功能模块使用渗透率")}
          description={tl("按活跃工作区占比统计（%）")}
          items={moduleUsageBars}
          unit="%"
        />
      </div>

      <PlatformTenantsTable />
    </div>
  )
}

function PlatformTenantsTable() {
  const tl = useUiText()
  const searchId = useId()
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return [...tenantUsageRows]
    return tenantUsageRows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        tl(r.name).toLowerCase().includes(q) ||
        r.plan.toLowerCase().includes(q)
    )
  }, [query, tl])

  const columns = useMemo(
    () =>
      tenantCol.columns([
        tenantCol.accessor("name", {
          header: tl("工作区 / 租户"),
          cell: ({ row }) => (
            <>
              <span className="bill-row-id">{tl(row.original.name)}</span>
              <span className="bill-row-account">
                {row.original.id} · {tl(row.original.plan)}
              </span>
            </>
          ),
        }),
        tenantCol.accessor("activeUsers", {
          header: tl("活跃席位"),
          cell: ({ row }) => (
            <span className="financial-number">
              {row.original.activeUsers} / {row.original.seatLimit}
            </span>
          ),
        }),
        tenantCol.accessor("apiCallsK", {
          header: tl("日均调用（千次）"),
          cell: ({ getValue }) => (
            <span className="financial-number">{getValue()}k</span>
          ),
        }),
        tenantCol.accessor("retentionPct", {
          header: tl("30 日留存"),
          cell: ({ getValue }) => (
            <span className="font-semibold financial-number">
              {getValue()}%
            </span>
          ),
        }),
        tenantCol.accessor("status", {
          header: tl("健康状态"),
          cell: ({ getValue }) => {
            const meta = tenantStatusMeta[getValue()]
            return <StatusBadge tone={meta.tone}>{tl(meta.label)}</StatusBadge>
          },
        }),
        tenantCol.accessor("lastActiveAt", {
          header: tl("最近活跃"),
          cell: ({ getValue }) => (
            <span className="text-muted-foreground financial-number">
              {getValue()}
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
    <FrostCard className="settings-register analytics-tenants-table">
      <div className="bills-toolbar">
        <div className="bills-toolbar-head">
          <span className="bills-toolbar-title">
            {tl("活跃租户与席位排行")}
          </span>
        </div>
        <div className="bills-toolbar-fields" role="search">
          <div className="bills-search field-surface" data-field-focus="quiet">
            <label className="sr-only" htmlFor={searchId}>
              {tl("搜索租户名称或版本套餐")}
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
              placeholder={tl("搜索租户名称或版本套餐")}
            />
          </div>
        </div>
      </div>
      <DataTable
        table={table}
        caption={tl("活跃租户与席位排行")}
        columnAlign={tenantAlign}
        rowHeaderColumn="name"
        selectAllLabel={tl("选择全部租户")}
        selectRowLabel={(row) => tl(row.name)}
        paginationLabel={tl("租户分页")}
        empty={
          <EmptyState
            icon={SolarUsersGroupRounded}
            title={tl("没有匹配的租户数据")}
          />
        }
      />
    </FrostCard>
  )
}

export function PlatformTenantsSummary() {
  const tl = useUiText()
  const healthy = tenantUsageRows.filter((r) => r.status === "healthy").length
  const growing = tenantUsageRows.filter((r) => r.status === "growing").length
  const risk = tenantUsageRows.filter((r) => r.status === "risk").length
  const totalSeats = tenantUsageRows.reduce((s, r) => s + r.seatLimit, 0)
  const usedSeats = tenantUsageRows.reduce((s, r) => s + r.activeUsers, 0)
  const seatRate = Math.round((usedSeats / totalSeats) * 100)

  return (
    <section
      className="settings-summary-grid"
      aria-label={tl("租户与用户概况")}
    >
      <FrostCard className="settings-summary-card hero-surface">
        <div className="settings-summary-meta">
          <div className="settings-summary-label">{tl("重点企业租户")}</div>
          <div className="settings-summary-value financial-number">
            {tenantUsageRows.length} {tl("家")}
          </div>
        </div>
        <SummarySegmentedBar
          total={tenantUsageRows.length}
          items={[
            { label: tl("健康活跃"), count: healthy, tone: "success" },
            { label: tl("高速增长"), count: growing, tone: "info" },
            { label: tl("留存预警"), count: risk, tone: "warning" },
          ]}
        />
      </FrostCard>

      <FrostCard className="settings-summary-card">
        <div className="settings-summary-label">
          {tl("日均 API 消耗排行（千次）")}
        </div>
        <SummaryMiniBars
          items={tenantUsageRows.slice(0, 4).map((r) => ({
            label: tl(r.name),
            value: Math.round(r.apiCallsK),
            max: 450,
          }))}
        />
      </FrostCard>

      <FrostCard className="settings-summary-card">
        <div className="settings-summary-top">
          <div className="settings-summary-meta">
            <div className="settings-summary-label">{tl("整体席位利用率")}</div>
            <div className="settings-summary-value financial-number">
              {usedSeats} / {totalSeats}
            </div>
            <p className="settings-summary-note">
              {tl("2 家租户席位接近上限，建议扩容")}
            </p>
          </div>
          <SummaryRingGauge
            percent={seatRate}
            tone="info"
            label={tl("整体席位利用率")}
          />
        </div>
      </FrostCard>
    </section>
  )
}

export function PlatformTenantsPage() {
  return (
    <div className="analytics-page">
      <PlatformTenantsTable />
    </div>
  )
}
