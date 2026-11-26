import { useState } from "react"
import {
  Link,
  Navigate,
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
  useDocumentTitle,
} from "@marismoon/shell"
import { AppIcon, SolarSparkles } from "@marismoon/ui/icons"
import { Button } from "@marismoon/ui/ui/button"
import { CopilotPanel } from "@/features/copilot/CopilotPanel"
import {
  GlassBackdropControl,
  GlassBackdropLayer,
  useGlassBackdrop,
} from "@/features/glass-backdrop/glass-backdrop"
import { UserNotificationsBell } from "@/features/notifications/UserNotificationsBell"
import { useCopilot } from "@/features/copilot/useCopilot"
import {
  SetupGuideDrawer,
  SupportDialog,
} from "@/features/workspace-chrome/HelpDialogs"
import {
  UserMenuDockedSheet,
  UserMenuTrigger,
} from "@/features/workspace-chrome/UserMenuPopover"
import { useUiText } from "@/lib/i18n/use-ui-text"
import { ShellLabelsBridge } from "@/lib/i18n/ShellLabelsBridge"
import { useWorkspaceStore } from "@/shared/mocks/workspace-store"
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
  const { pathname, search, key } = useLocation()
  const routeId = useMatches().at(-1)?.id
  const navigate = useNavigate()
  const tl = useUiText()
  const store = useWorkspaceStore()
  const navigation = useWorkspaceNavigation()
  const { t } = useTranslation()
  const [setupGuideOpen, setSetupGuideOpen] = useState(false)
  const [supportOpen, setSupportOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [userMenuPath, setUserMenuPath] = useState(pathname)
  if (userMenuPath !== pathname) {
    setUserMenuPath(pathname)
    setUserMenuOpen(false)
  }

  const page =
    Object.values(workspacePages).find(({ id }) => id === routeId) ??
    workspacePages.overview
  const pageName = t(page.titleKey)
  const copilot = useCopilot()
  const glassBackdrop = useGlassBackdrop()
  const {
    open: copilotOpen,
    openFrom: openCopilotFrom,
    close: closeCopilot,
  } = copilot

  useDocumentTitle(`${pageName} · Aries`)

  if (!store.session) {
    const redirect = encodeURIComponent(`${pathname}${search}`)
    return <Navigate to={`/login?redirect=${redirect}`} replace />
  }

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
        <AppShell
          navigation={navigation}
          routeModule={page.moduleId}
          headerExtra={
            <>
              <GlassBackdropControl />
              <UserNotificationsBell />
            </>
          }
          {...(glassBackdrop !== "magic-rings" && {
            glassBackdrop: <GlassBackdropLayer kind={glassBackdrop} />,
          })}
          renderUserMenu={(avatar, { navExpanded }) => (
            <UserMenuTrigger
              avatar={avatar}
              open={userMenuOpen}
              onOpenChange={setUserMenuOpen}
              navExpanded={navExpanded}
            />
          )}
          navOverlay={
            <UserMenuDockedSheet
              open={userMenuOpen}
              onClose={() => setUserMenuOpen(false)}
            />
          }
          onSetupGuideClick={() => setSetupGuideOpen(true)}
          onSupportClick={() => setSupportOpen(true)}
          overlays={
            <>
              <SetupGuideDrawer
                open={setupGuideOpen}
                onOpenChange={setSetupGuideOpen}
              />
              <SupportDialog open={supportOpen} onOpenChange={setSupportOpen} />
            </>
          }
          rightPanel={(open) => <CopilotPanel open={open} copilot={copilot} />}
          rightPanelOpen={copilotOpen}
          onRightPanelOpenChange={(open, launcher) => {
            if (open) openCopilotFrom(launcher)
            else closeCopilot()
          }}
          renderRightPanelTrigger={({ open, onToggle, keyShortcuts }) => (
            <RailTooltip label={tl("AI 助手")}>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rail-control rail-ai"
                data-copilot-trigger="rail"
                aria-label={tl("Aries 智算助手")}
                aria-expanded={open}
                aria-controls={open ? copilot.panelId : undefined}
                aria-keyshortcuts={keyShortcuts}
                onClick={(event) => onToggle(event.currentTarget)}
              >
                <AppIcon icon={SolarSparkles} size={22} aria-hidden="true" />
              </Button>
            </RailTooltip>
          )}
        >
          <Outlet />
        </AppShell>
      </ShellLabelsBridge>
    </ShellRouterProvider>
  )
}
