import {
  AppIcon,
  SolarChatSquare,
  SolarPlus,
  SolarQuestionCircle,
} from "@marismoon/ui/icons"
import { useRef } from "react"

import { useShellLabels } from "./types/labels"

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
  type NavigationEntry,
  type WorkspaceNavigation,
  type WorkspaceModuleId,
} from "./workspace-modules"

function DirectoryItem({
  entry,
  unavailableLabel,
  onNavigate,
}: {
  entry: NavigationEntry
  unavailableLabel: string
  onNavigate?: () => void
}) {
  const { label, icon } = entry

  if (entry.kind === "folder") {
    return (
      <NavTree label={label} icon={icon}>
        {entry.children.map(({ id, label, count, to }) => {
          const content = (
            <>
              <span>{label}</span>
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
            <li key={id}>
              {to ? (
                <SidebarNavItem className="nav-tree-leaf" asChild>
                  <ShellLink to={to} end onClick={onNavigate}>
                    {content}
                  </ShellLink>
                </SidebarNavItem>
              ) : (
                <SidebarNavItem
                  className="nav-tree-leaf"
                  title={unavailableLabel}
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
            <span>{entry.label}</span>
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
        <SidebarNavItem title={unavailableLabel} disabled>
          <AppIcon icon={icon} size={16} aria-hidden="true" />
          <span>{label}</span>
        </SidebarNavItem>
      )}
    </li>
  )
}

export function WorkspaceNav({
  activeModule,
  navigation,
  mobile = false,
  onNavigate,
  onSelectModule,
}: {
  activeModule: WorkspaceModuleId
  navigation: WorkspaceNavigation
  mobile?: boolean
  onNavigate?: () => void
  onSelectModule?: (id: WorkspaceModuleId) => void
}) {
  const labels = useShellLabels()
  const { modules, unavailableLabel } = navigation
  const module = modules[activeModule]
  const directoryRef = useRef<HTMLElement>(null)
  const directory = (
    <>
      <CommandPalette onNavigate={onNavigate} />
      <nav
        className="workspace-directory"
        aria-label={labels.directory}
        ref={directoryRef}
      >
        <NavHighlight containerRef={directoryRef} />
        <ul className="workspace-nav-list">
          {module.entries.map((entry) => (
            <DirectoryItem
              key={entry.id}
              entry={entry}
              unavailableLabel={unavailableLabel}
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
          <strong>{module.label}</strong>
          <button
            type="button"
            className="workspace-nav-create"
            aria-label={navigation.createLabel}
            title={unavailableLabel}
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
              aria-label={labels.switchModule}
              size="sm"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {workspaceModuleIds.map((id) => (
                <SelectItem key={id} value={id}>
                  {modules[id].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Tabs className="workspace-scope-tabs" value="all">
          <TabsList
            className="workspace-scope"
            aria-label={labels.workspaceScope}
          >
            <TabsTrigger
              value="mine"
              title={unavailableLabel}
              aria-controls={undefined}
              disabled
            >
              {labels.myTasks}
            </TabsTrigger>
            <TabsTrigger value="all">{labels.allData}</TabsTrigger>
          </TabsList>
          <TabsContent
            className="workspace-scope-panel"
            value="all"
            tabIndex={-1}
          >
            {directory}
          </TabsContent>
        </Tabs>

        <div className="workspace-nav-footer" aria-label={labels.help}>
          <button type="button" title={unavailableLabel}>
            <AppIcon icon={SolarQuestionCircle} size={16} aria-hidden="true" />
            <span>{labels.setupGuide}</span>
          </button>
          <span className="workspace-nav-footer-divider" aria-hidden="true" />
          <button type="button" title={unavailableLabel}>
            <AppIcon icon={SolarChatSquare} size={16} aria-hidden="true" />
            <span>{labels.support}</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
