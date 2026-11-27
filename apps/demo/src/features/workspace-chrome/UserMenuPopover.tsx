import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
  type ReactNode,
} from "react"
import { createPortal } from "react-dom"
import { useNavigate } from "react-router"
import { AnimatePresence } from "motion/react"
import { div as MotionDiv } from "motion/react-m"
import { toast } from "sonner"

import { useIsMobile } from "@marismoon/ui/hooks/use-mobile"
import {
  AppIcon,
  SolarCog,
  SolarLock,
  SolarLogout,
  SolarUser,
} from "@marismoon/ui/icons"
import { Avatar, AvatarFallback, AvatarImage } from "@marismoon/ui/ui/avatar"
import { Button } from "@marismoon/ui/ui/button"
import { Input } from "@marismoon/ui/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@marismoon/ui/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@marismoon/ui/ui/tooltip"
import { useUiText } from "@/lib/i18n/use-ui-text"
import {
  getCurrentMember,
  useWorkspaceStore,
  workspaceActions,
} from "@/shared/mocks/workspace-store"

import "./user-menu.css"

const easeOutSmooth = [0.22, 1, 0.36, 1] as const
const easeInQuick = [0.4, 0, 1, 1] as const

/* Shared lock-screen state between UserMenuDockedSheet and UserMenuTrigger. */
let screenLocked = false
const lockListeners = new Set<() => void>()

function setScreenLocked(next: boolean) {
  if (screenLocked === next) return
  screenLocked = next
  for (const listener of lockListeners) listener()
}

function subscribeScreenLock(listener: () => void) {
  lockListeners.add(listener)
  return () => {
    lockListeners.delete(listener)
  }
}

function useScreenLocked() {
  return useSyncExternalStore(
    subscribeScreenLock,
    () => screenLocked,
    () => false
  )
}

function ScreenLockOverlay() {
  const tl = useUiText()
  const navigate = useNavigate()
  const store = useWorkspaceStore()
  const locked = useScreenLocked()
  const unlockInput = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (locked) unlockInput.current?.focus()
  }, [locked])
  const [passcode, setPasscode] = useState("")

  const member = getCurrentMember(store)
  const role = store.roles.find((r) => r.id === member?.roleId)

  function handleUnlock(event: FormEvent) {
    event.preventDefault()
    setPasscode("")
    setScreenLocked(false)
    toast(tl("已解锁工作台"))
  }

  function handleSignOut() {
    setPasscode("")
    setScreenLocked(false)
    workspaceActions.signOut()
    toast(tl("已退出登录"))
    void navigate("/login", { replace: true })
  }

  if (typeof document === "undefined") return null

  return createPortal(
    <AnimatePresence>
      {locked && (
        <MotionDiv
          key="user-screen-lock"
          className="user-lock-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={tl("屏幕已锁定")}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: 0.16, ease: easeInQuick },
          }}
          transition={{ duration: 0.2, ease: easeOutSmooth }}
        >
          <MotionDiv
            className="surface user-lock-card"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{
              opacity: 0,
              scale: 0.96,
              y: 6,
              transition: { duration: 0.14, ease: easeInQuick },
            }}
            transition={{ duration: 0.22, ease: easeOutSmooth }}
          >
            <div className="user-lock-head">
              <Avatar className="size-12 shrink-0">
                <AvatarImage src="https://github.com/pranathip.png" alt="" />
                <AvatarFallback>
                  {member ? tl(member.name).slice(0, 1) : "M"}
                </AvatarFallback>
              </Avatar>
              <div className="user-lock-identity">
                <div className="user-lock-name-row">
                  <strong>{tl(member?.name ?? "演示用户")}</strong>
                  <span className="user-menu-role-pill">
                    {tl(role?.name ?? "超级管理员")}
                  </span>
                </div>
                <p className="user-lock-subtitle">{tl("屏幕已锁定")}</p>
              </div>
            </div>

            <form className="user-lock-form" onSubmit={handleUnlock}>
              <Input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder={tl("输入密码解锁当前工作台")}
                aria-label={tl("输入密码解锁当前工作台")}
                ref={unlockInput}
              />
              <div className="user-lock-actions">
                <Button type="submit" size="default" className="flex-1">
                  {tl("解锁")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="default"
                  onClick={handleSignOut}
                  aria-label={tl("退出登录")}
                >
                  <AppIcon icon={SolarLogout} size={16} aria-hidden />
                </Button>
              </div>
            </form>
          </MotionDiv>
        </MotionDiv>
      )}
    </AnimatePresence>,
    document.body
  )
}

