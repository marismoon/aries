import { useId, useMemo, useState } from "react"

import { AppIcon, SolarCloud, SolarSearch } from "@marismoon/ui/icons"
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
  apiEndpointRows,
  backendQpsSeries,
  rangeDaysLabels,
  storageNodeRows,
  type AnalyticsRange,
  type ApiEndpointRow,
  type StorageNodeRow,
} from "./analytics-data"

import "../bills/components/bills-controls.css"
import "../bills/components/bills-table.css"
import "../settings/settings-table.css"
import "./analytics.css"

const apiCol = createDataTableColumns<ApiEndpointRow>()
const apiAlign = {
  qps: "end",
  p95Ms: "end",
  errorRatePct: "end",
  availabilityPct: "end",
} as const

const storageCol = createDataTableColumns<StorageNodeRow>()
const storageAlign = {
  usedGb: "end",
  iops: "end",
  cacheHitPct: "end",
  slowQueries24h: "end",
} as const

const apiStatusMeta = {
  healthy: { label: "正常", tone: "success" as const },
  degraded: { label: "延迟升高", tone: "warning" as const },
  critical: { label: "异常波动", tone: "danger" as const },
}

export function BackendApiSummary() {
  const tl = useUiText()
  const totalQps = apiEndpointRows.reduce((s, r) => s + r.qps, 0)
  const healthy = apiEndpointRows.filter((r) => r.status === "healthy").length
  const degraded = apiEndpointRows.filter((r) => r.status === "degraded").length
  const critical = apiEndpointRows.filter((r) => r.status === "critical").length
  const avgAvail = Number(
    (
      apiEndpointRows.reduce((s, r) => s + r.availabilityPct, 0) /
      apiEndpointRows.length
    ).toFixed(2)
  )

  return (
    <section className="settings-summary-grid" aria-label={tl("后台接口概况")}>
      <FrostCard className="settings-summary-card hero-surface">
        <div className="settings-summary-meta">
          <div className="settings-summary-label">{tl("实时网关总 QPS")}</div>
          <div className="settings-summary-value financial-number">
            {totalQps.toLocaleString("en-US")}
          </div>
        </div>
        <SummarySegmentedBar
          total={apiEndpointRows.length}
          items={[
            { label: tl("正常接口"), count: healthy, tone: "success" },
            { label: tl("延迟升高"), count: degraded, tone: "warning" },
            { label: tl("异常波动"), count: critical, tone: "danger" },
          ]}
        />
      </FrostCard>

      <FrostCard className="settings-summary-card">
        <div className="settings-summary-label">
          {tl("接口 P95 延迟（ms）")}
        </div>
        <SummaryMiniBars
          items={apiEndpointRows.slice(0, 4).map((r) => ({
            label: r.service,
            value: r.p95Ms,
            max: 450,
          }))}
        />
      </FrostCard>

      <FrostCard className="settings-summary-card">
        <div className="settings-summary-top">
          <div className="settings-summary-meta">
            <div className="settings-summary-label">{tl("核心接口可用率")}</div>
            <div className="settings-summary-value financial-number">
              {avgAvail}%
            </div>
            <p className="settings-summary-note">
              {tl("ai-gateway 存在 1.18% 上游限流重试")}
            </p>
          </div>
          <SummaryRingGauge
            percent={Math.round(avgAvail)}
            tone="success"
            label={tl("核心接口可用率")}
          />
        </div>
      </FrostCard>
    </section>
  )
}

