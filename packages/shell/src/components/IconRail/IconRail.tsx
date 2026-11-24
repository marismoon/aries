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
} from "@aries/ui/icons"
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from "@aries/ui/ui/avatar"
import { IconPlaceholder } from "@aries/ui/icons/icon-placeholder"
import { Button } from "@aries/ui/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@aries/ui/ui/tooltip"
import { ShellLink } from "../ShellLink"
import type { NavModule, WorkspaceNavigation } from "../../types/nav"
import { useShellLabels } from "../../types/labels"

export function RailTooltip({
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
  module,
  active,
  onSelect,
}: {
  module: NavModule
  active: boolean
  onSelect: (id: string) => void
}) {
  const { id, icon, label } = module

  return (
    <RailTooltip label={label}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={
          module.visibleOnMobile
            ? "rail-control"
            : "rail-control rail-desktop-module"
        }
        aria-label={label}
        aria-current={active ? "true" : undefined}
        data-no-dock={module.railPosition === "footer" || undefined}
        onClick={() => onSelect(id)}
      >
        {icon}
      </Button>
    </RailTooltip>
  )
}

export function IconRail({
  activeModule,
  navigation,
  navExpanded,
  rightPanelTrigger,
  onToggleNav,
  onSelectModule,
  mobileDirectory,
}: {
  activeModule: NavModule
  navigation: WorkspaceNavigation
  navExpanded: boolean
  rightPanelTrigger: ReactNode
  onToggleNav: () => void
  onSelectModule: (id: string) => void
  mobileDirectory: ReactNode
}) {
  const labels = useShellLabels()
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
  const navLabel = navExpanded
    ? labels.collapseNavigation
    : labels.expandNavigation
  const PanelToggleIcon = navExpanded ? SolarPanelLeftClose : SolarPanelLeftOpen

  const renderModule = (module: NavModule) => (
    <RailModule
      key={module.id}
      module={module}
      active={activeModule.id === module.id}
      onSelect={onSelectModule}
    />
  )

  return (
    <div className="icon-rail-column" data-layout-column="rail">
      <nav className="icon-rail" aria-label={labels.mainModules} ref={rail}>
        <RailTooltip label={navigation.brandLabel}>
          <ShellLink
            to={navigation.brandPath}
            className="rail-brand"
            aria-label={navigation.brandLabel}
          >
            <span translate="no">{navigation.brandMark}</span>
          </ShellLink>
        </RailTooltip>
        <div className="rail-modules">
          {navigation.modules
            .filter((module) => module.railPosition === "main")
            .map(renderModule)}
        </div>
        <div className="rail-footer">
          {rightPanelTrigger}
          {navigation.modules
            .filter((module) => module.railPosition === "footer")
            .map(renderModule)}
          <span className="grid size-(--rail-control-size) shrink-0 place-items-center">
            <Avatar
              role="img"
              aria-label={navigation.userLabel}
              title={navigation.userLabel}
            >
              <AvatarImage src={navigation.avatarSrc} alt="" />
              <AvatarFallback>{navigation.avatarFallback}</AvatarFallback>
              <AvatarBadge aria-hidden="true">
                <IconPlaceholder
                  lucide="PlusIcon"
                  tabler="IconPlus"
                  hugeicons="PlusSignIcon"
                  phosphor="PlusIcon"
                  remixicon="RiAddLine"
                />
              </AvatarBadge>
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