function UserMenuBody({ onClose }: { onClose: () => void }) {
  const tl = useUiText()
  const navigate = useNavigate()
  const store = useWorkspaceStore()

  const member = getCurrentMember(store)
  const role = store.roles.find((r) => r.id === member?.roleId)

  function go(path: string) {
    onClose()
    void navigate(path)
  }

  return (
    <>
      <div className="user-menu-header">
        <Avatar className="size-9 shrink-0">
          <AvatarImage src="https://github.com/pranathip.png" alt="" />
          <AvatarFallback>
            {member ? tl(member.name).slice(0, 1) : "M"}
          </AvatarFallback>
        </Avatar>
        <div className="user-menu-identity">
          <div className="user-menu-name-row">
            <strong>{tl(member?.name ?? "演示用户")}</strong>
            <span className="user-menu-role-pill">
              {tl(role?.name ?? "超级管理员")}
            </span>
          </div>
          <p className="user-menu-email">
            {member?.email ?? "zhangmin@aries.example"}
          </p>
        </div>
      </div>

      <ul
        className="workspace-nav-list user-menu-nav"
        aria-label={tl("当前账号菜单")}
      >
        <li>
          <button
            type="button"
            className="workspace-nav-item"
            onClick={() => go("/settings/base/security")}
          >
            <AppIcon icon={SolarUser} size={16} aria-hidden />
            <span>{tl("个人资料")}</span>
          </button>
        </li>
        <li>
          <button
            type="button"
            className="workspace-nav-item"
            onClick={() => go("/settings/system/basic")}
          >
            <AppIcon icon={SolarCog} size={16} aria-hidden />
            <span>{tl("系统设置")}</span>
          </button>
        </li>
      </ul>

      <TooltipProvider delayDuration={200}>
        <div className="user-menu-footer">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="user-menu-icon-action"
                aria-label={tl("锁屏")}
                onClick={() => {
                  onClose()
                  setScreenLocked(true)
                }}
              >
                <AppIcon icon={SolarLock} size={16} aria-hidden />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={6}>
              {tl("锁屏")}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="user-menu-icon-action user-menu-icon-action--danger"
                aria-label={tl("退出登录")}
                onClick={() => {
                  onClose()
                  workspaceActions.signOut()
                  toast(tl("已退出登录"))
                  void navigate("/login", { replace: true })
                }}
              >
                <AppIcon icon={SolarLogout} size={16} aria-hidden />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={6}>
              {tl("退出登录")}
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </>
  )
}