export function BackendApiPage() {
  const tl = useUiText()
  const searchId = useId()
  const [range, setRange] = useState<AnalyticsRange>("7d")
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return [...apiEndpointRows]
    return apiEndpointRows.filter(
      (r) =>
        r.endpoint.toLowerCase().includes(q) ||
        r.service.toLowerCase().includes(q)
    )
  }, [query])

  const columns = useMemo(
    () =>
      apiCol.columns([
        apiCol.accessor("endpoint", {
          header: tl("接口路径 / 服务"),
          cell: ({ row }) => (
            <>
              <span className="bill-row-id financial-number">
                {row.original.endpoint}
              </span>
              <span className="bill-row-account">{row.original.service}</span>
            </>
          ),
        }),
        apiCol.accessor("qps", {
          header: "QPS",
          cell: ({ getValue }) => (
            <span className="font-semibold financial-number">{getValue()}</span>
          ),
        }),
        apiCol.accessor("p95Ms", {
          header: tl("P95 延迟"),
          cell: ({ getValue }) => (
            <span className="financial-number">{getValue()} ms</span>
          ),
        }),
        apiCol.accessor("errorRatePct", {
          header: tl("错误率"),
          cell: ({ getValue }) => (
            <span className="financial-number">{getValue()}%</span>
          ),
        }),
        apiCol.accessor("availabilityPct", {
          header: tl("可用率"),
          cell: ({ getValue }) => (
            <span className="financial-number">{getValue()}%</span>
          ),
        }),
        apiCol.accessor("status", {
          header: tl("状态"),
          cell: ({ getValue }) => {
            const meta = apiStatusMeta[getValue()]
            return <StatusBadge tone={meta.tone}>{tl(meta.label)}</StatusBadge>
          },
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
          title={tl("网关吞吐与异步采集趋势")}
          description={tl("实时 QPS 与每分钟调度任务数")}
          labels={rangeDaysLabels[range]}
          series={backendQpsSeries[range]}
        />
        <AnalyticsBarCard
          title={tl("核心服务 P95 响应耗时")}
          description={tl("按接口路由对比（ms）")}
          items={apiEndpointRows.map((r) => ({
            label: r.service,
            value: r.p95Ms,
          }))}
          unit="ms"
        />
      </div>

      <FrostCard className="settings-register analytics-api-table">
        <div className="bills-toolbar">
          <div className="bills-toolbar-head">
            <span className="bills-toolbar-title">
              {tl("核心 API 端点性能明细")}
            </span>
          </div>
          <div className="bills-toolbar-fields" role="search">
            <div
              className="bills-search field-surface"
              data-field-focus="quiet"
            >
              <label className="sr-only" htmlFor={searchId}>
                {tl("搜索接口路径或微服务名称")}
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
                placeholder={tl("搜索接口路径或微服务名称")}
              />
            </div>
          </div>
        </div>
        <DataTable
          table={table}
          caption={tl("核心 API 端点性能明细")}
          columnAlign={apiAlign}
          rowHeaderColumn="endpoint"
          selectAllLabel={tl("选择全部接口")}
          selectRowLabel={(row) => row.endpoint}
          paginationLabel={tl("接口分页")}
          empty={
            <EmptyState icon={SolarCloud} title={tl("没有匹配的接口记录")} />
          }
        />
      </FrostCard>
    </div>
  )
}

export function BackendStorageSummary() {
  const tl = useUiText()
  const totalUsedTb = (
    storageNodeRows.reduce((s, r) => s + r.usedGb, 0) / 1024
  ).toFixed(1)
  const totalCapTb = (
    storageNodeRows.reduce((s, r) => s + r.capacityGb, 0) / 1024
  ).toFixed(1)
  const avgCacheHit = Math.round(
    storageNodeRows.reduce((s, r) => s + r.cacheHitPct, 0) /
      storageNodeRows.length
  )

  return (
    <section
      className="settings-summary-grid"
      aria-label={tl("数据库与存储概况")}
    >
      <FrostCard className="settings-summary-card hero-surface">
        <div className="settings-summary-meta">
          <div className="settings-summary-label">{tl("已用存储总量")}</div>
          <div className="settings-summary-value financial-number">
            {totalUsedTb} / {totalCapTb} TB
          </div>
        </div>
        <SummarySegmentedBar
          total={storageNodeRows.length}
          items={[
            {
              label: tl("健康实例"),
              count: storageNodeRows.filter((r) => r.status === "healthy")
                .length,
              tone: "success",
            },
            {
              label: tl("负载关注"),
              count: storageNodeRows.filter((r) => r.status === "warning")
                .length,
              tone: "warning",
            },
          ]}
        />
      </FrostCard>

      <FrostCard className="settings-summary-card">
        <div className="settings-summary-label">
          {tl("存储引擎容量占用（GB）")}
        </div>
        <SummaryMiniBars
          items={storageNodeRows.map((r) => ({
            label: r.name,
            value: r.usedGb,
            max: 9500,
          }))}
        />
      </FrostCard>

      <FrostCard className="settings-summary-card">
        <div className="settings-summary-top">
          <div className="settings-summary-meta">
            <div className="settings-summary-label">{tl("平均缓存命中率")}</div>
            <div className="settings-summary-value financial-number">
              {avgCacheHit}%
            </div>
            <p className="settings-summary-note">
              {tl("Redis 会话网格命中率 99.4%，ClickHouse 11 条慢查询")}
            </p>
          </div>
          <SummaryRingGauge
            percent={avgCacheHit}
            tone="info"
            label={tl("平均缓存命中率")}
          />
        </div>
      </FrostCard>
    </section>
  )
}

export function BackendStoragePage() {
  const tl = useUiText()

  const columns = useMemo(
    () =>
      storageCol.columns([
        storageCol.accessor("name", {
          header: tl("存储实例 / 引擎"),
          cell: ({ row }) => (
            <>
              <span className="bill-row-id financial-number">
                {row.original.name}
              </span>
              <span className="bill-row-account">{row.original.engine}</span>
            </>
          ),
        }),
        storageCol.accessor("usedGb", {
          header: tl("已用 / 容量"),
          cell: ({ row }) => (
            <span className="financial-number">
              {row.original.usedGb} / {row.original.capacityGb} GB
            </span>
          ),
        }),
        storageCol.accessor("iops", {
          header: "IOPS",
          cell: ({ getValue }) => (
            <span className="financial-number">
              {getValue().toLocaleString("en-US")}
            </span>
          ),
        }),
        storageCol.accessor("cacheHitPct", {
          header: tl("缓存命中率"),
          cell: ({ getValue }) => (
            <span className="font-semibold financial-number">
              {getValue()}%
            </span>
          ),
        }),
        storageCol.accessor("slowQueries24h", {
          header: tl("24h 慢查询"),
          cell: ({ getValue }) => (
            <span className="financial-number">{getValue()}</span>
          ),
        }),
        storageCol.accessor("status", {
          header: tl("状态"),
          cell: ({ getValue }) => (
            <StatusBadge
              tone={getValue() === "healthy" ? "success" : "warning"}
            >
              {getValue() === "healthy" ? tl("正常") : tl("负载关注")}
            </StatusBadge>
          ),
        }),
      ]),
    [tl]
  )

  const table = useDataTable({
    columns,
    data: [...storageNodeRows],
    getRowId: (row) => row.id,
    initialState: { pagination: { pageIndex: 0, pageSize: 10 } },
  })

  return (
    <div className="analytics-page">
      <FrostCard className="settings-register analytics-storage-table">
        <div className="bills-toolbar">
          <div className="bills-toolbar-head">
            <span className="bills-toolbar-title">
              {tl("数据库与存储实例负载")}
            </span>
          </div>
        </div>
        <DataTable
          table={table}
          caption={tl("数据库与存储实例负载")}
          columnAlign={storageAlign}
          rowHeaderColumn="name"
          selectAllLabel={tl("选择全部实例")}
          selectRowLabel={(row) => row.name}
          paginationLabel={tl("实例分页")}
          empty={null}
        />
      </FrostCard>
    </div>
  )
}
