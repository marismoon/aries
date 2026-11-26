import { useState, type FormEvent } from "react"
import { useLocation, useNavigate } from "react-router"
import { toast } from "sonner"

import { useIsMobile } from "@marismoon/ui/hooks/use-mobile"
import {
  AppIcon,
  SolarArrowUpRight,
  SolarCheck,
  SolarChevronDown,
} from "@marismoon/ui/icons"
import { CopyButton } from "@marismoon/ui/shared/CopyButton"
import { StatusBadge } from "@marismoon/ui/shared/StatusBadge"
import { Button } from "@marismoon/ui/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@marismoon/ui/ui/collapsible"
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
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@marismoon/ui/ui/item"
import { Progress } from "@marismoon/ui/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@marismoon/ui/ui/select"
import { Textarea } from "@marismoon/ui/ui/textarea"
import { useUiText } from "@/lib/i18n/use-ui-text"
import {
  useWorkspaceStore,
  workspaceActions,
} from "@/shared/mocks/workspace-store"

export function SetupGuideDrawer({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const tl = useUiText()
  const navigate = useNavigate()
  const mobile = useIsMobile()
  const { setupChecklist } = useWorkspaceStore()

  const steps = [
    {
      id: "basic",
      done: setupChecklist.basicInfoReviewed,
      title: tl("完善组织基础信息"),
      description: tl("确认默认币种、对账截止日与联系邮箱"),
      path: "/settings/system/basic",
    },
    {
      id: "members",
      done: setupChecklist.membersConfigured,
      title: tl("邀请团队成员并分配角色"),
      path: "/settings/org/members",
    },
    {
      id: "bot",
      done: setupChecklist.botTested,
      title: tl("模拟告警机器人测试"),
      path: "/settings/integrations/bots",
    },
    {
      id: "security",
      done: setupChecklist.securityReviewed,
      title: tl("核对安全与 2FA 策略"),
      description: tl("配置管理员强制二次验证与办公网 IP 白名单"),
      path: "/settings/security/policy",
    },
  ]

  const completed = steps.filter((s) => s.done).length
  const percent = Math.round((completed / steps.length) * 100)

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      direction={mobile ? "bottom" : "right"}
      noBodyStyles
    >
      <DrawerContent aria-describedby={undefined}>
        <DrawerHeader>
          <DrawerTitle>{tl("配置手册")}</DrawerTitle>
        </DrawerHeader>

        <div
          className="min-h-0 flex-1 overflow-y-auto px-4 pb-2"
          data-vaul-no-drag=""
        >
          <Item variant="muted" size="sm" className="mb-3">
            <ItemContent className="gap-2">
              <div className="flex items-center justify-between text-xs">
                <ItemTitle>{tl("初始化进度")}</ItemTitle>
                <span className="text-muted-foreground financial-number">
                  {completed} / {steps.length}（{percent}%）
                </span>
              </div>
              <Progress value={percent} aria-label={tl("初始化进度")} />
            </ItemContent>
          </Item>

          <ItemGroup className="gap-2">
            {steps.map((step, index) => (
              <Item key={step.id} variant="outline" size="sm">
                <ItemMedia variant="icon">
                  {step.done ? (
                    <AppIcon icon={SolarCheck} size={15} aria-hidden />
                  ) : (
                    <span className="text-xs font-semibold financial-number">
                      {index + 1}
                    </span>
                  )}
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>
                    <span>{step.title}</span>
                    {step.done && (
                      <StatusBadge tone="success">{tl("已完成")}</StatusBadge>
                    )}
                  </ItemTitle>
                  {step.description && (
                    <ItemDescription>{step.description}</ItemDescription>
                  )}
                </ItemContent>
                <ItemActions>
                  <Button
                    type="button"
                    size="small"
                    variant="outline"
                    onClick={() => {
                      onOpenChange(false)
                      void navigate(step.path)
                    }}
                  >
                    {tl("前往")}
                    <AppIcon
                      icon={SolarArrowUpRight}
                      data-icon="inline-end"
                      aria-hidden
                    />
                  </Button>
                </ItemActions>
              </Item>
            ))}
          </ItemGroup>
        </div>

        <DrawerFooter>
          <DrawerClose asChild>
            <Button type="button" variant="outline">
              {tl("关闭")}
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export function SupportDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const tl = useUiText()
  const { pathname } = useLocation()
  const store = useWorkspaceStore()
  const [category, setCategory] = useState("账单异常")
  const [subject, setSubject] = useState("")
  const [details, setDetails] = useState("")

  const diagnostics = [
    "Product: Aries Workspace v1.8.2",
    "Instance: ORG-2026-0042",
    `Route: ${pathname}`,
    `Palette: ${document.documentElement.dataset.palette ?? "ariesanalytics"}`,
    `Mode: ${document.documentElement.classList.contains("dark") ? "dark" : "light"}`,
  ].join("\n")

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!subject.trim()) {
      toast.error(tl("请填写问题摘要"))
      return
    }
    const ticket = workspaceActions.submitSupportTicket({
      category,
      subject: subject.trim(),
      details,
    })
    toast.success(tl("已保存演示工单 {{id}}", { id: ticket.id }))
    setSubject("")
    setDetails("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{tl("技术支持")}</DialogTitle>
          <DialogDescription>{tl("演示工单仅保存在本地。")}</DialogDescription>
        </DialogHeader>

        <Collapsible className="grid gap-2">
          <CollapsibleTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="small"
              className="group w-fit"
            >
              {tl("环境诊断信息")}
              <AppIcon
                icon={SolarChevronDown}
                data-icon="inline-end"
                className="group-aria-expanded:rotate-180"
                aria-hidden
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Item variant="muted" size="sm">
              <ItemContent className="gap-1.5">
                <CopyButton
                  value={diagnostics}
                  label={tl("复制诊断信息")}
                  size="small"
                  className="self-end"
                />
                <pre className="overflow-x-auto text-[11px] leading-relaxed text-muted-foreground financial-number">
                  {diagnostics}
                </pre>
              </ItemContent>
            </Item>
          </CollapsibleContent>
        </Collapsible>

        <form onSubmit={handleSubmit} className="grid gap-3">
          <Field>
            <FieldLabel htmlFor="support-category">{tl("问题分类")}</FieldLabel>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="support-category" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="账单异常">{tl("账单异常")}</SelectItem>
                <SelectItem value="权限问题">{tl("权限问题")}</SelectItem>
                <SelectItem value="集成通知">{tl("集成通知")}</SelectItem>
                <SelectItem value="功能建议">{tl("功能建议")}</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel htmlFor="support-subject">{tl("问题摘要")}</FieldLabel>
            <Input
              id="support-subject"
              controlSize="dense"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={tl("简要描述遇到的问题或需求")}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="support-details">
              {tl("补充说明（可选）")}
            </FieldLabel>
            <Textarea
              id="support-details"
              rows={2}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={tl("可填写复现步骤或期望结果")}
            />
          </Field>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {tl("关闭")}
            </Button>
            <Button type="submit">{tl("保存工单")}</Button>
          </DialogFooter>
        </form>

        {store.supportTickets.length > 0 && (
          <div className="grid gap-2 border-t border-(--border-subtle) pt-3">
            <span className="text-xs font-medium text-muted-foreground">
              {tl("最近工单")}
            </span>
            <ItemGroup className="gap-1.5">
              {store.supportTickets.slice(0, 3).map((ticket) => (
                <Item key={ticket.id} variant="muted" size="sm">
                  <ItemContent>
                    <ItemTitle>{tl(ticket.subject)}</ItemTitle>
                    <ItemDescription className="financial-number">
                      {ticket.id} · {ticket.createdAt}
                    </ItemDescription>
                    {ticket.details && (
                      <Collapsible>
                        <CollapsibleTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="small"
                            className="group px-0"
                            aria-label={tl("工单 {{id}} 的补充说明", {
                              id: ticket.id,
                            })}
                          >
                            {tl("补充说明")}
                            <AppIcon
                              icon={SolarChevronDown}
                              data-icon="inline-end"
                              className="group-aria-expanded:rotate-180"
                              aria-hidden
                            />
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <ItemDescription className="line-clamp-none wrap-anywhere whitespace-pre-wrap">
                            {ticket.details}
                          </ItemDescription>
                        </CollapsibleContent>
                      </Collapsible>
                    )}
                  </ItemContent>
                  <ItemActions>
                    <StatusBadge
                      tone={ticket.status === "resolved" ? "success" : "info"}
                    >
                      {ticket.status === "resolved"
                        ? tl("已解决")
                        : tl("待处理")}
                    </StatusBadge>
                  </ItemActions>
                </Item>
              ))}
            </ItemGroup>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
