import { useId, useMemo, useState } from "react"
import { toast } from "sonner"

import { useIsMobile } from "@marismoon/ui/hooks/use-mobile"
import {
  AppIcon,
  SolarBell,
  SolarCheck,
  SolarClock3,
  SolarEye,
  SolarSearch,
  SolarShieldAlert,
  SolarSparkles,
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
import { SparklineKpiCard } from "@/features/settings/SettingsSummaryVisuals"
import { useUiText } from "@/lib/i18n/use-ui-text"
import {
  notificationsActions,
  useNotificationsStore,
  type AlertItem,
  type AlertSeverity,
  type AlertStatus,
} from "@/shared/mocks/notifications-store"
import {
  getCurrentMember,
  useWorkspaceStore,
} from "@/shared/mocks/workspace-store"

import "../bills/components/bill-drawer.css"
import "../bills/components/bills-controls.css"
import "../bills/components/bills-table.css"
import "../settings/settings-table.css"
import "./notifications.css"

export type AlertViewPreset = "all" | "pending" | "critical" | "normal"

const column = createDataTableColumns<AlertItem>()
const columnAlign = {
  currentValue: "end",
  actions: "end",
} as const

const severityMeta: Record<
  AlertSeverity,
  { label: string; tone: "danger" | "warning" | "info" }
> = {
  critical: { label: "严重", tone: "danger" },
  warning: { label: "重要", tone: "warning" },
  info: { label: "一般", tone: "info" },
}

const statusMeta: Record<
  AlertStatus,
  { label: string; tone: "danger" | "warning" | "neutral" | "success" }
> = {
  open: { label: "待处理", tone: "danger" },
  acknowledged: { label: "处理中", tone: "warning" },
  silenced: { label: "已静默", tone: "neutral" },
  resolved: { label: "已解决", tone: "success" },
}

function filterByPreset(alerts: readonly AlertItem[], preset: AlertViewPreset) {
  if (preset === "pending") {
    return alerts.filter(
      (a) => a.status === "open" || a.status === "acknowledged"
    )
  }
  if (preset === "critical") {
    return alerts.filter((a) => a.severity === "critical")
  }
  if (preset === "normal") {
    return alerts.filter(
      (a) => a.severity === "warning" || a.severity === "info"
    )
  }
  return alerts
}

export function AlertCenterSummary({
  preset = "all",
}: {
  preset?: AlertViewPreset
}) {
  const tl = useUiText()
  const { alerts } = useNotificationsStore()
  const scoped = filterByPreset(alerts, preset)

  const total = scoped.length
  const openCount = scoped.filter((a) => a.status === "open").length
  const ackCount = scoped.filter((a) => a.status === "acknowledged").length
  const resolvedCount = scoped.filter(
    (a) => a.status === "resolved" || a.status === "silenced"
  ).length
  const onTimeCount = scoped.filter(
    (a) => a.status !== "open" || a.slaMinutesLeft > 15
  ).length
  const slaRate = total > 0 ? Math.round((onTimeCount / total) * 100) : 100

  const primaryLabel =
    preset === "pending"
      ? tl("待处置告警")
      : preset === "critical"
        ? tl("严重告警总数")
        : preset === "normal"
          ? tl("一般与重要告警")
          : tl("活跃与近期告警")

  const alertTrend24h = [
    { label: "00:00", value: Math.max(total - 3, 1) },
    { label: "04:00", value: Math.max(total - 4, 1) },
    { label: "08:00", value: Math.max(total - 2, 1) },
    { label: "12:00", value: total + 1 },
    { label: "16:00", value: total + 2 },
    { label: "20:00", value: Math.max(total - 1, 1) },
    { label: "24:00", value: total },
  ]
  const backlogBars = [
    { label: "08:00", value: openCount + 2 },
    { label: "10:00", value: openCount + 1 },
    { label: "12:00", value: openCount + 3 },
    { label: "14:00", value: openCount + 1 },
    { label: "16:00", value: openCount + 2 },
    { label: "18:00", value: openCount },
    { label: "20:00", value: openCount },
  ]
  const slaTrend = [
    { label: "11/20", value: Math.max(slaRate - 6, 70) },
    { label: "11/21", value: Math.max(slaRate - 4, 75) },
    { label: "11/22", value: Math.max(slaRate - 2, 80) },
    { label: "11/23", value: Math.max(slaRate - 5, 76) },
    { label: "11/24", value: Math.max(slaRate - 1, 82) },
    { label: "11/25", value: slaRate },
    { label: "11/26", value: slaRate },
  ]
  const mttaTrend = [
    { label: "11/20", value: 11.4 },
    { label: "11/21", value: 10.6 },
    { label: "11/22", value: 9.8 },
    { label: "11/23", value: 10.2 },
    { label: "11/24", value: 9.1 },
    { label: "11/25", value: 8.7 },
    { label: "11/26", value: 8.4 },
  ]

  return (
    <section
      className="settings-summary-grid"
      data-cols="4"
      aria-label={tl("告警概况")}
    >
      <SparklineKpiCard
        featured
        label={primaryLabel}
        value={`${total} ${tl("条")}`}
        formatHoverValue={(v) => `${v} ${tl("条")}`}
        badge={`${tl("已静默 / 解决")} ${resolvedCount}`}
        badgeTone="success"
        note={tl("待处理 {{open}} · 处理中 {{ack}}", {
          open: openCount,
          ack: ackCount,
        })}
        data={alertTrend24h}
        variant="area"
        color={
          preset === "critical" ? "var(--chart-negative)" : "var(--chart-1)"
        }
      />

      <SparklineKpiCard
        label={tl("待认领积压")}
        value={`${openCount} ${tl("条")}`}
        formatHoverValue={(v) => `${v} ${tl("条")}`}
        badge={openCount > 0 ? tl("需优先处置") : tl("已清空")}
        badgeTone={openCount > 0 ? "danger" : "success"}
        note={tl("处理中 {{ack}} 条，均已分配责任人", { ack: ackCount })}
        data={backlogBars}
        variant="bar"
        color="var(--chart-negative)"
      />

      <SparklineKpiCard
        label={tl("SLA 响应达标率")}
        value={`${slaRate}%`}
        formatHoverValue={(v) => `${v}%`}
        badge={`${onTimeCount}/${total}`}
        badgeTone={slaRate >= 85 ? "success" : "warning"}
        note={tl("严重告警 30 分钟内须认领处置")}
        data={slaTrend}
        variant="line"
        color={slaRate >= 85 ? "var(--chart-positive)" : "var(--chart-warning)"}
      />

      <SparklineKpiCard
        label={tl("平均认领耗时 MTTA")}
        value="8.4 min"
        formatHoverValue={(v) => `${v.toFixed(1)} min`}
        badge="-18%"
        badgeTone="info"
        note={tl("近 7 日首次响应耗时持续下降")}
        data={mttaTrend}
        variant="line"
        color="var(--chart-2)"
      />
    </section>
  )
}

export function AlertCenterPage({
  preset = "all",
}: {
  preset?: AlertViewPreset
}) {
  const tl = useUiText()
  const mobile = useIsMobile()
  const searchId = useId()
  const { alerts } = useNotificationsStore()
  const workspace = useWorkspaceStore()
  const currentMember = getCurrentMember(workspace)

  const [query, setQuery] = useState("")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [detailId, setDetailId] = useState<string | null>(null)

  const scoped = useMemo(() => filterByPreset(alerts, preset), [alerts, preset])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return scoped.filter((item) => {
      if (severityFilter !== "all" && item.severity !== severityFilter)
        return false
      if (statusFilter !== "all" && item.status !== statusFilter) return false
      if (!q) return true
      return (
        item.title.toLowerCase().includes(q) ||
        tl(item.title).toLowerCase().includes(q) ||
        item.resource.toLowerCase().includes(q) ||
        item.source.toLowerCase().includes(q) ||
        tl(item.source).toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q)
      )
    })
  }, [query, scoped, severityFilter, statusFilter, tl])

  const hasFilters =
    query.trim() !== "" || severityFilter !== "all" || statusFilter !== "all"

  const detailAlert = alerts.find((a) => a.id === detailId) ?? null

  const columns = useMemo(
    () =>
      column.columns([
        column.display({ id: "selection" }),
        column.accessor("title", {
          header: tl("告警事件"),
          cell: ({ row }) => (
            <>
              <button
                type="button"
                className="bill-row-id text-left hover:underline"
                onClick={() => setDetailId(row.original.id)}
              >
                {tl(row.original.title)}
              </button>
              <span className="bill-row-account">
                {row.original.id} · {row.original.resource}
              </span>
            </>
          ),
        }),
        column.accessor("severity", {
          header: tl("级别"),
          cell: ({ getValue }) => {
            const meta = severityMeta[getValue()]
            return <StatusBadge tone={meta.tone}>{tl(meta.label)}</StatusBadge>
          },
        }),
        column.accessor("source", {
          header: tl("来源"),
          cell: ({ getValue }) => (
            <span className="bill-row-pill">{tl(getValue())}</span>
          ),
        }),
        column.accessor("currentValue", {
          header: tl("当前值 / 阈值"),
          cell: ({ row }) => (
            <>
              <span className="font-semibold financial-number">
                {row.original.currentValue}
              </span>
              <span className="bill-row-account financial-number">
                {tl("阈值")} {row.original.threshold}
              </span>
            </>
          ),
        }),
        column.accessor("status", {
          header: tl("状态"),
          cell: ({ getValue }) => {
            const meta = statusMeta[getValue()]
            return <StatusBadge tone={meta.tone}>{tl(meta.label)}</StatusBadge>
          },
        }),
        column.accessor("triggeredAt", {
          header: tl("触发时间"),
          cell: ({ row }) => (
            <>
              <span className="text-muted-foreground financial-number">
                {row.original.triggeredAt}
              </span>
              {row.original.slaMinutesLeft > 0 &&
                row.original.status !== "resolved" && (
                  <span className="bill-row-account financial-number">
                    SLA {row.original.slaMinutesLeft}m
                  </span>
                )}
            </>
          ),
        }),
        column.display({
          id: "actions",
          header: tl("操作"),
          cell: ({ row }) => (
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              className="bill-detail-action"
              aria-label={tl("查看详情")}
              title={tl("查看详情")}
              onClick={() => setDetailId(row.original.id)}
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

  const toolbarTitle =
    preset === "pending"
      ? tl("待处理告警队列")
      : preset === "critical"
        ? tl("严重告警列表")
        : preset === "normal"
          ? tl("一般与重要告警列表")
          : tl("全部告警事件")

  return (
    <>
      <FrostCard className="settings-register notifications-alert-table">
        <div className="bills-toolbar">
          <div className="bills-toolbar-head">
            <span className="bills-toolbar-title">{toolbarTitle}</span>
          </div>
          <div className="bills-toolbar-fields" role="search">
            <div
              className="bills-search data-table-search field-surface"
              data-field-focus="quiet"
            >
              <label className="sr-only" htmlFor={searchId}>
                {tl("搜索告警标题、编号、资源或来源")}
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
                placeholder={tl("搜索告警标题、编号、资源或来源")}
              />
            </div>

            <div className="bills-selects">
              {preset !== "critical" && preset !== "normal" && (
                <Select
                  value={severityFilter}
                  onValueChange={(value) => {
                    table.firstPage()
                    setSeverityFilter(value)
                  }}
                >
                  <SelectTrigger
                    size="dense"
                    aria-label={tl("按级别筛选")}
                    className="data-table-filter"
                    data-active={severityFilter !== "all" || undefined}
                  >
                    <span className="bill-filter-label" aria-hidden="true">
                      {tl("级别")}：
                    </span>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper" align="start">
                    <SelectItem value="all">{tl("全部")}</SelectItem>
                    <SelectItem value="critical">{tl("严重")}</SelectItem>
                    <SelectItem value="warning">{tl("重要")}</SelectItem>
                    <SelectItem value="info">{tl("一般")}</SelectItem>
                  </SelectContent>
                </Select>
              )}

              {preset !== "pending" && (
                <Select
                  value={statusFilter}
                  onValueChange={(value) => {
                    table.firstPage()
                    setStatusFilter(value)
                  }}
                >
                  <SelectTrigger
                    size="dense"
                    aria-label={tl("按状态筛选")}
                    className="data-table-filter"
                    data-active={statusFilter !== "all" || undefined}
                  >
                    <span className="bill-filter-label" aria-hidden="true">
                      {tl("状态：")}
                    </span>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper" align="start">
                    <SelectItem value="all">{tl("全部")}</SelectItem>
                    <SelectItem value="open">{tl("待处理")}</SelectItem>
                    <SelectItem value="acknowledged">{tl("处理中")}</SelectItem>
                    <SelectItem value="silenced">{tl("已静默")}</SelectItem>
                    <SelectItem value="resolved">{tl("已解决")}</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            {hasFilters && (
              <Button
                className="bills-reset"
                type="button"
                variant="outline"
                size="dense"
                shape="workspace"
                onClick={() => {
                  setQuery("")
                  setSeverityFilter("all")
                  setStatusFilter("all")
                  table.firstPage()
                }}
              >
                {tl("清除筛选")}
              </Button>
            )}
          </div>
        </div>

        <DataTable
          table={table}
          caption={toolbarTitle}
          columnAlign={columnAlign}
          rowHeaderColumn="title"
          selectAllLabel={tl("选择本页所有告警")}
          selectRowLabel={(row) => tl(row.title)}
          paginationLabel={tl("告警分页")}
          scrollHint={tl("横向滚动查看指标阈值与触发时间")}
          empty={
            <EmptyState
              icon={preset === "pending" ? SolarClock3 : SolarBell}
              title={hasFilters ? tl("没有匹配的告警") : tl("当前暂无告警")}
            />
          }
        />
      </FrostCard>

      <Drawer
        open={detailAlert !== null}
        onOpenChange={(open) => {
          if (!open) setDetailId(null)
        }}
        direction={mobile ? "bottom" : "right"}
        noBodyStyles
      >
        <DrawerContent>
          {detailAlert && (
            <>
              <DrawerHeader>
                <div className="mb-1 flex items-center gap-2">
                  <StatusBadge tone={severityMeta[detailAlert.severity].tone}>
                    {tl(severityMeta[detailAlert.severity].label)}
                  </StatusBadge>
                  <StatusBadge tone={statusMeta[detailAlert.status].tone}>
                    {tl(statusMeta[detailAlert.status].label)}
                  </StatusBadge>
                  <span className="text-xs text-muted-foreground financial-number">
                    {detailAlert.id}
                  </span>
                </div>
                <DrawerTitle>{tl(detailAlert.title)}</DrawerTitle>
                <DrawerDescription>{tl(detailAlert.summary)}</DrawerDescription>
              </DrawerHeader>

              <div
                className="bill-drawer-body grid min-h-0 flex-1 content-start gap-4 overflow-y-auto px-4"
                data-vaul-no-drag=""
              >
                <div className="alert-ai-box">
                  <div className="alert-ai-box-head">
                    <AppIcon
                      icon={SolarSparkles}
                      size={15}
                      aria-hidden="true"
                    />
                    <span>{tl("智能根因诊断与处置建议")}</span>
                  </div>
                  <p>{tl(detailAlert.aiDiagnosis)}</p>
                  <small>{tl(detailAlert.suggestedAction)}</small>
                </div>

                <section className="bill-drawer-section">
                  <h3>{tl("告警上下文")}</h3>
                  <dl className="bill-drawer-rows">
                    <div>
                      <dt>{tl("告警来源")}</dt>
                      <dd>{tl(detailAlert.source)}</dd>
                    </div>
                    <div>
                      <dt>{tl("关联资源")}</dt>
                      <dd className="financial-number">
                        {detailAlert.resource}
                      </dd>
                    </div>
                    <div>
                      <dt>{tl("触发指标")}</dt>
                      <dd>{tl(detailAlert.metric)}</dd>
                    </div>
                    <div>
                      <dt>{tl("当前值 / 阈值")}</dt>
                      <dd className="financial-number">
                        {detailAlert.currentValue}（{detailAlert.threshold}）
                      </dd>
                    </div>
                    <div>
                      <dt>{tl("责任人")}</dt>
                      <dd>{tl(detailAlert.assignee)}</dd>
                    </div>
                    <div>
                      <dt>{tl("触发时间")}</dt>
                      <dd className="financial-number">
                        {detailAlert.triggeredAt}
                      </dd>
                    </div>
                  </dl>
                </section>
              </div>

              <DrawerFooter>
                {detailAlert.status === "open" && (
                  <Button
                    type="button"
                    onClick={() => {
                      notificationsActions.updateAlertStatus(
                        detailAlert.id,
                        "acknowledged",
                        currentMember?.name ?? detailAlert.assignee
                      )
                      toast.success(tl("已认领该告警，状态更新为处理中"))
                    }}
                  >
                    <AppIcon
                      icon={SolarShieldAlert}
                      data-icon="inline-start"
                      aria-hidden
                    />
                    {tl("认领处理")}
                  </Button>
                )}
                {detailAlert.status !== "resolved" && (
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        notificationsActions.updateAlertStatus(
                          detailAlert.id,
                          "silenced"
                        )
                        toast.success(tl("已将该告警静默 2 小时"))
                      }}
                    >
                      {tl("静默 2 小时")}
                    </Button>
                    <Button
                      type="button"
                      variant={
                        detailAlert.status === "open" ? "outline" : "default"
                      }
                      onClick={() => {
                        notificationsActions.updateAlertStatus(
                          detailAlert.id,
                          "resolved"
                        )
                        toast.success(tl("已标记为已解决"))
                        setDetailId(null)
                      }}
                    >
                      <AppIcon
                        icon={SolarCheck}
                        data-icon="inline-start"
                        aria-hidden
                      />
                      {tl("标记解决")}
                    </Button>
                  </div>
                )}
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
