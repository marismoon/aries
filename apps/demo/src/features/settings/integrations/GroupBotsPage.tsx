import { useId, useMemo, useState, type FormEvent } from "react"
import { toast } from "sonner"

import { useIsMobile } from "@marismoon/ui/hooks/use-mobile"
import {
  AppIcon,
  SolarBell,
  SolarEye,
  SolarPlain3,
  SolarPlus,
  SolarSearch,
  SolarTrashBinTrash,
} from "@marismoon/ui/icons"
import { CopyButton } from "@marismoon/ui/shared/CopyButton"
import { DataTable } from "@marismoon/ui/shared/DataTable"
import { EmptyState } from "@marismoon/ui/shared/EmptyState"
import { FrostCard } from "@marismoon/ui/shared/FrostCard"
import { StatusBadge } from "@marismoon/ui/shared/StatusBadge"
import {
  createDataTableColumns,
  useDataTable,
} from "@marismoon/ui/shared/use-data-table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@marismoon/ui/ui/alert-dialog"
import { Button } from "@marismoon/ui/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@marismoon/ui/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@marismoon/ui/ui/drawer"
import { Field, FieldLabel } from "@marismoon/ui/ui/field"
import { Input } from "@marismoon/ui/ui/input"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@marismoon/ui/ui/item"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@marismoon/ui/ui/select"
import { Switch } from "@marismoon/ui/ui/switch"
import { useUiText } from "@/lib/i18n/use-ui-text"
import {
  useWorkspaceStore,
  workspaceActions,
} from "@/shared/mocks/workspace-store"
import {
  groupBotSchema,
  type GroupBot,
} from "@/shared/types/workspace-settings"
import { SparklineKpiCard } from "../SettingsSummaryVisuals"

import "../../bills/components/bill-drawer.css"
import "../../bills/components/bills-controls.css"
import "../../bills/components/bills-table.css"
import "../settings-table.css"

const column = createDataTableColumns<GroupBot>()
const columnAlign = {
  enabled: "center",
  eventsCount: "end",
  actions: "end",
} as const

const channelNames: Record<GroupBot["channel"], string> = {
  feishu: "飞书",
  wecom: "企业微信",
  dingtalk: "钉钉",
  webhook: "自定义 Webhook",
}

const channelSampleUrls: Record<GroupBot["channel"], string> = {
  feishu: "https://hooks.aries.example.test/feishu/ops-alert-01",
  wecom: "https://hooks.aries.example.test/wecom/finops-02",
  dingtalk: "https://hooks.aries.example.test/dingtalk/security-03",
  webhook: "https://hooks.aries.example.test/webhook/custom-01",
}

function maskWebhookUrl(url: string): string {
  const idx = url.lastIndexOf("/")
  if (idx < 0 || url.length - idx <= 6) return url
  return `${url.slice(0, idx + 1)}••••${url.slice(-4)}`
}

export function GroupBotsSummary() {
  const tl = useUiText()
  const { bots } = useWorkspaceStore()

  const total = bots.length
  const enabled = bots.filter((b) => b.enabled).length
  const totalEvents = bots.reduce((sum, b) => sum + b.eventsCount, 0)
  const channelsCovered = new Set(bots.map((b) => b.channel)).size

  const perBotBars = bots.map((b) => ({
    label: tl(b.name),
    value: b.eventsCount,
  }))
  const pushTrend = [
    { label: "11/20", value: 42 },
    { label: "11/21", value: 58 },
    { label: "11/22", value: 36 },
    { label: "11/23", value: 51 },
    { label: "11/24", value: 74 },
    { label: "11/25", value: 68 },
    { label: "11/26", value: 63 },
  ]
  const latencyTrend = [
    { label: "11/20", value: 185 },
    { label: "11/21", value: 172 },
    { label: "11/22", value: 164 },
    { label: "11/23", value: 178 },
    { label: "11/24", value: 156 },
    { label: "11/25", value: 149 },
    { label: "11/26", value: 142 },
  ]

  return (
    <section
      className="settings-summary-grid"
      data-cols="3"
      aria-label={tl("群机器人概况")}
    >
      <SparklineKpiCard
        featured
        label={tl("生效中群机器人")}
        value={`${enabled} / ${total}`}
        formatHoverValue={(v) => `${v} ${tl("次")}`}
        badge={tl("在线通道")}
        badgeTone="success"
        note={tl("悬停柱状对比各群机器人累计推送频次")}
        data={perBotBars.length > 0 ? perBotBars : [{ label: "-", value: 0 }]}
        variant="bar"
        color="var(--chart-1)"
      />

      <SparklineKpiCard
        label={tl("近 7 日消息推送量")}
        value={`${totalEvents} ${tl("次")}`}
        formatHoverValue={(v) => `${v} ${tl("条推送")}`}
        badge={tl("实时触达")}
        badgeTone="info"
        note={tl("覆盖账单异常卡片、预算预警与安全通知")}
        data={pushTrend}
        variant="area"
        color="var(--chart-2)"
      />

      <SparklineKpiCard
        label={tl("消息平台覆盖")}
        value={`${channelsCovered} / 4`}
        formatHoverValue={(v) => `${v} ms`}
        badge="142 ms"
        badgeTone="success"
        note={tl("近 7 日各群机器人 Webhook 回调平均耗时")}
        data={latencyTrend}
        variant="line"
        color="var(--chart-positive)"
      />
    </section>
  )
}

