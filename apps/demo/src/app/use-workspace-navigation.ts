import { useMemo } from "react"
import {
  workspaceModuleIds,
  workspaceModules,
  type NavigationEntry,
  type WorkspaceEntry,
  type WorkspaceModuleId,
  type WorkspaceNavigation,
} from "@/components/layout/workspace-modules"
import { useUiText } from "@/lib/i18n/use-ui-text"

export function useWorkspaceNavigation(): WorkspaceNavigation {
  const tl = useUiText()

  return useMemo(() => {
    function translateEntry(entry: WorkspaceEntry): NavigationEntry {
      const id = entry.label
      const label = tl(entry.label)
      if (entry.kind !== "folder") return { ...entry, id, label }
      return {
        ...entry,
        id,
        label,
        children: entry.children.map((child) => ({
          ...child,
          id: child.label,
          label: tl(child.label),
        })),
      }
    }

    const modules = Object.fromEntries<
      WorkspaceNavigation["modules"][WorkspaceModuleId]
    >(
      workspaceModuleIds.map((id) => {
        const module = workspaceModules[id]
        return [
          id,
          {
            ...module,
            label: tl(module.label),
            entries: module.entries.map(translateEntry),
          },
        ]
      })
    ) as WorkspaceNavigation["modules"]

    return {
      modules,
      directoryDescription: tl("切换模块，或打开运营总览、月账单。"),
      createLabel: tl("新建采集计划，Demo 暂未开放"),
      unavailableLabel: tl("Demo 暂未开放"),
      brandLabel: tl("Marismoon 工作台"),
      userLabel: tl("演示用户 · 管理员"),
      panelLabel: tl("Marismoon 智算助手"),
      panelTooltip: tl("AI 助手"),
    }
  }, [tl])
}
