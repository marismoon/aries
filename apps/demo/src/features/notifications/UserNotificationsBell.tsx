import { useMemo, useState } from "react"
import { useReducedMotion } from "motion/react"
import { span as MotionSpan } from "motion/react-m"
import { useNavigate } from "react-router"
import { toast } from "sonner"

import {
  AppIcon,
  SolarBell,
  SolarCheck,
  SolarCloud,
  SolarCog,
  SolarReceiptText,
  SolarShieldAlert,
} from "@marismoon/ui/icons"
import { EmptyState } from "@marismoon/ui/shared/EmptyState"
import { Button } from "@marismoon/ui/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@marismoon/ui/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@marismoon/ui/ui/tooltip"
import { useUiText } from "@/lib/i18n/use-ui-text"
import {
  notificationsActions,
  useNotificationsStore,
  type AlertCategory,
} from "@/shared/mocks/notifications-store"
import {
  getCurrentMember,
  useWorkspaceStore,
} from "@/shared/mocks/workspace-store"

import "./notifications.css"

type InboxFilter = "all" | "unread" | "alert" | "system"

const categoryIcons: Record<AlertCategory, typeof SolarBell> = {
  cost: SolarReceiptText,
  cloud: SolarCloud,
  security: SolarShieldAlert,
  system: SolarBell,
}

export function UserNotificationsBell() {
  const tl = useUiText()
  const navigate = useNavigate()
  const reducedMotion = Boolean(useReducedMotion())
  const { inbox } = useNotificationsStore()
  const workspace = useWorkspaceStore()
  const currentMember = getCurrentMember(workspace)

  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<InboxFilter>("all")

  const unreadCount = useMemo(
    () => inbox.filter((item) => !item.read).length,
    [inbox]
  )

  const filtered = useMemo(() => {
    return inbox.filter((item) => {
      if (filter === "unread") return !item.read
      if (filter === "alert") return item.category !== "system"
      if (filter === "system") return item.category === "system"
      return true
    })
  }, [filter, inbox])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="workspace-mode-control header-bell-wrap"
              aria-label={
                unreadCount > 0
                  ? tl("我的通知（{{count}} 条未读）", { count: unreadCount })
                  : tl("我的通知")
              }
            >
              <MotionSpan
                className="inline-grid place-items-center"
                animate={
                  reducedMotion
                    ? undefined
                    : open
                      ? { rotate: [0, -10, 8, -4, 0] }
                      : { rotate: 0 }
                }
                transition={
                  reducedMotion
                    ? { duration: 0 }
                    : { duration: 0.32, ease: [0.23, 1, 0.32, 1] }
                }
              >
                <AppIcon icon={SolarBell} size={20} aria-hidden="true" />
              </MotionSpan>
              {unreadCount > 0 && (
                <span
                  className="header-bell-dot financial-number"
                  aria-hidden="true"
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={8}>
          {tl("通知中心")} · {tl(currentMember?.name ?? "张敏")}
        </TooltipContent>
      </Tooltip>

      <PopoverContent align="end" sideOffset={8} className="user-inbox-popover">
        <div className="user-inbox-head">
          <div className="user-inbox-title">
            <strong>{tl("我的通知")}</strong>
            {unreadCount > 0 && (
              <span className="bill-row-pill financial-number">
                {tl("{{count}} 条未读", { count: unreadCount })}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="small"
              onClick={() => {
                notificationsActions.markAllInboxRead()
                toast.success(tl("已全部标记为已读"))
              }}
            >
              <AppIcon icon={SolarCheck} data-icon="inline-start" aria-hidden />
              {tl("全部已读")}
            </Button>
          )}
        </div>

        <div
          className="user-inbox-tabs"
          role="tablist"
          aria-label={tl("筛选通知")}
        >
          {(
            [
              ["all", "全部"],
              ["unread", "未读"],
              ["alert", "告警"],
              ["system", "系统"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className="user-inbox-tab"
              aria-pressed={filter === key}
              onClick={() => setFilter(key)}
            >
              {tl(label)}
            </button>
          ))}
        </div>

        <div className="user-inbox-list">
          {filtered.length === 0 ? (
            <EmptyState icon={SolarBell} title={tl("暂无相关通知")} />
          ) : (
            filtered.map((item) => {
              const Icon = categoryIcons[item.category]
              return (
                <button
                  key={item.id}
                  type="button"
                  className="user-inbox-item"
                  data-unread={!item.read || undefined}
                  data-severity={item.severity}
                  onClick={() => {
                    notificationsActions.markInboxRead(item.id)
                    setOpen(false)
                    void navigate(item.targetPath)
                  }}
                >
                  <span className="user-inbox-item-icon">
                    <AppIcon icon={Icon} size={16} aria-hidden="true" />
                  </span>
                  <span className="user-inbox-item-body">
                    <span className="user-inbox-item-top">
                      <strong>{tl(item.title)}</strong>
                      <span className="user-inbox-item-time financial-number">
                        {tl(item.createdAt)}
                      </span>
                    </span>
                    <p className="user-inbox-item-desc">{tl(item.body)}</p>
                  </span>
                </button>
              )
            })
          )}
        </div>

        <div className="user-inbox-foot">
          <Button
            type="button"
            variant="ghost"
            size="small"
            onClick={() => {
              setOpen(false)
              void navigate("/notifications/center")
            }}
          >
            {tl("进入告警中心")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="small"
            onClick={() => {
              setOpen(false)
              void navigate("/notifications/preferences")
            }}
          >
            <AppIcon icon={SolarCog} data-icon="inline-start" aria-hidden />
            {tl("通知偏好")}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
