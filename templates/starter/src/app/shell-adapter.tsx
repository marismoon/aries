import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useMatches,
  useNavigate,
} from "react-router"
import {
  AppShell,
  ShellRouterProvider,
  type ShellLinkProps,
  type WorkspaceNavigation,
} from "@marismoon/shell"
import { AppIcon } from "@marismoon/ui/icons"

import { ShellLabelsBridge } from "../lib/i18n/ShellLabelsBridge"
import { NavHighlightProvider } from "./nav-highlight"
import { workspaceModules } from "./workspace-modules"

function renderLink({ end, ...props }: ShellLinkProps) {
  return end === undefined ? (
    <Link {...props} />
  ) : (
    <NavLink {...props} end={end} />
  )
}

export function StarterShell() {
  const { pathname, key } = useLocation()
  const routeId = useMatches().at(-1)?.id
  const navigate = useNavigate()
  const { t } = useTranslation()
  const page =
    workspaceModules.find(({ id }) => id === routeId) ?? workspaceModules[0]
  const title = t(page.titleKey)

  useEffect(() => {
    document.title = `${title} · Aries`
  }, [title])

  const navigation: WorkspaceNavigation = {
    modules: workspaceModules.map(
      ({ id, path, titleKey, bodyKey, icon, railPosition }) => {
        const label = t(titleKey)
        return {
          id,
          label,
          railPosition,
          visibleOnMobile: true,
          icon: <AppIcon icon={icon} size={22} stateful aria-hidden="true" />,
          items: [
            {
              id,
              label,
              path,
              icon: (
                <AppIcon icon={icon} size={16} stateful aria-hidden="true" />
              ),
            },
          ],
          commands: {
            triggerLabel: t("nav.search"),
            placeholder: t("nav.placeholder"),
            items: [{ title: label, description: t(bodyKey), path, icon }],
          },
        }
      }
    ),
    directoryDescription: t("nav.directoryDescription"),
    createLabel: t("nav.create"),
    unavailableLabel: t("nav.unavailable"),
    brandLabel: t("nav.brand"),
    brandPath: workspaceModules[0].path,
    brandMark: "M",
    userLabel: t("nav.user"),
    avatarSrc: "",
    avatarFallback: "M",
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
        <NavHighlightProvider>
          <AppShell navigation={navigation} routeModule={page.id}>
            <Outlet />
          </AppShell>
        </NavHighlightProvider>
      </ShellLabelsBridge>
    </ShellRouterProvider>
  )
}
