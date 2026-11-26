import { useMemo, useState } from "react"

import { DataTable } from "@marismoon/ui/shared/DataTable"
import { FrostCard } from "@marismoon/ui/shared/FrostCard"
import { StatusBadge } from "@marismoon/ui/shared/StatusBadge"
import {
  createDataTableColumns,
  useDataTable,
} from "@marismoon/ui/shared/use-data-table"
import {
  SummaryMiniBars,
  SummaryRingGauge,
  SummarySegmentedBar,
} from "@/features/settings/SettingsSummaryVisuals"
import { useUiText } from "@/lib/i18n/use-ui-text"
import { AnalyticsBarCard, AnalyticsTrendCard } from "./AnalyticsCharts"
import {
  clusterNodeRows,
  rangeDaysLabels,
  serviceSlaRows,
  systemLoadSeries,
  type AnalyticsRange,
  type ClusterNodeRow,
  type ServiceSlaRow,
} from "./analytics-data"

import "../bills/components/bills-controls.css"
import "../bills/components/bills-table.css"
import "../settings/settings-table.css"
import "./analytics.css"

const clusterCol = createDataTableColumns<ClusterNodeRow>()
const clusterAlign = {
  cpuPct: "end",
  memoryPct: "end",
  gpuPct: "end",
  podCount: "end",
} as const

const slaCol = createDataTableColumns<ServiceSlaRow>()
const slaAlign = {
  availabilityPct: "end",
  errorBudgetLeftPct: "end",
  mttrMin: "end",
  incidents30d: "end",
} as const

function LoadMeter({ value }: { value: number }) {
  const tone = value >= 85 ? "danger" : value >= 75 ? "warning" : undefined
  return (
    <div className="analytics-meter">
      <span className="text-xs font-semibold financial-number">{value}%</span>
      <div className="analytics-meter-track">
        <div
          className="analytics-meter-fill"
          data-tone={tone}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  )
}

export function SystemInfraSummary() {
  const tl = useUiText()
  const totalPods = clusterNodeRows.reduce((s, r) => s + r.podCount, 0)
  const avgCpu = Math.round(
    clusterNodeRows.reduce((s, r) => s + r.cpuPct, 0) / clusterNodeRows.length
  )
  const avgMem = Math.round(
    clusterNodeRows.reduce((s, r) => s + r.memoryPct, 0) /
      clusterNodeRows.length
  )

  return (
    <section className="settings-summary-grid" aria-label={tl("系统资源概况")}>
      <FrostCard className="settings-summary-card hero-surface">
        <div className="settings-summary-meta">
          <div className="settings-summary-label">
            {tl("运行中工作负载（Pod）")}
          </div>
          <div className="settings-summary-value financial-number">
            {totalPods}
          </div>
        </div>
        <SummarySegmentedBar
          total={clusterNodeRows.length}
          items={[
            {
              label: tl("健康集群"),
              count: clusterNodeRows.filter((r) => r.status === "healthy")
                .length,
              tone: "success",
            },
            {
              label: tl("高负载"),
              count: clusterNodeRows.filter((r) => r.status === "busy").length,
              tone: "info",
            },
            {
              label: tl("资源预警"),
              count: clusterNodeRows.filter((r) => r.status === "warning")
                .length,
              tone: "warning",
            },
          ]}
        />
      </FrostCard>

      <FrostCard className="settings-summary-card">
        <div className="settings-summary-label">
          {tl("各集群内存水位（%）")}
        </div>
        <SummaryMiniBars
          items={clusterNodeRows.map((r) => ({
            label: r.cluster,
            value: r.memoryPct,
            max: 100,
          }))}
        />
      </FrostCard>

      <FrostCard className="settings-summary-card">
        <div className="settings-summary-top">
          <div className="settings-summary-meta">
            <div className="settings-summary-label">
              {tl("集群平均 CPU / 内存")}
            </div>
            <div className="settings-summary-value financial-number">
              {avgCpu}% / {avgMem}%
            </div>
            <p className="settings-summary-note">
              {tl("gpu-infer-shanghai GPU 水位达 92%，建议开启弹性缩容")}
            </p>
          </div>
          <SummaryRingGauge
            percent={avgMem}
            tone={avgMem >= 80 ? "warning" : "info"}
            label={tl("集群平均内存")}
          />
        </div>
      </FrostCard>
    </section>
  )
}

