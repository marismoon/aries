import { useId, useMemo, useState } from "react"

import { useIsMobile } from "@marismoon/ui/hooks/use-mobile"
import {
  AppIcon,
  SolarEye,
  SolarFileSearch,
  SolarSearch,
} from "@marismoon/ui/icons"
import { DataTable } from "@marismoon/ui/shared/DataTable"
import { EmptyState } from "@marismoon/ui/shared/EmptyState"
import { FrostCard } from "@marismoon/ui/shared/FrostCard"
import { StatusBadge } from "@marismoon/ui/shared/StatusBadge"
import {
  createDataTableColumns,
  useDataTable,
} from "@marismoon/ui/shared/use-data-table"
import { Button } from "@marismoon/ui/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@marismoon/ui/ui/drawer"
import { Input } from "@marismoon/ui/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@marismoon/ui/ui/select"
import { useUiText } from "@/lib/i18n/use-ui-text"
import { SparklineKpiCard } from "../SettingsSummaryVisuals"
import { useWorkspaceStore } from "@/shared/mocks/workspace-store"
import type { AuditLog } from "@/shared/types/workspace-settings"

import "../../bills/components/bill-drawer.css"
import "../../bills/components/bills-controls.css"
import "../../bills/components/bills-table.css"
import "../settings-table.css"

const column = createDataTableColumns<AuditLog>()
const columnAlign = { actions: "end" } as const

const auditStatusMeta = {
  success: { label: "成功", tone: "success" as const },
  warning: { label: "告警", tone: "warning" as const },
  failed: { label: "失败", tone: "danger" as const },
}

export function AuditLogSummary() {
  const tl = useUiText()
  const { auditLogs } = useWorkspaceStore()

  const total = auditLogs.length
  const successCount = auditLogs.filter((l) => l.status === "success").length
  const warningCount = auditLogs.filter((l) => l.status === "warning").length
  const failedCount = auditLogs.filter((l) => l.status === "failed").length
  const abnormalCount = warningCount + failedCount
  const successRate = total > 0 ? Math.round((successCount / total) * 100) : 100
  const uniqueActors = new Set(auditLogs.map((l) => l.actorEmail)).size
  const uniqueIps = new Set(auditLogs.map((l) => l.ip)).size

  const auditVolumeTrend = [
    { label: "11/20", value: 42 },
    { label: "11/21", value: 58 },
    { label: "11/22", value: 31 },
    { label: "11/23", value: 49 },
    { label: "11/24", value: 64 },
    { label: "11/25", value: 52 },
    { label: "11/26", value: total },
  ]
  const successRateTrend = [
    { label: "11/20", value: 96 },
    { label: "11/21", value: 94 },
    { label: "11/22", value: 98 },
    { label: "11/23", value: 95 },
    { label: "11/24", value: 92 },
    { label: "11/25", value: 97 },
    { label: "11/26", value: successRate },
  ]
  const abnormalTrend = [
    { label: "11/20", value: 2 },
    { label: "11/21", value: 3 },
    { label: "11/22", value: 1 },
    { label: "11/23", value: 2 },
    { label: "11/24", value: 4 },
    { label: "11/25", value: 1 },
    { label: "11/26", value: abnormalCount },
  ]
  const actorTrend = [
    { label: "11/20", value: Math.max(uniqueActors - 1, 1) },
    { label: "11/21", value: uniqueActors },
    { label: "11/22", value: Math.max(uniqueActors - 2, 1) },
    { label: "11/23", value: uniqueActors },
    { label: "11/24", value: uniqueActors + 1 },
    { label: "11/25", value: uniqueActors },
    { label: "11/26", value: uniqueActors },
  ]

  return (
    <section
      className="settings-summary-grid"
      data-cols="4"
      aria-label={tl("审计日志概况")}
    >
      <SparklineKpiCard
        featured
        label={tl("累计审计记录")}
        value={`${total} ${tl("条")}`}
        formatHoverValue={(v) => `${v} ${tl("条")}`}
        badge={tl("全量留痕")}
        badgeTone="info"
        note={tl("近 7 日操作事件采集吞吐走势")}
        data={auditVolumeTrend}
        variant="area"
        color="var(--chart-1)"
      />

      <SparklineKpiCard
        label={tl("执行成功率")}
        value={`${successRate}%`}
        formatHoverValue={(v) => `${v}%`}
        badge={`${successCount}/${total}`}
        badgeTone={abnormalCount === 0 ? "success" : "warning"}
        note={tl("近 7 日配置与权限变更成功走势")}
        data={successRateTrend}
        variant="line"
        color="var(--chart-positive)"
      />

      <SparklineKpiCard
        label={tl("高危与异常事件")}
        value={`${abnormalCount} ${tl("条")}`}
        formatHoverValue={(v) => `${v} ${tl("条")}`}
        badge={abnormalCount > 0 ? tl("需核查") : tl("正常")}
        badgeTone={abnormalCount > 0 ? "danger" : "success"}
        note={tl("告警 {{warning}} · 失败 {{failed}}", {
          warning: warningCount,
          failed: failedCount,
        })}
        data={abnormalTrend}
        variant="bar"
        color="var(--chart-negative)"
      />

      <SparklineKpiCard
        label={tl("活跃操作人与来源")}
        value={`${uniqueActors} ${tl("人")}`}
        formatHoverValue={(v) => `${v} ${tl("人")}`}
        badge={`${uniqueIps} IP`}
        badgeTone="neutral"
        note={tl("覆盖 {{ips}} 个来源 IP 的管理操作", { ips: uniqueIps })}
        data={actorTrend}
        variant="bar"
        color="var(--chart-2)"
      />
    </section>
  )
}

