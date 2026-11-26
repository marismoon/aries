import { useMemo, useState, type FormEvent } from "react"
import { toast } from "sonner"

import { useIsMobile } from "@marismoon/ui/hooks/use-mobile"
import { AppIcon, SolarCog } from "@marismoon/ui/icons"
import { DataTable } from "@marismoon/ui/shared/DataTable"
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
import { Switch } from "@marismoon/ui/ui/switch"
import { useUiText } from "@/lib/i18n/use-ui-text"
import {
  SummaryMiniBars,
  SummaryRingGauge,
  SummarySegmentedBar,
} from "../SettingsSummaryVisuals"
import {
  useWorkspaceStore,
  workspaceActions,
} from "@/shared/mocks/workspace-store"
import type { MessageRule } from "@/shared/types/workspace-settings"

import "../../bills/components/bill-drawer.css"
import "../../bills/components/bills-controls.css"
import "../../bills/components/bills-table.css"
import "../settings-table.css"

const column = createDataTableColumns<MessageRule>()
const columnAlign = {
  inApp: "center",
  email: "center",
  bot: "center",
  actions: "end",
} as const

const severityMeta = {
  high: { label: "高优先级", tone: "danger" as const },
  medium: { label: "中优先级", tone: "warning" as const },
  low: { label: "常规通知", tone: "info" as const },
}

export function MessageRulesSummary() {
  const tl = useUiText()
  const { messageRules } = useWorkspaceStore()

  const total = messageRules.length
  const highCount = messageRules.filter((r) => r.severity === "high").length
  const mediumCount = messageRules.filter((r) => r.severity === "medium").length
  const lowCount = messageRules.filter((r) => r.severity === "low").length

  const inAppCount = messageRules.filter((r) => r.inApp).length
  const emailCount = messageRules.filter((r) => r.email).length
  const botCount = messageRules.filter((r) => r.bot).length

  const alwaysOnCount = messageRules.filter(
    (r) => r.quietHours === "不静默"
  ).length
  const alwaysOnRate = total > 0 ? Math.round((alwaysOnCount / total) * 100) : 0

  return (
    <section className="settings-summary-grid" aria-label={tl("通知规则概况")}>
      <FrostCard className="settings-summary-card hero-surface">
        <div className="settings-summary-meta">
          <div className="settings-summary-label">{tl("已配置规则")}</div>
          <div className="settings-summary-value financial-number">
            {total} {tl("条")}
          </div>
        </div>
        <SummarySegmentedBar
          total={total}
          items={[
            { label: tl("高优先级"), count: highCount, tone: "danger" },
            { label: tl("中优先级"), count: mediumCount, tone: "warning" },
            { label: tl("常规通知"), count: lowCount, tone: "info" },
          ]}
        />
      </FrostCard>

      <FrostCard className="settings-summary-card">
        <div className="settings-summary-label">{tl("通道启用分布")}</div>
        <SummaryMiniBars
          items={[
            { label: tl("站内信"), value: inAppCount, max: Math.max(total, 1) },
            { label: tl("邮件"), value: emailCount, max: Math.max(total, 1) },
            { label: tl("群机器人"), value: botCount, max: Math.max(total, 1) },
          ]}
        />
      </FrostCard>

      <FrostCard className="settings-summary-card">
        <div className="settings-summary-top">
          <div className="settings-summary-meta">
            <div className="settings-summary-label">{tl("全天候实时推送")}</div>
            <div className="settings-summary-value financial-number">
              {alwaysOnCount} / {total}
            </div>
            <p className="settings-summary-note">
              {tl("高优先级告警默认不静默，24 小时实时触达")}
            </p>
          </div>
          <SummaryRingGauge
            percent={alwaysOnRate}
            tone="info"
            label={tl("全天候实时推送")}
          />
        </div>
      </FrostCard>
    </section>
  )
}

