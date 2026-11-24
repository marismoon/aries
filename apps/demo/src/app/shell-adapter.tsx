import { useEffect } from "react"
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useMatches,
  useNavigate,
} from "react-router"
import { useTranslation } from "react-i18next"

import {
  AppShell,
  RailTooltip,
  ShellRouterProvider,
  type ShellLinkProps,
} from "@marismoon/shell"
import { AppIcon, SolarSparkles } from "@marismoon/ui/icons"
import { Button } from "@marismoon/ui/ui/button"
import { CopilotPanel } from "@/features/copilot/CopilotPanel"
import { useCopilot } from "@/features/copilot/useCopilot"
import { useUiText } from "@/lib/i18n/use-ui-text"
import { DemoNavHighlightProvider } from "./nav-highlight"
import { ShellLabelsBridge } from "@/lib/i18n/ShellLabelsBridge"
import { useWorkspaceNavigation } from "./use-workspace-navigation"
import { workspacePages } from "./workspace-pages"

function renderLink({ end, ...props }: ShellLinkProps) {
  return end === undefined ? (
    <Link {...props} />
  ) : (
    <NavLink {...props} end={end} />
  )
}

export function DemoShell() {
  const { pathname, key } = useLocation()
  const routeId = useMatches().at(-1)?.id
  const navigate = useNavigate()
  const tl = useUiText()
  const navigation = useWorkspaceNavigation()
  const { t } = useTranslation()
  const page =
    Object.values(workspacePages).find(({ id }) => id === routeId) ??
    workspacePages.overview
  const pageName = t(page.titleKey)
  const copilot = useCopilot()
  const {
    open: copilotOpen,
    openFrom: openCopilotFrom,
    close: closeCopilot,
  } = copilot

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
    <ShellRouterProvider
      value={{
        activePath: pathname,
        locationKey: key,
        onNavigate: navigate,
        renderLink,
      }}
    >
      <ShellLabelsBridge>
        <DemoNavHighlightProvider>
          <AppShell
            navigation={navigation}
            routeModule={page.moduleId}
            rightPanel={(open) => (
              <CopilotPanel open={open} copilot={copilot} pageName={pageName} />
            )}
            rightPanelOpen={copilotOpen}
            onRightPanelOpenChange={(open, launcher) => {
              if (open) openCopilotFrom(launcher)
              else closeCopilot()
            }}
            renderRightPanelTrigger={({ open, onToggle }) => (
              <RailTooltip label={tl("AI 助手")}>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="rail-control rail-ai"
                  data-copilot-trigger="rail"
                  aria-label={tl("Marismoon 智算助手")}
                  aria-expanded={open}
                  aria-controls={open ? copilot.panelId : undefined}
                  aria-keyshortcuts="Meta+Shift+K Control+Shift+K"
                  onClick={(event) => onToggle(event.currentTarget)}
                >
                  <AppIcon icon={SolarSparkles} size={22} aria-hidden="true" />
                </Button>
              </RailTooltip>
            )}
          >
            <Outlet />
          </AppShell>
        </DemoNavHighlightProvider>
      </ShellLabelsBridge>
    </ShellRouterProvider>
  )
}
