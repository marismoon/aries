import {
  AppIcon,
  SolarChatSquare,
  SolarPlus,
  SolarQuestionCircle,
} from "@aries/ui/icons"
import { useRef } from "react"

import { useShellLabels } from "../../types/labels"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@aries/ui/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@aries/ui/ui/tabs"
import { CommandPalette } from "../CommandPalette"
import { NavHighlight } from "../NavHighlight"
import { NavTree } from "../NavTree"
import { ShellLink } from "../ShellLink"
import { SidebarNavItem } from "../SidebarNavItem"
import type { NavModule, NavNode, WorkspaceNavigation } from "../../types/nav"

function DirectoryItem({
  entry,
  nested = false,
  unavailableLabel,
  onNavigate,
}: {
  entry: NavNode
  nested?: boolean
  unavailableLabel: string
  onNavigate?: () => void
}) {
  if (entry.children) {
    return (
      <NavTree label={entry.label} icon={entry.icon}>
        {entry.children.map((child) => (
          <DirectoryItem
            key={child.id}
            entry={child}
            nested
            unavailableLabel={unavailableLabel}
            onNavigate={onNavigate}
          />
        ))}
      </NavTree>
    )
  }

  const className = nested ? "nav-tree-leaf" : undefined
  const content = (
    <>
      {entry.icon}
      <span>{entry.label}</span>
      {entry.count != null && (
        <span
          className="workspace-nav-count financial-number"
          aria-hidden={entry.path ? true : undefined}
        >
          {entry.count}
        </span>
      )}
    </>
  )
  return (
    <li>
      {entry.path ? (
        <SidebarNavItem className={className} asChild>
          <ShellLink to={entry.path} end onClick={onNavigate}>
            {content}
          </ShellLink>
        </SidebarNavItem>
      ) : (
        <SidebarNavItem className={className} title={unavailableLabel} disabled>
          {content}
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
  activeModule: NavModule
  navigation: WorkspaceNavigation
  mobile?: boolean
  onNavigate?: () => void
  onSelectModule?: (id: string) => void
}) {
  const labels = useShellLabels()
  const { modules, unavailableLabel } = navigation
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
          {activeModule.items.map((entry) => (
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
          <strong>{activeModule.label}</strong>
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
            value={activeModule.id}
            onValueChange={(value) => {
              if (modules.some(({ id }) => id === value)) onSelectModule(value)
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
              {modules.map(({ id, label }) => (
                <SelectItem key={id} value={id}>
                  {label}
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
