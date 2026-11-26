import { useState, type FormEvent } from "react"
import { toast } from "sonner"

import {
  AppIcon,
  SolarClock3,
  SolarPlus,
  SolarUsersGroupRounded,
} from "@marismoon/ui/icons"
import { FrostCard } from "@marismoon/ui/shared/FrostCard"
import { StatusBadge } from "@marismoon/ui/shared/StatusBadge"
import { Button } from "@marismoon/ui/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@marismoon/ui/ui/dialog"
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
import {
  SummaryRingGauge,
  SummarySegmentedBar,
} from "@/features/settings/SettingsSummaryVisuals"
import { useUiText } from "@/lib/i18n/use-ui-text"
import {
  notificationsActions,
  useNotificationsStore,
} from "@/shared/mocks/notifications-store"
import {
  getCurrentMember,
  useWorkspaceStore,
} from "@/shared/mocks/workspace-store"

import "../settings/basic-info/basic-info.css"
import "../settings/settings-table.css"
import "./notifications.css"

export function SilencesSummary() {
  const tl = useUiText()
  const { silences, onCallShifts } = useNotificationsStore()
  const activeCount = silences.filter((s) => s.active).length
  const inactiveCount = silences.length - activeCount

  return (
    <section
      className="settings-summary-grid"
      aria-label={tl("静默与值守概况")}
    >
      <FrostCard className="settings-summary-card hero-surface">
        <div className="settings-summary-meta">
          <div className="settings-summary-label">{tl("生效中静默窗口")}</div>
          <div className="settings-summary-value financial-number">
            {activeCount} / {silences.length}
          </div>
        </div>
        <SummarySegmentedBar
          total={Math.max(silences.length, 1)}
          items={[
            { label: tl("生效中"), count: activeCount, tone: "info" },
            { label: tl("已结束"), count: inactiveCount, tone: "neutral" },
          ]}
        />
      </FrostCard>

      <FrostCard className="settings-summary-card">
        <div className="settings-summary-meta">
          <div className="settings-summary-label">{tl("值守升级梯队")}</div>
          <div className="settings-summary-value financial-number">
            {onCallShifts.length} {tl("级")}
          </div>
          <p className="settings-summary-note">
            {tl("L1 一线 15 分钟未响应自动升级至 L2 / L3 负责人")}
          </p>
        </div>
      </FrostCard>

      <FrostCard className="settings-summary-card">
        <div className="settings-summary-top">
          <div className="settings-summary-meta">
            <div className="settings-summary-label">{tl("7×24 值守覆盖")}</div>
            <div className="settings-summary-value financial-number">100%</div>
            <p className="settings-summary-note">
              {tl("主备双人排班均已绑定即时通讯通道")}
            </p>
          </div>
          <SummaryRingGauge
            percent={100}
            tone="success"
            label={tl("7×24 值守覆盖")}
          />
        </div>
      </FrostCard>
    </section>
  )
}