export function GroupBotsPage() {
  const tl = useUiText()
  const mobile = useIsMobile()
  const searchId = useId()
  const store = useWorkspaceStore()

  const [query, setQuery] = useState("")
  const [channelFilter, setChannelFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [createOpen, setCreateOpen] = useState(false)
  const [activeBotId, setActiveBotId] = useState<string | null>(null)
  const [deletingBot, setDeletingBot] = useState<GroupBot | null>(null)

  const [name, setName] = useState("")
  const [channel, setChannel] = useState<GroupBot["channel"]>("feishu")
  const [webhookUrl, setWebhookUrl] = useState(channelSampleUrls.feishu)
  const [urlTouched, setUrlTouched] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return store.bots.filter((bot) => {
      if (channelFilter !== "all" && bot.channel !== channelFilter) {
        return false
      }
      if (statusFilter === "enabled" && !bot.enabled) return false
      if (statusFilter === "disabled" && bot.enabled) return false
      if (!q) return true
      return (
        bot.name.toLowerCase().includes(q) ||
        tl(bot.name).toLowerCase().includes(q) ||
        tl(channelNames[bot.channel]).toLowerCase().includes(q) ||
        bot.webhookUrl.toLowerCase().includes(q)
      )
    })
  }, [store.bots, channelFilter, statusFilter, query, tl])

  const hasFilters =
    query.trim() !== "" || channelFilter !== "all" || statusFilter !== "all"

  const activeBot = store.bots.find((b) => b.id === activeBotId) ?? null

  function handleChannelSelect(next: GroupBot["channel"]) {
    setChannel(next)
    if (!urlTouched) {
      setWebhookUrl(channelSampleUrls[next])
    }
  }

  function handleCreate(event: FormEvent) {
    event.preventDefault()
    if (!name.trim() || !webhookUrl.trim()) {
      toast.error(tl("请填写机器人名称与 Webhook 地址"))
      return
    }
    workspaceActions.addBot({
      name: name.trim(),
      channel,
      webhookUrl: webhookUrl.trim(),
    })
    toast.success(tl("已新增群机器人"))
    setName("")
    setUrlTouched(false)
    setWebhookUrl(channelSampleUrls[channel])
    setCreateOpen(false)
  }

  function handleConfirmDelete() {
    if (!deletingBot) return
    workspaceActions.removeBot(deletingBot.id)
    if (activeBotId === deletingBot.id) setActiveBotId(null)
    toast(tl("已删除群机器人"))
    setDeletingBot(null)
  }

  const columns = useMemo(
    () =>
      column.columns([
        column.display({ id: "selection" }),
        column.accessor("name", {
          header: tl("机器人名称 / Webhook"),
          cell: ({ row }) => (
            <>
              <span className="bill-row-id">{tl(row.original.name)}</span>
              <span
                className="bill-row-account financial-number"
                title={row.original.webhookUrl}
              >
                {maskWebhookUrl(row.original.webhookUrl)}
              </span>
            </>
          ),
        }),
        column.accessor("channel", {
          header: tl("消息平台"),
          cell: ({ getValue }) => (
            <span className="bill-row-pill">
              {tl(channelNames[getValue()])}
            </span>
          ),
        }),
        column.accessor("enabled", {
          header: tl("启停"),
          cell: ({ row, getValue }) => (
            <Switch
              checked={getValue()}
              onCheckedChange={(checked) => {
                workspaceActions.toggleBot(row.original.id, checked)
                toast.success(
                  checked ? tl("已启用群机器人") : tl("已停用群机器人")
                )
              }}
              aria-label={tl("启用或停用 {{name}}", {
                name: tl(row.original.name),
              })}
            />
          ),
        }),
        column.accessor("eventsCount", {
          header: tl("累计推送"),
          cell: ({ getValue }) => (
            <span className="financial-number">
              {getValue()} {tl("次")}
            </span>
          ),
        }),
        column.accessor("lastTriggeredAt", {
          header: tl("最近触发"),
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
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="bill-detail-action"
              aria-label={tl("查看与编辑")}
              title={tl("查看与编辑")}
              onClick={() => setActiveBotId(row.original.id)}
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
    setChannelFilter("all")
    setStatusFilter("all")
    table.firstPage()
  }

  return (
    <>
      <FrostCard className="settings-register settings-bots-table">
        <div className="bills-toolbar">
          <div className="bills-toolbar-head">
            <span className="bills-toolbar-title">{tl("群机器人")}</span>
            <Button
              type="button"
              size="dense"
              shape="workspace"
              className="settings-toolbar-action"
              onClick={() => setCreateOpen(true)}
            >
              <AppIcon icon={SolarPlus} data-icon="inline-start" aria-hidden />
              {tl("新增机器人")}
            </Button>
          </div>
          <div className="bills-toolbar-fields" role="search">
            <div
              className="bills-search data-table-search field-surface"
              data-field-focus="quiet"
            >
              <label className="sr-only" htmlFor={searchId}>
                {tl("搜索机器人名称或 Webhook")}
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
                placeholder={tl("搜索机器人名称或 Webhook")}
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
                  aria-label={tl("按平台筛选")}
                  className="data-table-filter"
                  data-active={channelFilter !== "all" || undefined}
                >
                  <span className="bill-filter-label" aria-hidden="true">
                    {tl("消息平台")}：
                  </span>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" align="start">
                  <SelectItem value="all">{tl("全部")}</SelectItem>
                  <SelectItem value="feishu">{tl("飞书")}</SelectItem>
                  <SelectItem value="wecom">{tl("企业微信")}</SelectItem>
                  <SelectItem value="dingtalk">{tl("钉钉")}</SelectItem>
                  <SelectItem value="webhook">
                    {tl("自定义 Webhook")}
                  </SelectItem>
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
                  <SelectItem value="enabled">{tl("已启用")}</SelectItem>
                  <SelectItem value="disabled">{tl("已停用")}</SelectItem>
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
          caption={tl("群机器人")}
          columnAlign={columnAlign}
          rowHeaderColumn="name"
          selectAllLabel={tl("选择本页所有机器人")}
          selectRowLabel={(row) => tl(row.name)}
          paginationLabel={tl("群机器人")}
          scrollHint={tl("横向滚动查看推送次数与触发时间")}
          empty={
            <EmptyState icon={SolarBell} title={tl("没有匹配的群机器人")} />
          }
        />
      </FrostCard>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{tl("新增群机器人")}</DialogTitle>
            <DialogDescription>
              {tl("填写群机器人 Webhook 地址后即可在消息规则中绑定推送。")}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="grid gap-3">
            <Field>
              <FieldLabel htmlFor="bot-name">{tl("机器人名称")}</FieldLabel>
              <Input
                id="bot-name"
                controlSize="dense"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={tl("例如：运维值班告警群")}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="bot-channel">{tl("消息平台")}</FieldLabel>
              <Select
                value={channel}
                onValueChange={(value) => {
                  const result = groupBotSchema.shape.channel.safeParse(value)
                  if (result.success) handleChannelSelect(result.data)
                }}
              >
                <SelectTrigger id="bot-channel" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="feishu">{tl("飞书")}</SelectItem>
                  <SelectItem value="wecom">{tl("企业微信")}</SelectItem>
                  <SelectItem value="dingtalk">{tl("钉钉")}</SelectItem>
                  <SelectItem value="webhook">
                    {tl("自定义 Webhook")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="bot-url">Webhook URL</FieldLabel>
              <Input
                id="bot-url"
                controlSize="dense"
                value={webhookUrl}
                onChange={(e) => {
                  setUrlTouched(true)
                  setWebhookUrl(e.target.value)
                }}
              />
            </Field>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
              >
                {tl("取消")}
              </Button>
              <Button type="submit">{tl("保存机器人")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Drawer
        open={activeBot !== null}
        onOpenChange={(open) => {
          if (!open) setActiveBotId(null)
        }}
        direction={mobile ? "bottom" : "right"}
        noBodyStyles
      >
        <DrawerContent>
          {activeBot && (
            <>
              <DrawerHeader>
                <DrawerTitle>{tl(activeBot.name)}</DrawerTitle>
                <DrawerDescription>
                  {tl(channelNames[activeBot.channel])}
                </DrawerDescription>
              </DrawerHeader>
              <div
                className="bill-drawer-body grid min-h-0 flex-1 content-start gap-4 overflow-y-auto px-4"
                data-vaul-no-drag=""
              >
                <Item variant="muted" size="sm">
                  <ItemContent>
                    <ItemTitle>{tl("启用状态")}</ItemTitle>
                    <ItemDescription>
                      {activeBot.enabled ? tl("已启用") : tl("已停用")}
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <Switch
                      checked={activeBot.enabled}
                      onCheckedChange={(checked) => {
                        workspaceActions.toggleBot(activeBot.id, checked)
                        toast.success(
                          checked ? tl("已启用群机器人") : tl("已停用群机器人")
                        )
                      }}
                      aria-label={tl("启用或停用 {{name}}", {
                        name: tl(activeBot.name),
                      })}
                    />
                  </ItemActions>
                </Item>

                <section className="bill-drawer-section">
                  <h3>{tl("推送概况")}</h3>
                  <dl className="bill-drawer-rows">
                    <div>
                      <dt>{tl("状态")}</dt>
                      <dd>
                        <StatusBadge
                          tone={activeBot.enabled ? "success" : "neutral"}
                        >
                          {activeBot.enabled ? tl("已启用") : tl("已停用")}
                        </StatusBadge>
                      </dd>
                    </div>
                    <div>
                      <dt>{tl("累计推送")}</dt>
                      <dd className="financial-number">
                        {activeBot.eventsCount} {tl("次")}
                      </dd>
                    </div>
                    <div>
                      <dt>{tl("最近触发")}</dt>
                      <dd className="financial-number">
                        {activeBot.lastTriggeredAt}
                      </dd>
                    </div>
                  </dl>
                </section>

                <Field>
                  <FieldLabel>Webhook URL</FieldLabel>
                  <div className="flex items-center gap-2">
                    <Input
                      controlSize="dense"
                      className="flex-1 financial-number"
                      value={activeBot.webhookUrl}
                      readOnly
                    />
                    <CopyButton
                      value={activeBot.webhookUrl}
                      label={tl("复制 Webhook")}
                      size="small"
                    />
                  </div>
                </Field>

                <div>
                  <Button
                    type="button"
                    variant="outline"
                    size="small"
                    disabled={!activeBot.enabled}
                    onClick={() => {
                      workspaceActions.testBot(activeBot.id)
                      toast.success(
                        tl("已模拟向「{{name}}」发送测试卡片", {
                          name: tl(activeBot.name),
                        })
                      )
                    }}
                  >
                    <AppIcon
                      icon={SolarPlain3}
                      data-icon="inline-start"
                      aria-hidden
                    />
                    {tl("模拟发送测试")}
                  </Button>
                </div>
              </div>
              <DrawerFooter>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setDeletingBot(activeBot)}
                >
                  <AppIcon
                    icon={SolarTrashBinTrash}
                    data-icon="inline-start"
                    aria-hidden
                  />
                  {tl("删除")}
                </Button>
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

      <AlertDialog
        open={deletingBot !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingBot(null)
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deletingBot
                ? tl("删除「{{name}}」？", { name: tl(deletingBot.name) })
                : ""}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {tl("删除后无法恢复。")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tl("取消")}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              {tl("删除")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
