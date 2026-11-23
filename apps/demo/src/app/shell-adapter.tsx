import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useMatches,
  useNavigate,
} from "react-router"

import { AppShell } from "@/components/layout/AppShell"
import {
  ShellRouterProvider,
  type ShellLinkProps,
} from "@/components/layout/types/adapter"
import { useModuleCommands } from "./command-items"

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
  return (
    <ShellRouterProvider
      value={{
        activePath: pathname,
        locationKey: key,
        onNavigate: navigate,
        renderLink,
      }}
    >
      <AppShell routeId={routeId} getModuleCommands={getModuleCommands}>
        <Outlet />
      </AppShell>
    </ShellRouterProvider>
  )
}
