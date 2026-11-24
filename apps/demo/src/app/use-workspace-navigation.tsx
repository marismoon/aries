import { useMemo } from "react"
import { AppIcon } from "@aries/ui/icons"
import type { NavModule, NavNode, WorkspaceNavigation } from "@aries/shell"
import { useUiText } from "@/lib/i18n/use-ui-text"
import { getModuleCommands } from "./command-items"
import {
  workspaceModuleIds,
  workspaceModules,
  type WorkspaceEntry,
} from "./workspace-modules"
import { workspacePages } from "./workspace-pages"

export function useWorkspaceNavigation(): WorkspaceNavigation {
  const tl = useUiText()

  return useMemo(() => {
    function translateEntry(entry: WorkspaceEntry): NavNode {
      const node = {
        id: entry.label,
        label: tl(entry.label),
        icon: (
          <AppIcon
            icon={entry.icon}
            size={16}
            stateful={entry.kind !== "demo"}
            aria-hidden="true"
          />
        ),
      }
      if (entry.kind === "route")
        return { ...node, path: entry.to, count: entry.count }
      if (entry.kind === "folder")
        return {
          ...node,
          children: entry.children.map((child) => ({
            id: child.label,
            label: tl(child.label),
            path: child.to,
            count: child.count,
          })),
        }
      return node
    }

    const modules = workspaceModuleIds.map((id): NavModule => {
      const module = workspaceModules[id]
      return {
        id,
        label: tl(module.label),
        icon: (
          <AppIcon icon={module.icon} size={22} stateful aria-hidden="true" />
        ),
        railPosition: id === "settings" ? "footer" : "main",
        visibleOnMobile: id === "overview",
        items: module.entries.map(translateEntry),
        commands: getModuleCommands(id, tl),
      }
    })

    return {
      modules,
      directoryDescription: tl("切换模块，或打开运营总览、月账单。"),
      createLabel: tl("新建采集计划，Demo 暂未开放"),
      unavailableLabel: tl("Demo 暂未开放"),
      brandLabel: tl("Marismoon 工作台"),
      brandPath: workspacePages.overview.path,
      brandMark: "fH",
      userLabel: tl("演示用户 · 管理员"),
      avatarSrc: "https://github.com/pranathip.png",
      avatarFallback: "M",
    }
  }, [tl])
}