export function SilencesOnCallPage() {
  const tl = useUiText()
  const { silences, onCallShifts } = useNotificationsStore()
  const workspace = useWorkspaceStore()
  const currentMember = getCurrentMember(workspace)

  const [createOpen, setCreateOpen] = useState(false)
  const [name, setName] = useState("")
  const [matcher, setMatcher] = useState("category=cloud, severity=warning")
  const [reason, setReason] = useState("")
  const [endsAt, setEndsAt] = useState("2026-11-27 18:00")

  function handleCreate(event: FormEvent) {
    event.preventDefault()
    if (!name.trim()) {
      toast.error(tl("请填写静默窗口名称"))
      return
    }
    notificationsActions.addSilenceWindow({
      name: name.trim(),
      matcher: matcher.trim() || "severity=info",
      reason: reason.trim() || tl("维护窗口临时屏蔽非关键告警"),
      endsAt: endsAt.trim() || "2026-11-27 18:00",
      creator: currentMember?.name ?? "张敏",
    })
    toast.success(tl("已新增静默窗口"))
    setName("")
    setReason("")
    setCreateOpen(false)
  }

  return (
    <>
      <div className="notifications-split-grid">
        <FrostCard className="basic-card">
          <header className="basic-card-header">
            <span className="basic-card-icon">
              <AppIcon icon={SolarClock3} size={16} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <h2>{tl("静默窗口")}</h2>
              <p>
                {tl("在版本发布或账单采集高峰期按标签匹配临时抑制非关键告警。")}
              </p>
            </div>
            <div className="basic-card-actions">
              <Button
                type="button"
                size="small"
                onClick={() => setCreateOpen(true)}
              >
                <AppIcon
                  icon={SolarPlus}
                  data-icon="inline-start"
                  aria-hidden
                />
                {tl("新建静默")}
              </Button>
            </div>
          </header>

          <div className="basic-rows">
            {silences.map((item) => (
              <div key={item.id} className="basic-row">
                <div className="basic-row-text">
                  <div className="flex flex-wrap items-center gap-2">
                    <b>{tl(item.name)}</b>
                    <StatusBadge tone={item.active ? "info" : "neutral"}>
                      {item.active ? tl("生效中") : tl("已结束")}
                    </StatusBadge>
                  </div>
                  <small>
                    {item.matcher} · {tl(item.reason)}
                  </small>
                  <small className="financial-number">
                    {item.startsAt} → {item.endsAt} · {tl(item.creator)}
                  </small>
                </div>
                <div className="basic-row-control">
                  <Switch
                    checked={item.active}
                    onCheckedChange={(checked) => {
                      notificationsActions.toggleSilenceWindow(item.id, checked)
                      toast.success(
                        checked ? tl("已恢复静默窗口") : tl("已解除静默窗口")
                      )
                    }}
                    aria-label={tl("切换静默窗口 {{name}}", {
                      name: tl(item.name),
                    })}
                  />
                </div>
              </div>
            ))}
          </div>
        </FrostCard>

        <FrostCard className="basic-card">
          <header className="basic-card-header">
            <span className="basic-card-icon">
              <AppIcon
                icon={SolarUsersGroupRounded}
                size={16}
                aria-hidden="true"
              />
            </span>
            <div className="min-w-0 flex-1">
              <h2>{tl("值守排班与升级策略")}</h2>
              <p>
                {tl("配置各梯队主值守人与超时自动升级链路，确保严重告警闭环。")}
              </p>
            </div>
          </header>

          <div className="oncall-card-list">
            {onCallShifts.map((shift) => (
              <div key={shift.id} className="oncall-shift-item">
                <div className="oncall-shift-meta">
                  <div className="flex items-center gap-2">
                    <strong>{tl(shift.tier)}</strong>
                    <StatusBadge tone="neutral">
                      {tl("超时 {{min}} 分钟升级", {
                        min: shift.escalationDelayMin,
                      })}
                    </StatusBadge>
                  </div>
                  <small>
                    {tl(shift.roleLabel)} · {tl("备班")}：{tl(shift.backup)} ·{" "}
                    {tl(shift.channel)}
                  </small>
                </div>

                <Select
                  value={shift.primary}
                  onValueChange={(value) => {
                    notificationsActions.updateOnCallPrimary(shift.id, value)
                    toast.success(
                      tl("已将 {{tier}} 主值守切换为 {{name}}", {
                        tier: tl(shift.tier),
                        name: tl(value),
                      })
                    )
                  }}
                >
                  <SelectTrigger
                    aria-label={tl("切换 {{tier}} 主值守人", {
                      tier: tl(shift.tier),
                    })}
                    className="w-36"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper" align="end">
                    {workspace.members.slice(0, 6).map((m) => (
                      <SelectItem key={m.id} value={m.name}>
                        {tl(m.name)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </FrostCard>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{tl("新建静默窗口")}</DialogTitle>
            <DialogDescription>
              {tl(
                "命中的告警仍会记录在告警中心，但不会触发外部群机器人与邮件提醒。"
              )}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="grid gap-3">
            <Field>
              <FieldLabel htmlFor="sil-name">{tl("窗口名称")}</FieldLabel>
              <Input
                id="sil-name"
                controlSize="dense"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={tl("例如：周末数据库升级维护")}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="sil-matcher">
                {tl("标签匹配规则")}
              </FieldLabel>
              <Input
                id="sil-matcher"
                controlSize="dense"
                className="financial-number"
                value={matcher}
                onChange={(e) => setMatcher(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="sil-ends">{tl("结束时间")}</FieldLabel>
              <Input
                id="sil-ends"
                controlSize="dense"
                className="financial-number"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="sil-reason">{tl("静默原因")}</FieldLabel>
              <Input
                id="sil-reason"
                controlSize="dense"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={tl("简述维护内容与预期恢复时间")}
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
              <Button type="submit">{tl("创建静默")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