export function SystemInfraPage() {
  const tl = useUiText()
  const [range, setRange] = useState<AnalyticsRange>("7d")

  const columns = useMemo(
    () =>
      clusterCol.columns([
        clusterCol.accessor("cluster", {
          header: tl("集群名称 / 区域"),
          cell: ({ row }) => (
            <>
              <span className="bill-row-id financial-number">
                {row.original.cluster}
              </span>
              <span className="bill-row-account">{row.original.region}</span>
            </>
          ),
        }),
        clusterCol.accessor("cpuPct", {
          header: "CPU",
          cell: ({ getValue }) => <LoadMeter value={getValue()} />,
        }),
        clusterCol.accessor("memoryPct", {
          header: tl("内存"),
          cell: ({ getValue }) => <LoadMeter value={getValue()} />,
        }),
        clusterCol.accessor("gpuPct", {
          header: "GPU",
          cell: ({ getValue }) =>
            getValue() > 0 ? (
              <LoadMeter value={getValue()} />
            ) : (
              <span className="text-muted-foreground">—</span>
            ),
        }),
        clusterCol.accessor("podCount", {
          header: tl("Pod 数量"),
          cell: ({ getValue }) => (
            <span className="financial-number">{getValue()}</span>
          ),
        }),
        clusterCol.accessor("status", {
          header: tl("状态"),
          cell: ({ getValue }) => (
            <StatusBadge
              tone={
                getValue() === "healthy"
                  ? "success"
                  : getValue() === "busy"
                    ? "info"
                    : "warning"
              }
            >
              {getValue() === "healthy"
                ? tl("健康")
                : getValue() === "busy"
                  ? tl("繁忙")
                  : tl("水位预警")}
            </StatusBadge>
          ),
        }),
      ]),
    [tl]
  )

  const table = useDataTable({
    columns,
    data: [...clusterNodeRows],
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
          title={tl("计算集群资源利用率趋势")}
          description={tl("CPU、内存与 GPU 负载对比（%）")}
          labels={rangeDaysLabels[range]}
          series={systemLoadSeries[range]}
          unit="%"
        />
        <AnalyticsBarCard
          title={tl("各集群工作负载分布")}
          description={tl("运行中 Pod 实例数")}
          items={clusterNodeRows.map((r) => ({
            label: r.cluster,
            value: r.podCount,
          }))}
        />
      </div>

      <FrostCard className="settings-register analytics-cluster-table">
        <div className="bills-toolbar">
          <div className="bills-toolbar-head">
            <span className="bills-toolbar-title">
              {tl("集群与节点实时负载")}
            </span>
          </div>
        </div>
        <DataTable
          table={table}
          caption={tl("集群与节点实时负载")}
          columnAlign={clusterAlign}
          rowHeaderColumn="cluster"
          selectAllLabel={tl("选择全部集群")}
          selectRowLabel={(row) => row.cluster}
          paginationLabel={tl("集群分页")}
          empty={null}
        />
      </FrostCard>
    </div>
  )
}

export function SystemSlaSummary() {
  const tl = useUiText()
  const avgAvail = (
    serviceSlaRows.reduce((s, r) => s + r.availabilityPct, 0) /
    serviceSlaRows.length
  ).toFixed(2)
  const avgBudget = Math.round(
    serviceSlaRows.reduce((s, r) => s + r.errorBudgetLeftPct, 0) /
      serviceSlaRows.length
  )
  const healthyCount = serviceSlaRows.filter(
    (r) => r.status === "healthy"
  ).length

  return (
    <section
      className="settings-summary-grid"
      aria-label={tl("稳定性与 SLA 概况")}
    >
      <FrostCard className="settings-summary-card hero-surface">
        <div className="settings-summary-meta">
          <div className="settings-summary-label">{tl("综合服务可用性")}</div>
          <div className="settings-summary-value financial-number">
            {avgAvail}%
          </div>
        </div>
        <SummarySegmentedBar
          total={serviceSlaRows.length}
          items={[
            { label: tl("达标服务"), count: healthyCount, tone: "success" },
            {
              label: tl("预算消耗偏快"),
              count: serviceSlaRows.length - healthyCount,
              tone: "warning",
            },
          ]}
        />
      </FrostCard>

      <FrostCard className="settings-summary-card">
        <div className="settings-summary-label">{tl("剩余错误预算（%）")}</div>
        <SummaryMiniBars
          items={serviceSlaRows.map((r) => ({
            label: tl(r.service),
            value: r.errorBudgetLeftPct,
            max: 100,
          }))}
        />
      </FrostCard>

      <FrostCard className="settings-summary-card">
        <div className="settings-summary-top">
          <div className="settings-summary-meta">
            <div className="settings-summary-label">
              {tl("平均剩余错误预算")}
            </div>
            <div className="settings-summary-value financial-number">
              {avgBudget}%
            </div>
            <p className="settings-summary-note">
              {tl("Tier 0 核心账务与认证服务均高于 99.95% SLA")}
            </p>
          </div>
          <SummaryRingGauge
            percent={avgBudget}
            tone={avgBudget >= 50 ? "success" : "warning"}
            label={tl("平均剩余错误预算")}
          />
        </div>
      </FrostCard>
    </section>
  )
}

export function SystemSlaPage() {
  const tl = useUiText()

  const columns = useMemo(
    () =>
      slaCol.columns([
        slaCol.accessor("service", {
          header: tl("核心服务 / 等级"),
          cell: ({ row }) => (
            <>
              <span className="bill-row-id">{tl(row.original.service)}</span>
              <span className="bill-row-account">{row.original.tier}</span>
            </>
          ),
        }),
        slaCol.accessor("availabilityPct", {
          header: tl("30 日可用性"),
          cell: ({ row }) => (
            <>
              <span className="font-semibold financial-number">
                {row.original.availabilityPct}%
              </span>
              <span className="bill-row-account financial-number">
                {tl("目标")} {row.original.targetPct}%
              </span>
            </>
          ),
        }),
        slaCol.accessor("errorBudgetLeftPct", {
          header: tl("剩余错误预算"),
          cell: ({ getValue }) => (
            <span className="financial-number">{getValue()}%</span>
          ),
        }),
        slaCol.accessor("mttrMin", {
          header: "MTTR",
          cell: ({ getValue }) => (
            <span className="financial-number">{getValue()} min</span>
          ),
        }),
        slaCol.accessor("incidents30d", {
          header: tl("30 日事件数"),
          cell: ({ getValue }) => (
            <span className="financial-number">{getValue()}</span>
          ),
        }),
        slaCol.accessor("status", {
          header: tl("状态"),
          cell: ({ getValue }) => (
            <StatusBadge
              tone={getValue() === "healthy" ? "success" : "warning"}
            >
              {getValue() === "healthy" ? tl("达标") : tl("预算预警")}
            </StatusBadge>
          ),
        }),
      ]),
    [tl]
  )

  const table = useDataTable({
    columns,
    data: [...serviceSlaRows],
    getRowId: (row) => row.id,
    initialState: { pagination: { pageIndex: 0, pageSize: 10 } },
  })

  return (
    <div className="analytics-page">
      <FrostCard className="settings-register analytics-sla-table">
        <div className="bills-toolbar">
          <div className="bills-toolbar-head">
            <span className="bills-toolbar-title">
              {tl("核心服务 SLA 与错误预算")}
            </span>
          </div>
        </div>
        <DataTable
          table={table}
          caption={tl("核心服务 SLA 与错误预算")}
          columnAlign={slaAlign}
          rowHeaderColumn="service"
          selectAllLabel={tl("选择全部服务")}
          selectRowLabel={(row) => tl(row.service)}
          paginationLabel={tl("服务分页")}
          empty={null}
        />
      </FrostCard>
    </div>
  )
}
