import { useEffect, useEffectEvent, useState, type ReactNode } from "react"
import { AppIcon, SolarPanelLeftOpen } from "@marismoon/ui/icons"
import { AriesMagicRings } from "@marismoon/ui/shared/AriesMagicRings"
import { Button } from "@marismoon/ui/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@marismoon/ui/ui/dialog"
import { CommandPaletteProvider } from "../CommandPalette"
import { IconRail } from "../IconRail"
import { MainWorkspace } from "../MainWorkspace"
import { WorkspaceNav } from "../WorkspaceNav"
import type { NavModule, WorkspaceNavigation } from "../../types/nav"
import { HeaderExtraContext } from "../../context/header-extra"
import { useShellRouter } from "../../types/adapter"
import { useShellLabels } from "../../types/labels"

function MobileDirectory({
  navigation,
  activeModule,
  onSelectModule,
}: {
  navigation: WorkspaceNavigation
  activeModule: NavModule
  onSelectModule: (id: string) => void
}) {
  const labels = useShellLabels()
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rail-control mobile-directory-trigger"
          aria-label={labels.openNavigation}
        >
          <AppIcon icon={SolarPanelLeftOpen} size={22} aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <DialogContent className="mobile-directory-panel">
        <DialogTitle className="sr-only">{labels.navigationTitle}</DialogTitle>
        <DialogDescription className="sr-only">
          {navigation.directoryDescription}
        </DialogDescription>
        <WorkspaceNav
          navigation={navigation}
          mobile
          activeModule={activeModule}
          onSelectModule={onSelectModule}
          onNavigate={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

/** Toggles the right panel, mirroring the command palette's ⌘K / Ctrl+K. */
export const rightPanelKeyShortcuts = "Meta+Shift+K Control+Shift+K"

function isRightPanelShortcut(event: KeyboardEvent) {
  return (
    !event.defaultPrevented &&
    !event.isComposing &&
    !event.repeat &&
    (event.metaKey || event.ctrlKey) &&
    event.shiftKey &&
    !event.altKey &&
    event.key.toLowerCase() === "k"
  )
}

export interface AppShellProps {
  navigation: WorkspaceNavigation
  routeModule: string
  children: ReactNode
  headerExtra?: ReactNode
  overlays?: ReactNode
  /** A renderer can keep its animation boundary mounted during exit. */
  rightPanel?: ReactNode | ((open: boolean) => ReactNode)
  rightPanelOpen?: boolean
  onRightPanelOpenChange?: (open: boolean, launcher: HTMLElement) => void
  renderRightPanelTrigger?: (props: {
    open: boolean
    onToggle: (launcher: HTMLElement) => void
    /** For the trigger's `aria-keyshortcuts`. */
    keyShortcuts?: string
  }) => ReactNode
  /** ⌘⇧K / Ctrl+Shift+K toggles the right panel (default true when a panel
   * and `onRightPanelOpenChange` are supplied). */
  rightPanelShortcut?: boolean
  /** What sits behind the dark glass (dark mode, glass material only).
   * Defaults to `<AriesMagicRings />`; pass your own fixed, `aria-hidden` layer to
   * replace it, or `null` for the plain dark ground. */
  glassBackdrop?: ReactNode
}

export function AppShell({
  navigation,
  routeModule,
  children,
  headerExtra,
  overlays,
  rightPanel,
  rightPanelOpen = false,
  onRightPanelOpenChange,
  renderRightPanelTrigger,
  rightPanelShortcut = true,
  glassBackdrop = <AriesMagicRings />,
}: AppShellProps) {
  const { activePath, locationKey = activePath } = useShellRouter()
  const labels = useShellLabels()
  // iPad portrait (701-899px) keeps the compact icon rail and lets the second
  // column be opened on demand; wider screens start expanded.
  // Server rendering has no viewport and starts expanded.
  const [navExpanded, setNavExpanded] = useState(
    () =>
      typeof window === "undefined" ||
      !window.matchMedia("(min-width: 701px) and (max-width: 899px)").matches
  )
  const [selection, setSelection] = useState({
    locationKey,
    module: routeModule,
  })
  const activeId =
    selection.locationKey === locationKey ? selection.module : routeModule
  if (selection.locationKey !== locationKey) {
    setSelection({ locationKey, module: routeModule })
  }
  const activeModule = navigation.modules.find(({ id }) => id === activeId)
  if (!activeModule) throw new Error(`Unknown navigation module: ${activeId}`)

  function selectModule(module: string) {
    setSelection({ locationKey, module })
  }

  const shortcutEnabled =
    rightPanelShortcut && rightPanel !== undefined && !!onRightPanelOpenChange
  const onShortcut = useEffectEvent((event: KeyboardEvent) => {
    if (!isRightPanelShortcut(event)) return
    // Leave the keys alone while another dialog (e.g. the command palette) is open.
    if (document.querySelector('[role="dialog"][data-state="open"]')) return
    const focused = document.activeElement
    const launcher =
      focused instanceof HTMLElement && focused !== document.body
        ? focused
        : document.querySelector<HTMLElement>(
            "[data-right-panel-trigger] :is(button, a)"
          )
    if (!launcher) return
    event.preventDefault()
    onRightPanelOpenChange?.(!rightPanelOpen, launcher)
  })

  useEffect(() => {
    if (!shortcutEnabled) return
    window.addEventListener("keydown", onShortcut)
    return () => window.removeEventListener("keydown", onShortcut)
  }, [shortcutEnabled])

  return (
    <CommandPaletteProvider commands={activeModule.commands}>
      {glassBackdrop}
      <div className="app-shell" data-nav-collapsed={!navExpanded}>
        <a className="skip-link" href="#main-content">
          {labels.skipToContent}
        </a>
        <IconRail
          navigation={navigation}
          activeModule={activeModule}
          navExpanded={navExpanded}
          onToggleNav={() => setNavExpanded((expanded) => !expanded)}
          onSelectModule={selectModule}
          rightPanelTrigger={
            renderRightPanelTrigger && (
              <span className="contents" data-right-panel-trigger="">
                {renderRightPanelTrigger({
                  open: rightPanelOpen,
                  onToggle: (launcher) =>
                    onRightPanelOpenChange?.(!rightPanelOpen, launcher),
                  keyShortcuts: shortcutEnabled
                    ? rightPanelKeyShortcuts
                    : undefined,
                })}
              </span>
            )
          }
          mobileDirectory={
            <MobileDirectory
              navigation={navigation}
              activeModule={activeModule}
              onSelectModule={selectModule}
            />
          }
        />
        <WorkspaceNav navigation={navigation} activeModule={activeModule} />
        <HeaderExtraContext.Provider value={headerExtra}>
          <MainWorkspace>{children}</MainWorkspace>
        </HeaderExtraContext.Provider>
      </div>
      {typeof rightPanel === "function"
        ? rightPanel(rightPanelOpen)
        : rightPanelOpen && rightPanel}
      {overlays}
    </CommandPaletteProvider>
  )
}
