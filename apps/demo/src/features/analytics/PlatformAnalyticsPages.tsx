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
  RingKpiCard,
  SparklineKpiCard,
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
  const seatPct = Math.round((totalActive / Math.max(totalSeats, 1)) * 100)
  const avgRetention = Math.round(
    tenantUsageRows.reduce((s, r) => s + r.retentionPct, 0) /
      tenantUsageRows.length
  )
  const dauPoints = (platformDauSeries["7d"][0]?.values ?? []).map((v, i) => ({
    label: rangeDaysLabels["7d"][i] ?? `D${i + 1}`,
    value: v,
  }))
  const seatTrend = [
    { label: "W1", value: Math.max(seatPct - 9, 50) },
    { label: "W2", value: Math.max(seatPct - 7, 55) },
    { label: "W3", value: Math.max(seatPct - 5, 60) },
    { label: "W4", value: Math.max(seatPct - 3, 64) },
    { label: "W5", value: Math.max(seatPct - 1, 68) },
    { label: "W6", value: seatPct },
  ]
  const retentionTrend = [
    { label: "W1", value: Math.max(avgRetention - 4, 70) },
    { label: "W2", value: Math.max(avgRetention - 3, 74) },
    { label: "W3", value: Math.max(avgRetention - 2, 78) },
    { label: "W4", value: Math.max(avgRetention - 2, 80) },
    { label: "W5", value: Math.max(avgRetention - 1, 82) },
    { label: "W6", value: avgRetention },
  ]
  const moduleBars = moduleUsageBars.slice(0, 6).map((item) => ({
    label: tl(item.label),
    value: item.value,
  }))
  const topModule = moduleUsageBars[0]

  return (
    <section
      className="settings-summary-grid"
      data-cols="4"
      aria-label={tl("平台数据概况")}
    >
      <SparklineKpiCard
        featured
        label={tl("平台日活用户（DAU）")}
        value="2,390"
        badge="+14.6%"
        badgeTone="success"
        note={tl("近 7 日活跃工作区与核心操作用户增长")}
        data={dauPoints}
        variant="area"
        color="var(--chart-1)"
      />

      <SparklineKpiCard
        label={tl("活跃席位利用率")}
        value={`${seatPct}%`}
        formatHoverValue={(v) => `${v}%`}
        badge={`${totalActive}/${totalSeats}`}
        badgeTone="info"
        note={tl("近 6 周企业席位激活率稳步上升")}
        data={seatTrend}
        variant="line"
        color="var(--chart-2)"
      />

      <SparklineKpiCard
        label={tl("30 日平均租户留存")}
        value={`${avgRetention}%`}
        formatHoverValue={(v) => `${v}%`}
        badge="+2.4%"
        badgeTone="success"
        note={tl("旗舰版与多云财务工作区留存领先")}
        data={retentionTrend}
        variant="area"
        color="var(--chart-positive)"
      />

      <SparklineKpiCard
        label={tl("核心模块周渗透率")}
        value={`${topModule?.value ?? 94}%`}
        formatHoverValue={(v) => `${v}%`}
        badge={topModule ? tl(topModule.label) : undefined}
        badgeTone="neutral"
        note={tl("悬停柱状查看各功能模块周活跃渗透率")}
        data={moduleBars}
        variant="bar"
        color="var(--chart-3)"
      />
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
          <div
            className="bills-search data-table-search field-surface"
            data-field-focus="quiet"
          >
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
  const seatRate = Math.round((usedSeats / Math.max(totalSeats, 1)) * 100)
  const avgRetention = Math.round(
    tenantUsageRows.reduce((s, r) => s + r.retentionPct, 0) /
      tenantUsageRows.length
  )
  const totalApiK = Math.round(
    tenantUsageRows.reduce((s, r) => s + r.apiCallsK, 0)
  )

  const tenantSeatBars = tenantUsageRows.map((r) => ({
    label: tl(r.name),
    value: r.activeUsers,
  }))
  const apiUsageTrend = [
    { label: "11/20", value: Math.round(totalApiK * 0.84) },
    { label: "11/21", value: Math.round(totalApiK * 0.88) },
    { label: "11/22", value: Math.round(totalApiK * 0.86) },
    { label: "11/23", value: Math.round(totalApiK * 0.92) },
    { label: "11/24", value: Math.round(totalApiK * 0.96) },
    { label: "11/25", value: Math.round(totalApiK * 0.98) },
    { label: "11/26", value: totalApiK },
  ]

  return (
    <section
      className="settings-summary-grid"
      data-cols="3"
      aria-label={tl("租户与用户概况")}
    >
      <SparklineKpiCard
        featured
        label={tl("重点企业租户")}
        value={`${tenantUsageRows.length} ${tl("家")}`}
        formatHoverValue={(v) => `${v} ${tl("席位")}`}
        badge={`${tl("健康活跃")} ${healthy} · ${tl("高速增长")} ${growing}`}
        badgeTone="success"
        note={tl("留存预警 {{risk}} 家（柱状为各租户活跃席位）", { risk })}
        data={tenantSeatBars}
        variant="bar"
        color="var(--chart-1)"
      />

      <SparklineKpiCard
        label={tl("租户日均 API 总消耗")}
        value={`${totalApiK.toLocaleString("en-US")}k`}
        formatHoverValue={(v) => `${v.toLocaleString("en-US")}k`}
        badge="+16.2%"
        badgeTone="info"
        note={tl("近 7 日企业租户日均调用量走势")}
        data={apiUsageTrend}
        variant="area"
        color="var(--chart-2)"
      />

      <RingKpiCard
        label={tl("席位利用率与留存双环")}
        value={`${seatRate}%`}
        badge={`${usedSeats}/${totalSeats}`}
        badgeTone="info"
        note={tl("2 家租户席位接近上限，建议扩容")}
        rings={[
          {
            label: tl("席位利用率"),
            value: seatRate,
            maxValue: 100,
            color: "var(--chart-1)",
          },
          {
            label: tl("30 日留存"),
            value: avgRetention,
            maxValue: 100,
            color: "var(--chart-positive)",
          },
        ]}
      />
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