/** Plan A (Motion A via motion/react): Smooth ease-out height + origin-aware reveal. */
export function UserMenuDockedSheet({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const tl = useUiText()
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null
      if (!target) return
      if (cardRef.current?.contains(target)) return
      if (target.closest("[data-user-menu-trigger]")) return
      onClose()
    }
    window.addEventListener("keydown", onKeyDown)
    document.addEventListener("pointerdown", onPointerDown)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      document.removeEventListener("pointerdown", onPointerDown)
    }
  }, [open, onClose])

  return (
    <AnimatePresence initial={false}>
      {open && (
        <MotionDiv
          key="user-menu-dock"
          className="user-menu-dock-motion"
          initial={{ height: 0 }}
          animate={{ height: "auto" }}
          exit={{
            height: 0,
            transition: { duration: 0.18, ease: easeInQuick },
          }}
          transition={{ duration: 0.24, ease: easeOutSmooth }}
        >
          <div className="user-menu-dock-pad">
            <MotionDiv
              ref={cardRef}
              className="workspace-nav user-menu-dock-card"
              role="region"
              aria-label={tl("当前账号菜单")}
              initial={{ opacity: 0, scale: 0.97, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{
                opacity: 0,
                scale: 0.97,
                y: 4,
                transition: { duration: 0.12, ease: easeInQuick },
              }}
              transition={{ duration: 0.22, ease: easeOutSmooth, delay: 0.02 }}
            >
              <UserMenuBody onClose={onClose} />
            </MotionDiv>
          </div>
        </MotionDiv>
      )}
    </AnimatePresence>
  )
}

/** Avatar trigger: plain button without extra ring/tap animation; docks in second
 *  column when expanded, portals with Motion ease-out when collapsed on desktop. */
export function UserMenuTrigger({
  avatar,
  open,
  onOpenChange,
  navExpanded,
}: {
  avatar: ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
  navExpanded: boolean
}) {
  const tl = useUiText()
  const mobile = useIsMobile()
  const floatingRef = useRef<HTMLDivElement>(null)
  const floatingOpen = !mobile && !navExpanded && open

  useEffect(() => {
    if (!floatingOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false)
    }
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null
      if (!target) return
      if (floatingRef.current?.contains(target)) return
      if (target.closest("[data-user-menu-trigger]")) return
      onOpenChange(false)
    }
    window.addEventListener("keydown", onKeyDown)
    document.addEventListener("pointerdown", onPointerDown)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      document.removeEventListener("pointerdown", onPointerDown)
    }
  }, [floatingOpen, onOpenChange])

  if (!mobile) {
    return (
      <>
        <button
          type="button"
          data-user-menu-trigger=""
          className="grid size-(--rail-control-size) shrink-0 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-(--ring)"
          aria-label={tl("当前账号菜单")}
          aria-expanded={open}
          onClick={() => onOpenChange(!open)}
        >
          {avatar}
        </button>
        {typeof document !== "undefined" &&
          createPortal(
            <AnimatePresence>
              {floatingOpen && (
                <MotionDiv
                  key="user-menu-floating"
                  ref={floatingRef}
                  className="workspace-nav user-menu-dock-card--floating"
                  role="dialog"
                  aria-label={tl("当前账号菜单")}
                  initial={{ opacity: 0, scale: 0.95, x: -6, y: 6 }}
                  animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                  exit={{
                    opacity: 0,
                    scale: 0.96,
                    x: -4,
                    y: 4,
                    transition: { duration: 0.15, ease: easeInQuick },
                  }}
                  transition={{ duration: 0.22, ease: easeOutSmooth }}
                >
                  <UserMenuBody onClose={() => onOpenChange(false)} />
                </MotionDiv>
              )}
            </AnimatePresence>,
            document.body
          )}
        <ScreenLockOverlay />
      </>
    )
  }

  return (
    <>
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <button
            type="button"
            data-user-menu-trigger=""
            className="grid size-(--rail-control-size) shrink-0 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-(--ring)"
            aria-label={tl("当前账号菜单")}
            aria-haspopup="dialog"
            aria-expanded={open}
          >
            {avatar}
          </button>
        </PopoverTrigger>
        <PopoverContent
          side="bottom"
          align="end"
          sideOffset={10}
          collisionPadding={16}
          className="user-menu-popover"
          style={{
            width: "min(var(--workspace-nav-width, 256px), calc(100vw - 24px))",
          }}
        >
          <UserMenuBody onClose={() => onOpenChange(false)} />
        </PopoverContent>
      </Popover>
      <ScreenLockOverlay />
    </>
  )
}
