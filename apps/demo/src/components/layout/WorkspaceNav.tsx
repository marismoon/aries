import {
  AppIcon,
  SolarChatSquare,
  SolarPlus,
  SolarQuestionCircle,
} from "@marismoon/ui/icons"
import { useRef } from "react"

import { useUiText } from "@/lib/i18n/use-ui-text"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@marismoon/ui/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@marismoon/ui/ui/tabs"
import { CommandPalette } from "./CommandPalette"
import { NavHighlight } from "./NavHighlight"
import { NavTree } from "./NavTree"
import { ShellLink } from "./ShellLink"
import { SidebarNavItem } from "./SidebarNavItem"
import {
  workspaceModuleIds,
  workspaceModules,
  type WorkspaceEntry,
  type WorkspaceModuleId,
} from "./workspace-modules"

function DirectoryItem({
  entry,
  onNavigate,
}: {
  entry: WorkspaceEntry
  onNavigate?: () => void
}) {
  const tl = useUiText()
  const { label, icon } = entry

  if (entry.kind === "folder") {
    return (
      <NavTree label={tl(label)} icon={icon}>
        {entry.children.map(({ label, count, to }) => {
          const content = (
            <>
              <span>{tl(label)}</span>
              {count != null && (
                <span
                  className="workspace-nav-count financial-number"
                  aria-hidden={to ? true : undefined}
                >
                  {count}
                </span>
              )}
            </>
          )

          return (
            <li key={label}>
              {to ? (
                <SidebarNavItem className="nav-tree-leaf" asChild>
                  <ShellLink to={to} end onClick={onNavigate}>
                    {content}
                  </ShellLink>
                </SidebarNavItem>
              ) : (
                <SidebarNavItem
                  className="nav-tree-leaf"
                  title={tl("Demo 暂未开放")}
                  disabled
                >
                  {content}
                </SidebarNavItem>
              )}
            </li>
          )
        })}
      </NavTree>
    )
  }

  return (
    <li>
      {entry.kind === "route" ? (
        <SidebarNavItem asChild>
          <ShellLink to={entry.to} end onClick={onNavigate}>
            <AppIcon icon={icon} size={16} stateful aria-hidden="true" />
            <span>{tl(entry.label)}</span>
            {entry.count != null && (
              <span
                className="workspace-nav-count financial-number"
                aria-hidden="true"
              >
                {entry.count}
              </span>
            )}
          </ShellLink>
        </SidebarNavItem>
      ) : (
        <SidebarNavItem title={tl("Demo 暂未开放")} disabled>
          <AppIcon icon={icon} size={16} aria-hidden="true" />
          <span>{tl(label)}</span>
        </SidebarNavItem>
      )}
    </li>
  )
}

export function WorkspaceNav({
  activeModule,
  mobile = false,
  onNavigate,
  onSelectModule,
}: {
  activeModule: WorkspaceModuleId
  mobile?: boolean
  onNavigate?: () => void
  onSelectModule?: (id: WorkspaceModuleId) => void
}) {
  const tl = useUiText()
  const module = workspaceModules[activeModule]
  const directoryRef = useRef<HTMLElement>(null)
  const directory = (
    <>
      <CommandPalette onNavigate={onNavigate} />
      <nav
        className="workspace-directory"
        aria-label={tl("工作区目录")}
        ref={directoryRef}
      >
        <NavHighlight containerRef={directoryRef} />
        <ul className="workspace-nav-list">
          {module.entries.map((entry) => (
            <DirectoryItem
              key={entry.label}
              entry={entry}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      </nav>
    </>
  )

  return (
    <aside
      className={mobile ? "workspace-nav--mobile" : "workspace-nav--desktop"}
      id={mobile ? undefined : "workspace-desktop-navigation"}
      data-layout-column={mobile ? undefined : "nav"}
    >
      <div className="workspace-nav">
        <div className="workspace-nav-heading">
          <strong>{tl(module.label)}</strong>
          <button
            type="button"
            className="workspace-nav-create"
            aria-label={tl("新建采集计划，Demo 暂未开放")}
            title={tl("Demo 暂未开放")}
            disabled
          >
            <AppIcon icon={SolarPlus} size={16} aria-hidden="true" />
          </button>
        </div>

        {mobile && onSelectModule && (
          <Select
            value={activeModule}
            onValueChange={(value) => {
              const id = workspaceModuleIds.find((id) => id === value)
              if (id) onSelectModule(id)
            }}
          >
            <SelectTrigger
              className="w-full"
              aria-label={tl("切换工作区模块")}
              size="sm"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {workspaceModuleIds.map((id) => (
                <SelectItem key={id} value={id}>
                  {tl(workspaceModules[id].label)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Tabs className="workspace-scope-tabs" value="all">
          <TabsList className="workspace-scope" aria-label={tl("工作区范围")}>
            <TabsTrigger
              value="mine"
              title={tl("Demo 暂未开放")}
              aria-controls={undefined}
              disabled
            >
              {tl("我的待办")}
            </TabsTrigger>
            <TabsTrigger value="all">{tl("全部数据")}</TabsTrigger>
          </TabsList>
          <TabsContent
            className="workspace-scope-panel"
            value="all"
            tabIndex={-1}
          >
            {directory}
          </TabsContent>
        </Tabs>

        <div className="workspace-nav-footer" aria-label={tl("帮助")}>
          <button type="button" title={tl("Demo 暂未开放")}>
            <AppIcon icon={SolarQuestionCircle} size={16} aria-hidden="true" />
            <span>{tl("配置手册")}</span>
          </button>
          <span className="workspace-nav-footer-divider" aria-hidden="true" />
          <button type="button" title={tl("Demo 暂未开放")}>
            <AppIcon icon={SolarChatSquare} size={16} aria-hidden="true" />
            <span>{tl("技术支持")}</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
