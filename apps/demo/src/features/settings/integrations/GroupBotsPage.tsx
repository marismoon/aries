import { useState, type FormEvent } from "react"
import { toast } from "sonner"

import {
  AppIcon,
  SolarBell,
  SolarPlain3,
  SolarPlus,
  SolarTrashBinTrash,
} from "@marismoon/ui/icons"
import { CopyButton } from "@marismoon/ui/shared/CopyButton"
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
import { useUiText } from "@/lib/i18n/use-ui-text"
import {
  useWorkspaceStore,
  workspaceActions,
} from "@/shared/mocks/workspace-store"
import {
  groupBotSchema,
  type GroupBot,
} from "@/shared/types/workspace-settings"

import "../basic-info/basic-info.css"

const channelNames: Record<GroupBot["channel"], string> = {
  feishu: "飞书",
  wecom: "企业微信",
  dingtalk: "钉钉",
  webhook: "自定义 Webhook",
}

export function GroupBotsPage() {
  const tl = useUiText()
  const store = useWorkspaceStore()

  const [createOpen, setCreateOpen] = useState(false)
  const [name, setName] = useState("")
  const [channel, setChannel] = useState<GroupBot["channel"]>("feishu")
  const [webhookUrl, setWebhookUrl] = useState(
    "https://hooks.aries.example.test/feishu/custom-01"
  )

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
    setCreateOpen(false)
  }

  return (
    <div className="settings-basic-page">
      <div className="basic-flow">
        <div className="basic-toolbar">
          <Button
            type="button"
            size="dense"
            shape="workspace"
            className="ms-auto"
            onClick={() => setCreateOpen(true)}
          >
            <AppIcon icon={SolarPlus} data-icon="inline-start" aria-hidden />
            {tl("新增机器人")}
          </Button>
        </div>

        {store.bots.map((bot) => (
          <FrostCard key={bot.id} className="basic-card">
            <header className="basic-card-header">
              <span className="basic-card-icon">
                <AppIcon icon={SolarBell} size={16} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2>{tl(bot.name)}</h2>
                  <StatusBadge tone="info">
                    {tl(channelNames[bot.channel])}
                  </StatusBadge>
                  <StatusBadge tone={bot.enabled ? "success" : "neutral"}>
                    {bot.enabled ? tl("已启用") : tl("已停用")}
                  </StatusBadge>
                </div>
                <p>
                  {tl("最近触发")}{" "}
                  <span className="financial-number">
                    {bot.lastTriggeredAt}
                  </span>
                  {" · "}
                  {tl("累计推送")}{" "}
                  <span className="financial-number">{bot.eventsCount}</span>{" "}
                  {tl("次")}
                </p>
              </div>
              <div className="basic-card-actions">
                <Button
                  type="button"
                  size="small"
                  variant="outline"
                  disabled={!bot.enabled}
                  onClick={() => {
                    workspaceActions.testBot(bot.id)
                    toast.success(
                      tl("已模拟向「{{name}}」发送测试卡片", {
                        name: tl(bot.name),
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
                <Switch
                  checked={bot.enabled}
                  onCheckedChange={(checked) => {
                    workspaceActions.toggleBot(bot.id, checked)
                    toast.success(
                      checked ? tl("已启用群机器人") : tl("已停用群机器人")
                    )
                  }}
                  aria-label={tl("启用或停用 {{name}}", {
                    name: tl(bot.name),
                  })}
                />
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  aria-label={tl("删除 {{name}}", { name: tl(bot.name) })}
                  onClick={() => {
                    workspaceActions.removeBot(bot.id)
                    toast(tl("已删除群机器人"))
                  }}
                >
                  <AppIcon icon={SolarTrashBinTrash} size={16} aria-hidden />
                </Button>
              </div>
            </header>
            <div className="basic-rows">
              <div className="basic-row">
                <div className="basic-row-text">
                  <b>Webhook URL</b>
                  <small className="financial-number">{bot.webhookUrl}</small>
                </div>
                <div className="basic-row-control">
                  <CopyButton
                    value={bot.webhookUrl}
                    label={tl("复制 Webhook")}
                    size="small"
                  />
                </div>
              </div>
            </div>
          </FrostCard>
        ))}

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
                    if (result.success) setChannel(result.data)
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
                  onChange={(e) => setWebhookUrl(e.target.value)}
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
      </div>
    </div>
  )
}
