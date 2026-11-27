import { useId, useMemo, useState, type FormEvent } from "react"
import { toast } from "sonner"

import { useIsMobile } from "@marismoon/ui/hooks/use-mobile"
import {
  AppIcon,
  SolarCog,
  SolarPlus,
  SolarSearch,
  SolarShieldAlert,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@marismoon/ui/ui/select"
import { Switch } from "@marismoon/ui/ui/switch"
import { SparklineKpiCard } from "@/features/settings/SettingsSummaryVisuals"
import { useUiText } from "@/lib/i18n/use-ui-text"
import {
  notificationsActions,
  useNotificationsStore,
  type AlertCategory,
  type AlertRuleItem,
  type AlertSeverity,
  type DeliveryChannel,
} from "@/shared/mocks/notifications-store"

import "../bills/components/bill-drawer.css"
import "../bills/components/bills-controls.css"
import "../bills/components/bills-table.css"
import "../settings/settings-table.css"
import "./notifications.css"

const column = createDataTableColumns<AlertRuleItem>()
const columnAlign = {
  triggeredCount30d: "end",
  enabled: "center",
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

const channelLabels: Record<DeliveryChannel, string> = {
  inApp: "站内信",
  email: "邮件",
  feishu: "飞书",
  wecom: "企微",
  webhook: "Webhook",
}

export function AlertRulesSummary() {
  const tl = useUiText()
  const { rules } = useNotificationsStore()

  const total = rules.length
  const enabledCount = rules.filter((r) => r.enabled).length
  const criticalCount = rules.filter((r) => r.severity === "critical").length
  const enabledRate = total > 0 ? Math.round((enabledCount / total) * 100) : 0
  const totalTriggers30d = rules.reduce(
    (sum, r) => sum + r.triggeredCount30d,
    0
  )

  const activeRulesTrend = [
    { label: "W1", value: Math.max(enabledCount - 2, 1) },
    { label: "W2", value: Math.max(enabledCount - 1, 1) },
    { label: "W3", value: Math.max(enabledCount - 1, 1) },
    { label: "W4", value: enabledCount },
    { label: "W5", value: enabledCount },
    { label: "W6", value: enabledCount },
  ]
  const topRuleBars = [...rules]
    .sort((a, b) => b.triggeredCount30d - a.triggeredCount30d)
    .slice(0, 6)
    .map((rule) => ({
      label: tl(rule.name),
      value: rule.triggeredCount30d,
    }))
  const dedupeTrend = [
    { label: "11/20", value: 61 },
    { label: "11/21", value: 63 },
    { label: "11/22", value: 65 },
    { label: "11/23", value: 64 },
    { label: "11/24", value: 67 },
    { label: "11/25", value: 68 },
    { label: "11/26", value: 68.4 },
  ]

  return (
    <section
      className="settings-summary-grid"
      data-cols="3"
      aria-label={tl("告警规则概况")}
    >
      <SparklineKpiCard
        featured
        label={tl("生效中监控规则")}
        value={`${enabledCount} / ${total}`}
        formatHoverValue={(v) => `${v} ${tl("条")}`}
        badge={`${enabledRate}%`}
        badgeTone="success"
        note={tl("含 {{critical}} 条严重级别实时策略", {
          critical: criticalCount,
        })}
        data={activeRulesTrend}
        variant="area"
        color="var(--chart-1)"
      />

      <SparklineKpiCard
        label={tl("近 30 天累计触发")}
        value={`${totalTriggers30d} ${tl("次")}`}
        formatHoverValue={(v) => `${v} ${tl("次")}`}
        badge={tl("高频分布")}
        badgeTone="warning"
        note={tl("悬停柱状查看各规则 30 天命中次数")}
        data={topRuleBars}
        variant="bar"
        color="var(--chart-3)"
      />

      <SparklineKpiCard
        label={tl("冷却去重降噪率")}
        value="68.4%"
        formatHoverValue={(v) => `${v}%`}
        badge="+5.2%"
        badgeTone="info"
        note={tl("启用中的规则按冷却周期自动去重推送")}
        data={dedupeTrend}
        variant="line"
        color="var(--chart-2)"
      />
    </section>
  )
}

export function AlertRulesPage() {
  const tl = useUiText()
  const mobile = useIsMobile()
  const searchId = useId()
  const { rules } = useNotificationsStore()

  const [query, setQuery] = useState("")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [createOpen, setCreateOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [newMetric, setNewMetric] = useState("budget.utilization_ratio")
  const [newCondition, setNewCondition] = useState("")
  const [newSeverity, setNewSeverity] = useState<AlertSeverity>("warning")
  const [newCategory, setNewCategory] = useState<AlertCategory>("cost")

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editCondition, setEditCondition] = useState("")
  const [editCooldown, setEditCooldown] = useState("60")
  const [editOwner, setEditOwner] = useState("")

  const editingRule = rules.find((r) => r.id === editingId) ?? null

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rules.filter((r) => {
      if (severityFilter !== "all" && r.severity !== severityFilter)
        return false
      if (!q) return true
      return (
        r.name.toLowerCase().includes(q) ||
        tl(r.name).toLowerCase().includes(q) ||
        r.metric.toLowerCase().includes(q) ||
        r.condition.toLowerCase().includes(q)
      )
    })
  }, [query, rules, severityFilter, tl])

  function openEdit(rule: AlertRuleItem) {
    setEditingId(rule.id)
    setEditCondition(rule.condition)
    setEditCooldown(String(rule.cooldownMin))
    setEditOwner(rule.owner)
  }

  function handleCreate(event: FormEvent) {
    event.preventDefault()
    if (!newName.trim() || !newCondition.trim()) {
      toast.error(tl("请填写规则名称与触发条件"))
      return
    }
    notificationsActions.addAlertRule({
      name: newName.trim(),
      metric: newMetric.trim() || "custom.metric",
      condition: newCondition.trim(),
      severity: newSeverity,
      category: newCategory,
      owner: "张敏",
    })
    toast.success(tl("已创建告警规则"))
    setNewName("")
    setNewCondition("")
    setCreateOpen(false)
  }

  function handleSaveEdit(event: FormEvent) {
    event.preventDefault()
    if (!editingRule) return
    notificationsActions.updateAlertRule(editingRule.id, {
      condition: editCondition.trim() || editingRule.condition,
      cooldownMin: Number(editCooldown) || editingRule.cooldownMin,
      owner: editOwner.trim() || editingRule.owner,
    })
    toast.success(tl("已保存规则变更"))
    setEditingId(null)
  }

  const columns = useMemo(
    () =>
      column.columns([
        column.accessor("name", {
          header: tl("规则名称 / 触发条件"),
          cell: ({ row }) => (
            <>
              <span className="bill-row-id">{tl(row.original.name)}</span>
              <span className="bill-row-account">
                {row.original.metric} · {tl(row.original.condition)}
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
        column.accessor("channels", {
          header: tl("通知渠道"),
          cell: ({ getValue }) => (
            <div className="alert-channel-pills">
              {getValue().map((ch) => (
                <span key={ch} className="bill-row-pill">
                  {tl(channelLabels[ch])}
                </span>
              ))}
            </div>
          ),
        }),
        column.accessor("triggeredCount30d", {
          header: tl("近 30 天触发"),
          cell: ({ row }) => (
            <>
              <span className="font-semibold financial-number">
                {row.original.triggeredCount30d} {tl("次")}
              </span>
              <span className="bill-row-account financial-number">
                {tl("冷却")} {row.original.cooldownMin}m
              </span>
            </>
          ),
        }),
        column.accessor("enabled", {
          header: tl("启停"),
          cell: ({ row, getValue }) => (
            <Switch
              checked={getValue()}
              onCheckedChange={(checked) => {
                notificationsActions.toggleAlertRule(row.original.id, checked)
                toast.success(
                  checked ? tl("已启用告警规则") : tl("已停用告警规则")
                )
              }}
              aria-label={tl("切换 {{name}}", { name: tl(row.original.name) })}
            />
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
              aria-label={tl("编辑规则")}
              title={tl("编辑规则")}
              onClick={() => openEdit(row.original)}
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

  return (
    <>
      <FrostCard className="settings-register notifications-rules-table">
        <div className="bills-toolbar">
          <div className="bills-toolbar-head">
            <span className="bills-toolbar-title">{tl("告警规则列表")}</span>
            <Button
              type="button"
              size="small"
              onClick={() => setCreateOpen(true)}
            >
              <AppIcon icon={SolarPlus} data-icon="inline-start" aria-hidden />
              {tl("新建规则")}
            </Button>
          </div>
          <div className="bills-toolbar-fields" role="search">
            <div
              className="bills-search data-table-search field-surface"
              data-field-focus="quiet"
            >
              <label className="sr-only" htmlFor={searchId}>
                {tl("搜索规则名称、指标或条件")}
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
                placeholder={tl("搜索规则名称、指标或条件")}
              />
            </div>

            <div className="bills-selects">
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
            </div>
          </div>
        </div>

        <DataTable
          table={table}
          caption={tl("告警规则列表")}
          columnAlign={columnAlign}
          rowHeaderColumn="name"
          selectAllLabel={tl("选择所有规则")}
          selectRowLabel={(row) => tl(row.name)}
          paginationLabel={tl("规则分页")}
          empty={
            <EmptyState
              icon={SolarShieldAlert}
              title={tl("没有匹配的告警规则")}
            />
          }
        />
      </FrostCard>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{tl("新建告警规则")}</DialogTitle>
            <DialogDescription>
              {tl("定义监控指标与阈值条件，命中后将自动推送至已配置渠道。")}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="grid gap-3">
            <Field>
              <FieldLabel htmlFor="rule-new-name">{tl("规则名称")}</FieldLabel>
              <Input
                id="rule-new-name"
                controlSize="dense"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={tl("例如：单日按量实例费用突增")}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="rule-new-metric">
                {tl("监控指标")}
              </FieldLabel>
              <Input
                id="rule-new-metric"
                controlSize="dense"
                className="financial-number"
                value={newMetric}
                onChange={(e) => setNewMetric(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="rule-new-cond">{tl("触发条件")}</FieldLabel>
              <Input
                id="rule-new-cond"
                controlSize="dense"
                value={newCondition}
                onChange={(e) => setNewCondition(e.target.value)}
                placeholder={tl("例如：24 小时费用环比上升 > 25%")}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="rule-new-sev">{tl("告警级别")}</FieldLabel>
                <Select
                  value={newSeverity}
                  onValueChange={(v) => setNewSeverity(v as AlertSeverity)}
                >
                  <SelectTrigger id="rule-new-sev" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="critical">{tl("严重")}</SelectItem>
                    <SelectItem value="warning">{tl("重要")}</SelectItem>
                    <SelectItem value="info">{tl("一般")}</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="rule-new-cat">{tl("归属分类")}</FieldLabel>
                <Select
                  value={newCategory}
                  onValueChange={(v) => setNewCategory(v as AlertCategory)}
                >
                  <SelectTrigger id="rule-new-cat" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="cost">{tl("成本与预算")}</SelectItem>
                    <SelectItem value="cloud">{tl("云账号与采集")}</SelectItem>
                    <SelectItem value="security">{tl("安全与权限")}</SelectItem>
                    <SelectItem value="system">{tl("系统任务")}</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
              >
                {tl("取消")}
              </Button>
              <Button type="submit">{tl("创建规则")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Drawer
        open={editingRule !== null}
        onOpenChange={(open) => {
          if (!open) setEditingId(null)
        }}
        direction={mobile ? "bottom" : "right"}
        noBodyStyles
      >
        <DrawerContent>
          {editingRule && (
            <>
              <DrawerHeader>
                <DrawerTitle>{tl(editingRule.name)}</DrawerTitle>
                <DrawerDescription>{editingRule.metric}</DrawerDescription>
              </DrawerHeader>
              <form
                id="alert-rule-edit-form"
                onSubmit={handleSaveEdit}
                className="bill-drawer-body grid min-h-0 flex-1 content-start gap-4 overflow-y-auto px-4"
                data-vaul-no-drag=""
              >
                <Field>
                  <FieldLabel htmlFor="edit-rule-cond">
                    {tl("触发条件")}
                  </FieldLabel>
                  <Input
                    id="edit-rule-cond"
                    controlSize="dense"
                    value={editCondition}
                    onChange={(e) => setEditCondition(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="edit-rule-cooldown">
                    {tl("冷却周期（分钟）")}
                  </FieldLabel>
                  <Input
                    id="edit-rule-cooldown"
                    type="number"
                    min={5}
                    controlSize="dense"
                    className="financial-number"
                    value={editCooldown}
                    onChange={(e) => setEditCooldown(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="edit-rule-owner">
                    {tl("规则负责人")}
                  </FieldLabel>
                  <Input
                    id="edit-rule-owner"
                    controlSize="dense"
                    value={editOwner}
                    onChange={(e) => setEditOwner(e.target.value)}
                  />
                </Field>
              </form>
              <DrawerFooter>
                <Button type="submit" form="alert-rule-edit-form">
                  {tl("保存变更")}
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
