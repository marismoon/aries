import {
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react"
import {
  AppIcon,
  SolarPanelLeftClose,
  SolarPanelLeftOpen,
  SolarSparkles,
} from "@marismoon/ui/icons"
import { Link } from "react-router"
import { Avatar, AvatarBadge, AvatarFallback } from "@marismoon/ui/ui/avatar"
import { Button } from "@marismoon/ui/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@marismoon/ui/ui/tooltip"
import {
  workspaceModuleIds,
  workspaceModules,
  type WorkspaceModuleId,
} from "./workspace-modules"
import { useUiText } from "@/lib/i18n/use-ui-text"

const mainModules = workspaceModuleIds.filter((id) => id !== "settings")

function RailTooltip({
  label,
  children,
}: {
  label: string
  children: ReactElement
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={9}>
        {label}
      </TooltipContent>
    </Tooltip>
  )
}

function RailModule({
  id,
  active,
  onSelect,
}: {
  id: WorkspaceModuleId
  active: boolean
  onSelect: (id: WorkspaceModuleId) => void
}) {
  const tl = useUiText()
  const { icon: Icon, label: source } = workspaceModules[id]
  const label = tl(source)

  return (
    <RailTooltip label={label}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={
          id === "overview"
            ? "rail-control"
            : "rail-control rail-desktop-module"
        }
        aria-label={label}
        aria-current={active ? "true" : undefined}
        data-no-dock={id === "settings" || undefined}
        onClick={() => onSelect(id)}
      >
        <AppIcon icon={Icon} size={22} stateful aria-hidden="true" />
      </Button>
    </RailTooltip>
  )
}

export function IconRail({
  activeModule,
  navExpanded,
  copilotOpen,
  copilotPanelId,
  onToggleNav,
  onSelectModule,
  onOpenCopilot,
  mobileDirectory,
}: {
  activeModule: WorkspaceModuleId
  navExpanded: boolean
  copilotOpen: boolean
  copilotPanelId: string
  onToggleNav: () => void
  onSelectModule: (id: WorkspaceModuleId) => void
  onOpenCopilot: (element: HTMLElement | null) => void
  mobileDirectory: ReactNode
}) {
  const tl = useUiText()
  const [flip, setFlip] = useState(false)
  const rail = useRef<HTMLElement>(null)

  // Floating dock, as in the motion examples: the pointer's y drives a target
  // scale per control (distance mapped linearly), and every control follows its
  // target on a spring (stiffness 260, damping 20), so growth and release are
  // smooth rather than stepped. Written as --dock per control, which keeps the
  // buttons' own hover and press styles untouched.
  useEffect(() => {
    const nav = rail.current
    if (!nav) return
    const desktop = window.matchMedia("(min-width: 701px)")
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
    const state = new Map<
      HTMLElement,
      {
        value: number
        velocity: number
        target: number
        // Vertical drift toward the pointer (the AI control only).
        dy: number
        dyVelocity: number
        dyTarget: number
      }
    >()
    let frame = 0
    let last = 0

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.032)
      last = now
      let moving = false
      for (const [control, item] of state) {
        // The AI control is a little springier than the rest.
        const [stiffness, damping] = control.classList.contains("rail-ai")
          ? [240, 13]
          : [260, 20]
        item.velocity +=
          (-stiffness * (item.value - item.target) - damping * item.velocity) *
          dt
        item.value += item.velocity * dt
        item.dyVelocity +=
          (-stiffness * (item.dy - item.dyTarget) - damping * item.dyVelocity) *
          dt
        item.dy += item.dyVelocity * dt
        const settled =
          Math.abs(item.value - item.target) < 0.0005 &&
          Math.abs(item.velocity) < 0.002 &&
          Math.abs(item.dy - item.dyTarget) < 0.01 &&
          Math.abs(item.dyVelocity) < 0.05
        if (settled) {
          item.value = item.target
          item.velocity = 0
          item.dy = item.dyTarget
          item.dyVelocity = 0
        } else moving = true
        control.style.setProperty("--dock-dy", `${item.dy.toFixed(2)}px`)
        control.style.setProperty("--dock", item.value.toFixed(4))
        control.style.setProperty(
          "--dock-t",
          Math.min(1, Math.max(0, (item.value - 1) / 0.22)).toFixed(4)
        )
        if (settled && item.target === 1) {
          control.style.removeProperty("--dock")
          control.style.removeProperty("--dock-t")
          control.style.removeProperty("--dock-dy")
          state.delete(control)
        }
      }
      frame = moving ? requestAnimationFrame(tick) : 0
    }
    const kick = () => {
      if (frame) return
      last = performance.now()
      frame = requestAnimationFrame(tick)
    }
    const setTarget = (control: HTMLElement, target: number, dyTarget = 0) => {
      const item = state.get(control) ?? {
        value: 1,
        velocity: 0,
        target,
        dy: 0,
        dyVelocity: 0,
        dyTarget,
      }
      item.target = target
      item.dyTarget = dyTarget
      state.set(control, item)
    }
    const controls = () =>
      Array.from(
        nav.querySelectorAll<HTMLElement>(".rail-control:not([data-no-dock])")
      )

    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || !desktop.matches || reduced.matches)
        return
      for (const control of controls()) {
        const box = control.getBoundingClientRect()
        const offset = event.clientY - (box.top + box.height / 2)
        const near = Math.max(0, 1 - Math.abs(offset) / 96)
        // Only the AI control also leans a few pixels toward the pointer.
        const lean = control.classList.contains("rail-ai")
          ? Math.max(-3, Math.min(3, offset * 0.12)) * near
          : 0
        setTarget(control, 1 + 0.22 * near, lean)
      }
      kick()
    }
    const leave = () => {
      for (const control of state.keys()) setTarget(control, 1)
      kick()
    }
    nav.addEventListener("pointermove", move)
    nav.addEventListener("pointerleave", leave)
    return () => {
      cancelAnimationFrame(frame)
      nav.removeEventListener("pointermove", move)
      nav.removeEventListener("pointerleave", leave)
    }
  }, [])
  const navLabel = tl(navExpanded ? "收起工作区导航" : "展开工作区导航")
  const PanelToggleIcon = navExpanded ? SolarPanelLeftClose : SolarPanelLeftOpen

  return (
    <div className="icon-rail-column" data-layout-column="rail">
      <nav className="icon-rail" aria-label={tl("主模块")} ref={rail}>
        <RailTooltip label={tl("Marismoon 工作台")}>
          <Link
            to="/overview"
            className="rail-brand"
            aria-label={tl("Marismoon 工作台")}
          >
            <span translate="no">fH</span>
          </Link>
        </RailTooltip>
        <div className="rail-modules">
          {mainModules.map((id) => (
            <RailModule
              key={id}
              id={id}
              active={activeModule === id}
              onSelect={onSelectModule}
            />
          ))}
        </div>
        <div className="rail-footer">
          <RailTooltip label={tl("AI 助手")}>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rail-control rail-ai"
              data-copilot-trigger="rail"
              aria-label={tl("Marismoon 智算助手")}
              aria-expanded={copilotOpen}
              aria-controls={copilotOpen ? copilotPanelId : undefined}
              aria-keyshortcuts="Meta+Shift+K Control+Shift+K"
              onClick={(event) => onOpenCopilot(event.currentTarget)}
            >
              <AppIcon icon={SolarSparkles} size={22} aria-hidden="true" />
            </Button>
          </RailTooltip>
          <RailModule
            id="settings"
            active={activeModule === "settings"}
            onSelect={onSelectModule}
          />
          <span className="grid size-(--rail-control-size) shrink-0 place-items-center">
            <Avatar
              role="img"
              aria-label={tl("演示用户 · 管理员")}
              title={tl("演示用户 · 管理员")}
              className="size-7"
            >
              <AvatarFallback className="bg-[linear-gradient(145deg,color-mix(in_srgb,var(--success)_80%,white),color-mix(in_srgb,var(--success)_70%,black))] text-xs font-semibold text-white dark:text-background">
                M
              </AvatarFallback>
              <AvatarBadge
                aria-hidden="true"
                className="-right-px -bottom-px size-2 bg-(--success) ring-[1.5px] group-data-[size=default]/avatar:size-2"
              />
            </Avatar>
          </span>
          <RailTooltip label={navLabel}>
            <Button
              variant="ghost"
              size="icon"
              className="rail-control rail-desktop-toggle"
              data-hint={!navExpanded || undefined}
              aria-label={navLabel}
              aria-controls="workspace-desktop-navigation"
              aria-expanded={navExpanded}
              onClick={() => {
                setFlip(true)
                onToggleNav()
              }}
            >
              <span
                key={String(navExpanded)}
                className="rail-toggle-icon"
                data-flip={flip || undefined}
              >
                <AppIcon icon={PanelToggleIcon} size={22} aria-hidden="true" />
              </span>
            </Button>
          </RailTooltip>
          {mobileDirectory}
        </div>
      </nav>
    </div>
  )
}
