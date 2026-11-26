import { SolarCog, SolarHomeSmileAngle } from "@marismoon/ui/icons"
import { HomePage } from "../features/home/HomePage"
import { SettingsPage } from "../features/settings/SettingsPage"

// In the starter each module has one page, shared by the router and navigation.
export const workspaceModules = [
  {
    id: "home",
    path: "/home",
    titleKey: "home.title",
    icon: SolarHomeSmileAngle,
    railPosition: "main",
    Content: HomePage,
  },
  {
    id: "settings",
    path: "/settings",
    titleKey: "settings.title",
    icon: SolarCog,
    railPosition: "footer",
    Content: SettingsPage,
  },
] as const
