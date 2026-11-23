import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useMatches,
  useNavigate,
} from "react-router"
import { useTranslation } from "react-i18next"

import { AppShell } from "@/components/layout/AppShell"
import {
  ShellRouterProvider,
  type ShellLinkProps,
} from "@/components/layout/types/adapter"
import { useModuleCommands } from "./command-items"
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
  const getModuleCommands = useModuleCommands()
  const navigation = useWorkspaceNavigation()
  const { t } = useTranslation()
  const page =
    Object.values(workspacePages).find(({ id }) => id === routeId) ??
    workspacePages.overview
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
          pageName={t(page.titleKey)}
          getModuleCommands={getModuleCommands}
        >
          <Outlet />
        </AppShell>
      </ShellLabelsBridge>
    </ShellRouterProvider>
  )
}
