import { useId, useMemo, useState } from "react"
import { toast } from "sonner"

import { useIsMobile } from "@marismoon/ui/hooks/use-mobile"
import {
  AppIcon,
  SolarEye,
  SolarMail,
  SolarRefreshCcw,
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
import {
  SummaryMiniBars,
  SummaryRingGauge,
  SummarySegmentedBar,
} from "@/features/settings/SettingsSummaryVisuals"
import { useUiText } from "@/lib/i18n/use-ui-text"
import {
  notificationsActions,
  useNotificationsStore,
  type DeliveryChannel,
  type DeliveryStatus,
  type NotificationDeliveryLog,
} from "@/shared/mocks/notifications-store"

import "../bills/components/bill-drawer.css"
import "../bills/components/bills-controls.css"
import "../bills/components/bills-table.css"
import "../settings/settings-table.css"
import "./notifications.css"

const column = createDataTableColumns<NotificationDeliveryLog>()
const columnAlign = {
  latencyMs: "end",
  actions: "end",
} as const

const channelMeta: Record<DeliveryChannel, string> = {
  inApp: "站内信",
  email: "邮件",
  feishu: "飞书机器人",
  wecom: "企微机器人",
  webhook: "Webhook",
}

const statusMeta: Record<
  DeliveryStatus,
  { label: string; tone: "success" | "danger" | "neutral" }
> = {
  delivered: { label: "已送达", tone: "success" },
  failed: { label: "发送失败", tone: "danger" },
  throttled: { label: "已抑制", tone: "neutral" },
}

export function NotificationLogsSummary() {
  const tl = useUiText()
  const { deliveryLogs } = useNotificationsStore()

  const total = deliveryLogs.length
  const delivered = deliveryLogs.filter((l) => l.status === "delivered").length
  const failed = deliveryLogs.filter((l) => l.status === "failed").length
  const throttled = deliveryLogs.filter((l) => l.status === "throttled").length
  const successRate = total > 0 ? Math.round((delivered / total) * 100) : 100

  const channels: DeliveryChannel[] = [
    "feishu",
    "email",
    "wecom",
    "inApp",
    "webhook",
  ]
  const dist = channels
    .map((ch) => ({
      label: tl(channelMeta[ch]),
      value: deliveryLogs.filter((l) => l.channel === ch).length,
    }))
    .filter((item) => item.value > 0)
  const maxCount = Math.max(...dist.map((item) => item.value), 1)

  return (
    <section className="settings-summary-grid" aria-label={tl("通知投递概况")}>
      <FrostCard className="settings-summary-card hero-surface">
        <div className="settings-summary-meta">
          <div className="settings-summary-label">{tl("近期投递总数")}</div>
          <div className="settings-summary-value financial-number">
            {total} {tl("次")}
          </div>
        </div>
        <SummarySegmentedBar
          total={Math.max(total, 1)}
          items={[
            { label: tl("已送达"), count: delivered, tone: "success" },
            { label: tl("发送失败"), count: failed, tone: "danger" },
            { label: tl("已抑制"), count: throttled, tone: "neutral" },
          ]}
        />
      </FrostCard>

      <FrostCard className="settings-summary-card">
        <div className="settings-summary-label">{tl("投递通道分布")}</div>
        <SummaryMiniBars
          items={dist.map((item) => ({
            label: item.label,
            value: item.value,
            max: maxCount,
          }))}
        />
      </FrostCard>

      <FrostCard className="settings-summary-card">
        <div className="settings-summary-top">
          <div className="settings-summary-meta">
            <div className="settings-summary-label">{tl("通道送达成功率")}</div>
            <div className="settings-summary-value financial-number">
              {delivered} / {total}
            </div>
            <p className="settings-summary-note">
              {tl("发送失败的回调支持一键重发并记录回执")}
            </p>
          </div>
          <SummaryRingGauge
            percent={successRate}
            tone={successRate >= 85 ? "success" : "warning"}
            label={tl("通道送达成功率")}
          />
        </div>
      </FrostCard>
    </section>
  )
}

export function NotificationLogsPage() {
  const tl = useUiText()
  const mobile = useIsMobile()
  const searchId = useId()
  const { deliveryLogs } = useNotificationsStore()

  const [query, setQuery] = useState("")
  const [channelFilter, setChannelFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [detailId, setDetailId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return deliveryLogs.filter((log) => {
      if (channelFilter !== "all" && log.channel !== channelFilter) return false
      if (statusFilter !== "all" && log.status !== statusFilter) return false
      if (!q) return true
      return (
        log.alertTitle.toLowerCase().includes(q) ||
        tl(log.alertTitle).toLowerCase().includes(q) ||
        log.recipient.toLowerCase().includes(q) ||
        log.alertId.toLowerCase().includes(q)
      )
    })
  }, [channelFilter, deliveryLogs, query, statusFilter, tl])

  const detailLog = deliveryLogs.find((l) => l.id === detailId) ?? null
  const hasFilters =
    query.trim() !== "" || channelFilter !== "all" || statusFilter !== "all"

  const columns = useMemo(
    () =>
      column.columns([
        column.accessor("alertTitle", {
          header: tl("关联告警 / 编号"),
          cell: ({ row }) => (
            <>
              <button
                type="button"
                className="bill-row-id text-left hover:underline"
                onClick={() => setDetailId(row.original.id)}
              >
                {tl(row.original.alertTitle)}
              </button>
              <span className="bill-row-account financial-number">
                {row.original.id} · {row.original.alertId}
              </span>
            </>
          ),
        }),
        column.accessor("channel", {
          header: tl("通道"),
          cell: ({ getValue }) => (
            <span className="bill-row-pill">{tl(channelMeta[getValue()])}</span>
          ),
        }),
        column.accessor("recipient", {
          header: tl("接收对象"),
          cell: ({ getValue }) => (
            <span className="truncate">{tl(getValue())}</span>
          ),
        }),
        column.accessor("status", {
          header: tl("投递状态"),
          cell: ({ getValue }) => {
            const meta = statusMeta[getValue()]
            return <StatusBadge tone={meta.tone}>{tl(meta.label)}</StatusBadge>
          },
        }),
        column.accessor("latencyMs", {
          header: tl("耗时"),
          cell: ({ getValue }) => (
            <span className="text-muted-foreground financial-number">
              {getValue()} ms
            </span>
          ),
        }),
        column.accessor("sentAt", {
          header: tl("发送时间"),
          cell: ({ getValue }) => (
            <span className="text-muted-foreground financial-number">
              {getValue()}
            </span>
          ),
        }),
        column.display({
          id: "actions",
          header: tl("操作"),
          cell: ({ row }) => (
            <div className="inline-flex items-center justify-end gap-1">
              {row.original.status === "failed" && (
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  className="bill-detail-action"
                  aria-label={tl("重新发送")}
                  title={tl("重新发送")}
                  onClick={() => {
                    notificationsActions.retryDeliveryLog(row.original.id)
                    toast.success(tl("已重新投递该通知"))
                  }}
                >
                  <AppIcon icon={SolarRefreshCcw} size={16} />
                </Button>
              )}
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                className="bill-detail-action"
                aria-label={tl("查看回执")}
                title={tl("查看回执")}
                onClick={() => setDetailId(row.original.id)}
              >
                <AppIcon icon={SolarEye} size={18} />
              </Button>
            </div>
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
    <>
      <FrostCard className="settings-register notifications-logs-table">
        <div className="bills-toolbar">
          <div className="bills-toolbar-head">
            <span className="bills-toolbar-title">{tl("通知投递记录")}</span>
          </div>
          <div className="bills-toolbar-fields" role="search">
            <div
              className="bills-search field-surface"
              data-field-focus="quiet"
            >
              <label className="sr-only" htmlFor={searchId}>
                {tl("搜索告警标题、接收对象或编号")}
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
                placeholder={tl("搜索告警标题、接收对象或编号")}
              />
            </div>

            <div className="bills-selects">
              <Select
                value={channelFilter}
                onValueChange={(value) => {
                  table.firstPage()
                  setChannelFilter(value)
                }}
              >
                <SelectTrigger
                  size="dense"
                  aria-label={tl("按通道筛选")}
                  className="data-table-filter"
                  data-active={channelFilter !== "all" || undefined}
                >
                  <span className="bill-filter-label" aria-hidden="true">
                    {tl("通道")}：
                  </span>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" align="start">
                  <SelectItem value="all">{tl("全部")}</SelectItem>
                  <SelectItem value="inApp">{tl("站内信")}</SelectItem>
                  <SelectItem value="email">{tl("邮件")}</SelectItem>
                  <SelectItem value="feishu">{tl("飞书机器人")}</SelectItem>
                  <SelectItem value="wecom">{tl("企微机器人")}</SelectItem>
                  <SelectItem value="webhook">Webhook</SelectItem>
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
                  <SelectItem value="delivered">{tl("已送达")}</SelectItem>
                  <SelectItem value="failed">{tl("发送失败")}</SelectItem>
                  <SelectItem value="throttled">{tl("已抑制")}</SelectItem>
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
                onClick={() => {
                  setQuery("")
                  setChannelFilter("all")
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
          caption={tl("通知投递记录")}
          columnAlign={columnAlign}
          rowHeaderColumn="alertTitle"
          selectAllLabel={tl("选择所有记录")}
          selectRowLabel={(row) => tl(row.alertTitle)}
          paginationLabel={tl("记录分页")}
          empty={
            <EmptyState icon={SolarMail} title={tl("没有匹配的通知记录")} />
          }
        />
      </FrostCard>

      <Drawer
        open={detailLog !== null}
        onOpenChange={(open) => {
          if (!open) setDetailId(null)
        }}
        direction={mobile ? "bottom" : "right"}
        noBodyStyles
      >
        <DrawerContent>
          {detailLog && (
            <>
              <DrawerHeader>
                <div className="mb-1 flex items-center gap-2">
                  <StatusBadge tone={statusMeta[detailLog.status].tone}>
                    {tl(statusMeta[detailLog.status].label)}
                  </StatusBadge>
                  <span className="text-xs text-muted-foreground financial-number">
                    {detailLog.id}
                  </span>
                </div>
                <DrawerTitle>{tl(detailLog.alertTitle)}</DrawerTitle>
                <DrawerDescription>
                  {tl(channelMeta[detailLog.channel])} ·{" "}
                  {tl(detailLog.recipient)}
                </DrawerDescription>
              </DrawerHeader>

              <div
                className="bill-drawer-body grid min-h-0 flex-1 content-start gap-4 overflow-y-auto px-4"
                data-vaul-no-drag=""
              >
                <section className="bill-drawer-section">
                  <h3>{tl("投递回执详情")}</h3>
                  <dl className="bill-drawer-rows">
                    <div>
                      <dt>{tl("关联告警")}</dt>
                      <dd className="financial-number">{detailLog.alertId}</dd>
                    </div>
                    <div>
                      <dt>{tl("发送通道")}</dt>
                      <dd>{tl(channelMeta[detailLog.channel])}</dd>
                    </div>
                    <div>
                      <dt>{tl("响应耗时")}</dt>
                      <dd className="financial-number">
                        {detailLog.latencyMs} ms
                      </dd>
                    </div>
                    <div>
                      <dt>{tl("投递时间")}</dt>
                      <dd className="financial-number">{detailLog.sentAt}</dd>
                    </div>
                    <div>
                      <dt>{tl("回执结果")}</dt>
                      <dd>{tl(detailLog.detail)}</dd>
                    </div>
                  </dl>
                </section>
              </div>

              <DrawerFooter>
                {detailLog.status === "failed" && (
                  <Button
                    type="button"
                    onClick={() => {
                      notificationsActions.retryDeliveryLog(detailLog.id)
                      toast.success(tl("已重新投递该通知"))
                    }}
                  >
                    <AppIcon
                      icon={SolarRefreshCcw}
                      data-icon="inline-start"
                      aria-hidden
                    />
                    {tl("重新发送")}
                  </Button>
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
