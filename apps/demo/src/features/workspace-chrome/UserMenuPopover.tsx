import { useEffect, useRef, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { useNavigate } from "react-router"
import { AnimatePresence } from "motion/react"
import { div as MotionDiv } from "motion/react-m"
import { toast } from "sonner"

import { useIsMobile } from "@marismoon/ui/hooks/use-mobile"
import { AppIcon, SolarCog, SolarLogout2, SolarUser } from "@marismoon/ui/icons"
import { Avatar, AvatarFallback, AvatarImage } from "@marismoon/ui/ui/avatar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@marismoon/ui/ui/popover"
import { useUiText } from "@/lib/i18n/use-ui-text"
import {
  getCurrentMember,
  useWorkspaceStore,
  workspaceActions,
} from "@/shared/mocks/workspace-store"

import "./user-menu.css"

const easeOutSmooth = [0.22, 1, 0.36, 1] as const
const easeInQuick = [0.4, 0, 1, 1] as const

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
        <Avatar className="size-8 shrink-0">
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

      <div className="user-menu-divider" role="separator" />

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

      <div className="user-menu-divider" role="separator" />

      <button
        type="button"
        className="user-menu-signout"
        onClick={() => {
          onClose()
          workspaceActions.signOut()
          toast(tl("已退出登录"))
          void navigate("/login", { replace: true })
        }}
      >
        <AppIcon icon={SolarLogout2} size={15} aria-hidden />
        <span>{tl("退出登录")}</span>
      </button>
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
      </>
    )
  }

  return (
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
  )
}