export function AuditLogPage() {
  const tl = useUiText()
  const mobile = useIsMobile()
  const searchId = useId()
  const store = useWorkspaceStore()

  const [query, setQuery] = useState("")
  const [moduleFilter, setModuleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const modules = useMemo(
    () => Array.from(new Set(store.auditLogs.map((log) => log.module))),
    [store.auditLogs]
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return store.auditLogs.filter((log) => {
      if (moduleFilter !== "all" && log.module !== moduleFilter) return false
      if (statusFilter !== "all" && log.status !== statusFilter) return false
      if (!q) return true
      return (
        log.actor.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.target.toLowerCase().includes(q) ||
        log.detail.toLowerCase().includes(q)
      )
    })
  }, [moduleFilter, query, statusFilter, store.auditLogs])

  const hasFilters =
    query.trim() !== "" || moduleFilter !== "all" || statusFilter !== "all"

  const selectedLog =
    store.auditLogs.find((log) => log.id === selectedId) ?? null

  const columns = useMemo(
    () =>
      column.columns([
        column.display({ id: "selection" }),
        column.accessor("timestamp", {
          header: tl("时间"),
          cell: ({ getValue }) => (
            <span className="text-muted-foreground financial-number">
              {getValue()}
            </span>
          ),
        }),
        column.accessor("actor", {
          header: tl("操作人"),
          cell: ({ row }) => (
            <>
              <span className="bill-row-id">{tl(row.original.actor)}</span>
              <span className="bill-row-account">
                {row.original.actorEmail}
              </span>
            </>
          ),
        }),
        column.accessor("module", {
          header: tl("模块"),
          cell: ({ getValue }) => (
            <span className="bill-row-pill">{tl(getValue())}</span>
          ),
        }),
        column.accessor("action", {
          header: tl("动作 / 对象"),
          cell: ({ row }) => (
            <>
              <span className="bill-row-id whitespace-normal">
                {tl(row.original.action)}
              </span>
              <span className="bill-row-account">{row.original.target}</span>
            </>
          ),
        }),
        column.accessor("ip", {
          header: tl("来源 IP"),
          cell: ({ getValue }) => (
            <span className="text-muted-foreground financial-number">
              {getValue()}
            </span>
          ),
        }),
        column.accessor("status", {
          header: tl("结果"),
          cell: ({ getValue }) => {
            const meta = auditStatusMeta[getValue()]
            return <StatusBadge tone={meta.tone}>{tl(meta.label)}</StatusBadge>
          },
        }),
        column.display({
          id: "actions",
          header: tl("详情"),
          cell: ({ row }) => (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="bill-detail-action"
              aria-label={tl("查看审计详情")}
              title={tl("查看审计详情")}
              onClick={() => setSelectedId(row.original.id)}
            >
              <AppIcon icon={SolarEye} size={18} />
            </Button>
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

  function handleReset() {
    setQuery("")
    setModuleFilter("all")
    setStatusFilter("all")
    table.firstPage()
  }

  return (
    <>
      <FrostCard className="settings-register settings-audit-table">
        <div className="bills-toolbar">
          <div className="bills-toolbar-head">
            <span className="bills-toolbar-title">{tl("操作审计日志")}</span>
          </div>
          <div className="bills-toolbar-fields" role="search">
            <div
              className="bills-search data-table-search field-surface"
              data-field-focus="quiet"
            >
              <label className="sr-only" htmlFor={searchId}>
                {tl("搜索操作人、动作或目标对象")}
              </label>
              <AppIcon icon={SolarSearch} size={16} />
              <Input
                embedded
                className="bills-search-input"
                controlSize="dense"
                id={searchId}
                type="search"
                value={query}
                onChange={(e) => {
                  table.firstPage()
                  setQuery(e.target.value)
                }}
                placeholder={tl("搜索操作人、动作或目标对象")}
              />
            </div>

            <div className="bills-selects">
              <Select
                value={moduleFilter}
                onValueChange={(value) => {
                  table.firstPage()
                  setModuleFilter(value)
                }}
              >
                <SelectTrigger
                  size="dense"
                  aria-label={tl("按模块筛选")}
                  className="data-table-filter"
                  data-active={moduleFilter !== "all" || undefined}
                >
                  <span className="bill-filter-label" aria-hidden="true">
                    {tl("模块")}：
                  </span>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" align="start">
                  <SelectItem value="all">{tl("全部")}</SelectItem>
                  {modules.map((mod) => (
                    <SelectItem key={mod} value={mod}>
                      {tl(mod)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  table.firstPage()
                  setStatusFilter(value)
                }}
              >
                <SelectTrigger
                  size="dense"
                  aria-label={tl("按结果筛选")}
                  className="data-table-filter"
                  data-active={statusFilter !== "all" || undefined}
                >
                  <span className="bill-filter-label" aria-hidden="true">
                    {tl("结果")}：
                  </span>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" align="start">
                  <SelectItem value="all">{tl("全部")}</SelectItem>
                  <SelectItem value="success">{tl("成功")}</SelectItem>
                  <SelectItem value="warning">{tl("告警")}</SelectItem>
                  <SelectItem value="failed">{tl("失败")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {hasFilters && (
              <Button
                className="bills-reset"
                type="button"
                variant="outline"
                size="dense"
                shape="workspace"
                onClick={handleReset}
              >
                {tl("清除筛选")}
              </Button>
            )}
          </div>
        </div>

        <DataTable
          table={table}
          caption={tl("操作审计日志")}
          columnAlign={columnAlign}
          rowHeaderColumn="timestamp"
          selectAllLabel={tl("选择本页所有日志")}
          selectRowLabel={(row) => tl("选择日志 {{id}}", { id: row.id })}
          paginationLabel={tl("操作日志分页")}
          scrollHint={tl("横向滚动查看来源 IP 与执行结果")}
          empty={
            <EmptyState
              icon={SolarFileSearch}
              title={tl("没有匹配的操作日志")}
              action={
                <Button variant="outline" onClick={handleReset}>
                  {tl("清除筛选")}
                </Button>
              }
            />
          }
        />
      </FrostCard>

      <Drawer
        open={selectedLog !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null)
        }}
        direction={mobile ? "bottom" : "right"}
        noBodyStyles
      >
        <DrawerContent>
          {selectedLog && (
            <>
              <DrawerHeader>
                <DrawerTitle>{tl(selectedLog.action)}</DrawerTitle>
                <DrawerDescription>
                  {selectedLog.timestamp} · {tl(selectedLog.actor)}
                </DrawerDescription>
              </DrawerHeader>
              <div
                className="bill-drawer-body min-h-0 flex-1 overflow-y-auto px-4"
                data-vaul-no-drag=""
              >
                <section className="bill-drawer-section">
                  <h3>{tl("事件摘要")}</h3>
                  <dl className="bill-drawer-rows">
                    <div>
                      <dt>{tl("请求编号")}</dt>
                      <dd className="financial-number">
                        {selectedLog.requestId}
                      </dd>
                    </div>
                    <div>
                      <dt>{tl("所属模块")}</dt>
                      <dd>{tl(selectedLog.module)}</dd>
                    </div>
                    <div>
                      <dt>{tl("操作对象")}</dt>
                      <dd>{selectedLog.target}</dd>
                    </div>
                    <div>
                      <dt>{tl("来源 IP")}</dt>
                      <dd className="financial-number">{selectedLog.ip}</dd>
                    </div>
                    <div>
                      <dt>{tl("客户端")}</dt>
                      <dd>{selectedLog.userAgent}</dd>
                    </div>
                  </dl>
                </section>
                <section className="bill-drawer-section">
                  <h3>{tl("变更详情")}</h3>
                  <p className="rounded-(--radius-control) bg-(--recess) p-3 text-xs leading-relaxed text-foreground">
                    {selectedLog.detail}
                  </p>
                </section>
              </div>
              <DrawerFooter>
                <DrawerClose asChild>
                  <Button type="button" variant="outline">
                    {tl("关闭")}
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  )
}
