import { useState, type ReactNode } from "react"
import { AppIcon, SolarPanelLeftOpen } from "@marismoon/ui/icons"
import { Button } from "@marismoon/ui/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@marismoon/ui/ui/dialog"
import { CommandPaletteProvider } from "./CommandPalette"
import { IconRail } from "./IconRail"
import { MainWorkspace } from "./MainWorkspace"
import { WorkspaceNav } from "./WorkspaceNav"
import type { NavModule, WorkspaceNavigation } from "./types/nav"
import { HeaderExtraContext } from "./context/header-extra"
import { useShellRouter } from "./types/adapter"
import { useShellLabels } from "./types/labels"
import "./layout.css"

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
  }) => ReactNode
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
}: AppShellProps) {
  const { activePath, locationKey = activePath } = useShellRouter()
  const labels = useShellLabels()
  // iPad portrait (701-899px) keeps the compact icon rail and lets the second
  // column be opened on demand; wider screens start expanded.
  const [navExpanded, setNavExpanded] = useState(
    () =>
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

  return (
    <CommandPaletteProvider commands={activeModule.commands}>
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
          rightPanelTrigger={renderRightPanelTrigger?.({
            open: rightPanelOpen,
            onToggle: (launcher) =>
              onRightPanelOpenChange?.(!rightPanelOpen, launcher),
          })}
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