export function MessageRulesPage() {
  const tl = useUiText()
  const mobile = useIsMobile()
  const store = useWorkspaceStore()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [quietHours, setQuietHours] = useState("")
  const [recipients, setRecipients] = useState("")

  const editingRule = store.messageRules.find((r) => r.id === editingId) ?? null

  function openRule(rule: MessageRule) {
    setEditingId(rule.id)
    setQuietHours(rule.quietHours)
    setRecipients(rule.recipients)
  }

  function handleSave(event: FormEvent) {
    event.preventDefault()
    if (!editingRule) return
    workspaceActions.updateMessageRule(editingRule.id, {
      quietHours: quietHours.trim() || editingRule.quietHours,
      recipients: recipients.trim() || editingRule.recipients,
    })
    toast.success(tl("已更新消息通知规则"))
    setEditingId(null)
  }

  const columns = useMemo(
    () =>
      column.columns([
        column.accessor("name", {
          header: tl("规则名称 / 触发事件"),
          cell: ({ row }) => (
            <>
              <span className="bill-row-id">{tl(row.original.name)}</span>
              <span className="bill-row-account">
                {tl(row.original.event)} · {tl(row.original.recipients)}
              </span>
            </>
          ),
        }),
        column.accessor("severity", {
          header: tl("级别"),
          cell: ({ getValue }) => {
            const sev = severityMeta[getValue()]
            return <StatusBadge tone={sev.tone}>{tl(sev.label)}</StatusBadge>
          },
        }),
        column.accessor("inApp", {
          header: tl("站内信"),
          cell: ({ row, getValue }) => (
            <Switch
              checked={getValue()}
              onCheckedChange={(checked) => {
                workspaceActions.updateMessageRule(row.original.id, {
                  inApp: checked,
                })
                toast.success(tl("已更新站内信开关"))
              }}
              aria-label={tl("{{name}} 站内信", {
                name: tl(row.original.name),
              })}
            />
          ),
        }),
        column.accessor("email", {
          header: tl("邮件"),
          cell: ({ row, getValue }) => (
            <Switch
              checked={getValue()}
              onCheckedChange={(checked) => {
                workspaceActions.updateMessageRule(row.original.id, {
                  email: checked,
                })
                toast.success(tl("已更新邮件通知开关"))
              }}
              aria-label={tl("{{name}} 邮件", {
                name: tl(row.original.name),
              })}
            />
          ),
        }),
        column.accessor("bot", {
          header: tl("群机器人"),
          cell: ({ row, getValue }) => (
            <Switch
              checked={getValue()}
              onCheckedChange={(checked) => {
                workspaceActions.updateMessageRule(row.original.id, {
                  bot: checked,
                })
                toast.success(tl("已更新群机器人推送开关"))
              }}
              aria-label={tl("{{name}} 群机器人", {
                name: tl(row.original.name),
              })}
            />
          ),
        }),
        column.accessor("quietHours", {
          header: tl("静默时段"),
          cell: ({ getValue }) => (
            <span className="text-muted-foreground financial-number">
              {tl(getValue())}
            </span>
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
              aria-label={tl("编辑")}
              title={tl("编辑")}
              onClick={() => openRule(row.original)}
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
    data: store.messageRules,
    getRowId: (row) => row.id,
    initialState: { pagination: { pageIndex: 0, pageSize: 10 } },
  })

  return (
    <>
      <FrostCard className="settings-register settings-rules-table">
        <div className="bills-toolbar">
          <div className="bills-toolbar-head">
            <span className="bills-toolbar-title">{tl("消息规则")}</span>
          </div>
        </div>
        <DataTable
          table={table}
          caption={tl("消息规则")}
          columnAlign={columnAlign}
          rowHeaderColumn="name"
          selectAllLabel={tl("消息规则")}
          selectRowLabel={(row) => tl(row.name)}
          paginationLabel={tl("消息规则")}
          scrollHint={tl("横向滚动查看渠道和静默时段")}
          empty={null}
        />
      </FrostCard>

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
                <DrawerDescription>{tl(editingRule.event)}</DrawerDescription>
              </DrawerHeader>
              <form
                id="message-rule-form"
                onSubmit={handleSave}
                className="bill-drawer-body grid min-h-0 flex-1 gap-4 overflow-y-auto px-4"
                data-vaul-no-drag=""
              >
                <Field>
                  <FieldLabel htmlFor="rule-recipients">
                    {tl("接收对象")}
                  </FieldLabel>
                  <Input
                    id="rule-recipients"
                    controlSize="dense"
                    value={recipients}
                    onChange={(e) => setRecipients(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="rule-quiet">{tl("静默时段")}</FieldLabel>
                  <Input
                    id="rule-quiet"
                    controlSize="dense"
                    value={quietHours}
                    onChange={(e) => setQuietHours(e.target.value)}
                    placeholder="22:00–08:00"
                  />
                </Field>
              </form>
              <DrawerFooter>
                <Button type="submit" form="message-rule-form">
                  {tl("保存规则")}
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
