import { useEffect, useState, type ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { useUiText } from "@/lib/i18n/use-ui-text"
import { workspacePages } from "@/app/workspace-pages"
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
import type { WorkspaceModuleId } from "./workspace-modules"
import { useShellRouter } from "./types/adapter"
import "./layout.css"

function MobileDirectory({
  activeModule,
  onSelectModule,
}: {
  activeModule: WorkspaceModuleId
  onSelectModule: (id: WorkspaceModuleId) => void
}) {
  const tl = useUiText()
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rail-control mobile-directory-trigger"
          aria-label={tl("打开工作区导航")}
        >
          <AppIcon icon={SolarPanelLeftOpen} size={22} aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <DialogContent className="mobile-directory-panel">
        <DialogTitle className="sr-only">{tl("工作区导航")}</DialogTitle>
        <DialogDescription className="sr-only">
          {tl("切换模块，或打开运营总览、月账单。")}
        </DialogDescription>
        <WorkspaceNav
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
  routeId,
  children,
}: {
  getModuleCommands: (module: WorkspaceModuleId) => ModuleCommands
  routeId?: string
  children: ReactNode
}) {
  const { activePath, locationKey = activePath } = useShellRouter()
  const { t } = useTranslation()
  const tl = useUiText()
  const page =
    Object.values(workspacePages).find(({ id }) => id === routeId) ??
    workspacePages.overview
  const routeModule: WorkspaceModuleId = page.moduleId
  const pageName = t(page.titleKey)
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
          {tl("跳到主内容")}
        </a>
        <IconRail
          activeModule={activeModule}
          navExpanded={navExpanded}
          copilotOpen={copilotOpen}
          copilotPanelId={copilot.panelId}
          onToggleNav={() => setNavExpanded((expanded) => !expanded)}
          onSelectModule={selectModule}
          onOpenCopilot={copilotOpen ? closeCopilot : openCopilotFrom}
          mobileDirectory={
            <MobileDirectory
              activeModule={activeModule}
              onSelectModule={selectModule}
            />
          }
        />
        <WorkspaceNav activeModule={activeModule} />
        <MainWorkspace>{children}</MainWorkspace>
      </div>
      <CopilotPanel copilot={copilot} pageName={pageName} />
    </CommandPaletteProvider>
  )
}
