import { useEffect, useState, type ReactNode } from "react"
import { AppIcon, SolarPanelLeftOpen } from "@marismoon/ui/icons"
import { Button } from "@marismoon/ui/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@marismoon/ui/ui/dialog"
import { CopilotPanel } from "@/features/copilot/CopilotPanel"
import { useCopilot } from "@/features/copilot/useCopilot"
import { CommandPaletteProvider, type ModuleCommands } from "./CommandPalette"
import { IconRail } from "./IconRail"
import { MainWorkspace } from "./MainWorkspace"
import { WorkspaceNav } from "./WorkspaceNav"
import type {
  WorkspaceModuleId,
  WorkspaceNavigation,
} from "./workspace-modules"
import { useShellRouter } from "./types/adapter"
import { useShellLabels } from "./types/labels"
import "./layout.css"

function MobileDirectory({
  navigation,
  activeModule,
  onSelectModule,
}: {
  navigation: WorkspaceNavigation
  activeModule: WorkspaceModuleId
  onSelectModule: (id: WorkspaceModuleId) => void
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

export function AppShell({
  getModuleCommands,
  navigation,
  routeModule,
  pageName,
  children,
}: {
  getModuleCommands: (module: WorkspaceModuleId) => ModuleCommands
  navigation: WorkspaceNavigation
  routeModule: WorkspaceModuleId
  pageName: string
  children: ReactNode
}) {
  const { activePath, locationKey = activePath } = useShellRouter()
  const labels = useShellLabels()
  // iPad portrait (701-899px) keeps the compact icon rail and lets the second
  // column be opened on demand; wider screens start expanded.
  const [navExpanded, setNavExpanded] = useState(
    () =>
      !window.matchMedia("(min-width: 701px) and (max-width: 899px)").matches
  )
  const [selection, setSelection] = useState<{
    locationKey: string
    module: WorkspaceModuleId
  }>({ locationKey, module: routeModule })
  const activeModule =
    selection.locationKey === locationKey ? selection.module : routeModule
  if (selection.locationKey !== locationKey) {
    setSelection({ locationKey, module: routeModule })
  }
  const copilot = useCopilot()
  const {
    open: copilotOpen,
    openFrom: openCopilotFrom,
    close: closeCopilot,
  } = copilot

  function selectModule(module: WorkspaceModuleId) {
    setSelection({ locationKey, module })
  }

  useEffect(() => {
    document.title = `${pageName} · Marismoon`
  }, [pageName])

  useEffect(() => {
    function handleCopilotShortcut(event: KeyboardEvent) {
      if (
        event.defaultPrevented ||
        event.isComposing ||
        event.repeat ||
        (!event.metaKey && !event.ctrlKey) ||
        !event.shiftKey ||
        event.altKey ||
        event.key.toLowerCase() !== "k"
      )
        return

      if (document.querySelector('[role="dialog"][data-state="open"]')) return

      event.preventDefault()
      if (copilotOpen) {
        closeCopilot()
        return
      }

      const focused = document.activeElement
      const origin =
        focused instanceof HTMLElement && focused !== document.body
          ? focused
          : document.querySelector<HTMLElement>('[data-copilot-trigger="rail"]')
      openCopilotFrom(origin)
    }

    window.addEventListener("keydown", handleCopilotShortcut)
    return () => window.removeEventListener("keydown", handleCopilotShortcut)
  }, [copilotOpen, openCopilotFrom, closeCopilot])

  return (
    <CommandPaletteProvider commands={getModuleCommands(activeModule)}>
      <div className="app-shell" data-nav-collapsed={!navExpanded}>
        <a className="skip-link" href="#main-content">
          {labels.skipToContent}
        </a>
        <IconRail
          navigation={navigation}
          activeModule={activeModule}
          navExpanded={navExpanded}
          copilotOpen={copilotOpen}
          copilotPanelId={copilot.panelId}
          onToggleNav={() => setNavExpanded((expanded) => !expanded)}
          onSelectModule={selectModule}
          onOpenCopilot={copilotOpen ? closeCopilot : openCopilotFrom}
          mobileDirectory={
            <MobileDirectory
              navigation={navigation}
              activeModule={activeModule}
              onSelectModule={selectModule}
            />
          }
        />
        <WorkspaceNav navigation={navigation} activeModule={activeModule} />
        <MainWorkspace>{children}</MainWorkspace>
      </div>
      <CopilotPanel copilot={copilot} pageName={pageName} />
    </CommandPaletteProvider>
  )
}
