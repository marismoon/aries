import { useId, useMemo, useState, type FormEvent } from "react"
import { toast } from "sonner"

import { useIsMobile } from "@marismoon/ui/hooks/use-mobile"
import {
  AppIcon,
  SolarCog,
  SolarLink,
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
import { Field, FieldLabel } from "@marismoon/ui/ui/field"
import { Input } from "@marismoon/ui/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@marismoon/ui/ui/select"
import { Switch } from "@marismoon/ui/ui/switch"
import { Tip } from "@/features/settings/base-pages/ui"
import { useUiText } from "@/lib/i18n/use-ui-text"
import {
  useWorkspaceStore,
  workspaceActions,
} from "@/shared/mocks/workspace-store"
import type { IntegrationItem } from "@/shared/types/workspace-settings"
import { RingKpiCard, SparklineKpiCard } from "../SettingsSummaryVisuals"

import "../../bills/components/bill-drawer.css"
import "../../bills/components/bills-controls.css"
import "../../bills/components/bills-table.css"
import "../settings-table.css"

const column = createDataTableColumns<IntegrationItem>()
const columnAlign = {
  enabled: "center",
  actions: "end",
} as const

const statusMeta: Record<
  IntegrationItem["status"],
  { label: string; tone: "success" | "warning" | "neutral" }
> = {
  connected: { label: "已连接", tone: "success" },
  warning: { label: "凭证即将过期", tone: "warning" },
  disconnected: { label: "未启用", tone: "neutral" },
}

const categoryLabels = {
  cloud: "云厂商账单",
  collab: "协同与通知",
  identity: "身份认证",
} as const

export function AppsIntegrationSummary() {
  const tl = useUiText()
  const { integrations } = useWorkspaceStore()

  const total = integrations.length
  const connected = integrations.filter((i) => i.status === "connected").length
  const warning = integrations.filter((i) => i.status === "warning").length
  const enabled = integrations.filter((i) => i.enabled).length
  const healthyRate =
    enabled > 0 ? Math.round((connected / enabled) * 100) : 100
  const credValidRate =
    total > 0 ? Math.round(((total - warning) / total) * 100) : 100

  const apiCallTrend = [
    { label: "11/20", value: 1240 },
    { label: "11/21", value: 1380 },
    { label: "11/22", value: 1190 },
    { label: "11/23", value: 1460 },
    { label: "11/24", value: 1620 },
    { label: "11/25", value: 1540 },
    { label: "11/26", value: 1710 },
  ]
  const syncVolumeTrend = [
    { label: "11/20", value: 42 },
    { label: "11/21", value: 48 },
    { label: "11/22", value: 39 },
    { label: "11/23", value: 54 },
    { label: "11/24", value: 62 },
    { label: "11/25", value: 58 },
    { label: "11/26", value: 66 },
  ]

  return (
    <section
      className="settings-summary-grid"
      data-cols="3"
      aria-label={tl("应用集成概况")}
    >
      <SparklineKpiCard
        featured
        label={tl("已连接应用")}
        value={`${connected} / ${total}`}
        formatHoverValue={(v) => `${v} ${tl("次调用")}`}
        badge={
          warning > 0
            ? tl("{{count}} 项凭证待更新", { count: warning })
            : tl("全部正常")
        }
        badgeTone={warning > 0 ? "warning" : "success"}
        note={tl("覆盖多云账单拉取、协同推送与统一身份认证")}
        data={apiCallTrend}
        variant="area"
        color="var(--chart-1)"
      />

      <RingKpiCard
        label={tl("连接健康与凭证")}
        value={`${healthyRate}%`}
        badge={warning > 0 ? tl("需关注") : tl("状态健康")}
        badgeTone={warning > 0 ? "warning" : "success"}
        note={tl("外环在线连接率 · 内环凭证有效率 {{rate}}%", {
          rate: credValidRate,
        })}
        rings={[
          {
            label: tl("在线连接率"),
            value: healthyRate,
            maxValue: 100,
            color: "var(--chart-positive)",
          },
          {
            label: tl("凭证有效率"),
            value: credValidRate,
            maxValue: 100,
            color: "var(--chart-2)",
          },
        ]}
      />

      <SparklineKpiCard
        label={tl("近 7 日同步吞吐")}
        value={`369 ${tl("次")}`}
        formatHoverValue={(v) => `${v} ${tl("次同步")}`}
        badge={tl("自动调度")}
        badgeTone="info"
        note={tl("悬停柱状查看每日跨云账单与目录同步频次")}
        data={syncVolumeTrend}
        variant="bar"
        color="var(--chart-3)"
      />
    </section>
  )
}

export function AppsIntegrationPage() {
  const tl = useUiText()
  const mobile = useIsMobile()
  const searchId = useId()
  const store = useWorkspaceStore()

  const [query, setQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [activeId, setActiveId] = useState<string | null>(null)
  const [endpointDraft, setEndpointDraft] = useState("")
  const [appIdDraft, setAppIdDraft] = useState("")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return store.integrations.filter((item) => {
      if (categoryFilter !== "all" && item.category !== categoryFilter) {
        return false
      }
      if (statusFilter !== "all" && item.status !== statusFilter) {
        return false
      }
      if (!q) return true
      return (
        item.name.toLowerCase().includes(q) ||
        tl(item.name).toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        tl(item.description).toLowerCase().includes(q) ||
        item.appId.toLowerCase().includes(q)
      )
    })
  }, [store.integrations, categoryFilter, statusFilter, query, tl])

  const hasFilters =
    query.trim() !== "" || categoryFilter !== "all" || statusFilter !== "all"

  const activeItem =
    store.integrations.find((item) => item.id === activeId) ?? null

  function openConfig(item: IntegrationItem) {
    setActiveId(item.id)
    setEndpointDraft(item.endpoint)
    setAppIdDraft(item.appId)
  }

  function handleSaveConfig(event: FormEvent) {
    event.preventDefault()
    if (!activeItem) return
    workspaceActions.updateIntegration(activeItem.id, {
      endpoint: endpointDraft.trim() || activeItem.endpoint,
      appId: appIdDraft.trim() || activeItem.appId,
      enabled: true,
      status: "connected",
    })
    toast.success(
      tl("已保存「{{name}}」集成配置", { name: tl(activeItem.name) })
    )
    setActiveId(null)
  }

  function handleTestConnection() {
    if (!activeItem) return
    const now = new Date()
    const pad = (n: number) => String(n).padStart(2, "0")
    const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
    workspaceActions.updateIntegration(activeItem.id, {
      status: "connected",
      enabled: true,
      lastSyncAt: stamp,
    })
    toast.success(
      tl("{{name}} 模拟连通性测试通过", {
        name: tl(activeItem.name),
      })
    )
  }

  const columns = useMemo(
    () =>
      column.columns([
        column.display({ id: "selection" }),
        column.accessor("name", {
          header: tl("应用名称 / 能力说明"),
          cell: ({ row }) => (
            <>
              <span className="bill-row-id">{tl(row.original.name)}</span>
              <span className="bill-row-account">
                {tl(row.original.description)}
              </span>
            </>
          ),
        }),
        column.accessor("category", {
          header: tl("分类"),
          cell: ({ getValue }) => (
            <span className="bill-row-pill">
              {tl(categoryLabels[getValue()])}
            </span>
          ),
        }),
        column.accessor("status", {
          header: tl("状态"),
          cell: ({ getValue }) => {
            const meta = statusMeta[getValue()]
            return <StatusBadge tone={meta.tone}>{tl(meta.label)}</StatusBadge>
          },
        }),
        column.accessor("enabled", {
          header: tl("启停"),
          cell: ({ row, getValue }) => (
            <Switch
              checked={getValue()}
              onCheckedChange={(checked) => {
                workspaceActions.updateIntegration(row.original.id, {
                  enabled: checked,
                  status: checked ? "connected" : "disconnected",
                })
                toast.success(
                  checked
                    ? tl("已启用「{{name}}」集成", {
                        name: tl(row.original.name),
                      })
                    : tl("已停用「{{name}}」集成", {
                        name: tl(row.original.name),
                      })
                )
              }}
              aria-label={tl("切换 {{name}} 启用状态", {
                name: tl(row.original.name),
              })}
            />
          ),
        }),
        column.accessor("lastSyncAt", {
          header: tl("最近同步"),
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
              aria-label={tl("配置")}
              title={tl("配置")}
              onClick={() => openConfig(row.original)}
            >
              <AppIcon icon={SolarCog} size={18} />
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
    setCategoryFilter("all")
    setStatusFilter("all")
    table.firstPage()
  }

  return (
    <>
      <FrostCard className="settings-register settings-apps-table">
        <div className="bills-toolbar">
          <div className="bills-toolbar-head">
            <span className="bills-toolbar-title">{tl("应用集成")}</span>
          </div>
          <div className="bills-toolbar-fields" role="search">
            <div
              className="bills-search data-table-search field-surface"
              data-field-focus="quiet"
            >
              <label className="sr-only" htmlFor={searchId}>
                {tl("搜索应用名称或能力")}
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
                placeholder={tl("搜索应用名称或能力")}
              />
            </div>

            <div className="bills-selects">
              <Select
                value={categoryFilter}
                onValueChange={(value) => {
                  table.firstPage()
                  setCategoryFilter(value)
                }}
              >
                <SelectTrigger
                  size="dense"
                  aria-label={tl("按分类筛选")}
                  className="data-table-filter"
                  data-active={categoryFilter !== "all" || undefined}
                >
                  <span className="bill-filter-label" aria-hidden="true">
                    {tl("分类")}：
                  </span>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" align="start">
                  <SelectItem value="all">{tl("全部")}</SelectItem>
                  <SelectItem value="cloud">{tl("云厂商账单")}</SelectItem>
                  <SelectItem value="collab">{tl("协同与通知")}</SelectItem>
                  <SelectItem value="identity">{tl("身份认证")}</SelectItem>
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
                  <SelectItem value="connected">{tl("已连接")}</SelectItem>
                  <SelectItem value="warning">{tl("凭证即将过期")}</SelectItem>
                  <SelectItem value="disconnected">{tl("未启用")}</SelectItem>
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
          caption={tl("应用集成")}
          columnAlign={columnAlign}
          rowHeaderColumn="name"
          selectAllLabel={tl("选择本页所有应用")}
          selectRowLabel={(row) => tl(row.name)}
          paginationLabel={tl("应用集成")}
          scrollHint={tl("横向滚动查看连接状态与同步时间")}
          empty={
            <EmptyState icon={SolarLink} title={tl("没有匹配的应用集成")} />
          }
        />
      </FrostCard>

      <Drawer
        open={activeItem !== null}
        onOpenChange={(open) => {
          if (!open) setActiveId(null)
        }}
        direction={mobile ? "bottom" : "right"}
        noBodyStyles
      >
        <DrawerContent>
          {activeItem && (
            <>
              <DrawerHeader>
                <DrawerTitle>{tl(activeItem.name)}</DrawerTitle>
                <DrawerDescription>
                  {tl(activeItem.description)}
                </DrawerDescription>
              </DrawerHeader>
              <form
                id="integration-config-form"
                onSubmit={handleSaveConfig}
                className="bill-drawer-body grid min-h-0 flex-1 content-start gap-4 overflow-y-auto px-4"
                data-vaul-no-drag=""
              >
                <section className="bill-drawer-section">
                  <h3>{tl("连接信息")}</h3>
                  <dl className="bill-drawer-rows">
                    <div>
                      <dt>{tl("状态")}</dt>
                      <dd>
                        <StatusBadge tone={statusMeta[activeItem.status].tone}>
                          {tl(statusMeta[activeItem.status].label)}
                        </StatusBadge>
                      </dd>
                    </div>
                    <div>
                      <dt>{tl("最近同步")}</dt>
                      <dd className="financial-number">
                        {activeItem.lastSyncAt}
                      </dd>
                    </div>
                  </dl>
                </section>

                <Field>
                  <FieldLabel htmlFor="int-endpoint">
                    {tl("服务接口地址")}
                  </FieldLabel>
                  <Input
                    id="int-endpoint"
                    controlSize="dense"
                    value={endpointDraft}
                    onChange={(e) => setEndpointDraft(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="int-app-id">
                    {tl("应用标识 / App ID")}
                  </FieldLabel>
                  <Input
                    id="int-app-id"
                    controlSize="dense"
                    className="financial-number"
                    value={appIdDraft}
                    onChange={(e) => setAppIdDraft(e.target.value)}
                  />
                </Field>
                <Tip>{tl("集成配置仅保存在本地。")}</Tip>
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    size="small"
                    onClick={handleTestConnection}
                  >
                    <AppIcon
                      icon={SolarRefreshCcw}
                      data-icon="inline-start"
                      aria-hidden
                    />
                    {tl("模拟测试连通性")}
                  </Button>
                </div>
              </form>
              <DrawerFooter>
                <Button type="submit" form="integration-config-form">
                  {tl("保存配置")}
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
    </>
  )
}
