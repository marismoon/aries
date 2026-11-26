import {
  AppIcon,
  SolarChatSquare,
  SolarPlus,
  SolarQuestionCircle,
} from "@marismoon/ui/icons"
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react"

import { useShellLabels } from "../../types/labels"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@marismoon/ui/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@marismoon/ui/ui/tabs"
import { CommandPalette } from "../CommandPalette"
import { NavHighlight } from "../NavHighlight"
import { NavTree } from "../NavTree"
import { ShellLink } from "../ShellLink"
import { SidebarNavItem } from "../SidebarNavItem"
import type { NavModule, NavNode, WorkspaceNavigation } from "../../types/nav"

function availableEntries(entries: readonly NavNode[]): NavNode[] {
  return entries.flatMap((entry) => {
    if (!entry.children) return entry.path ? [entry] : []
    const children = availableEntries(entry.children)
    return children.length ? [{ ...entry, children }] : []
  })
}

function DirectoryItem({
  entry,
  index,
  nested = false,
  unavailableLabel,
  onNavigate,
}: {
  entry: NavNode
  index?: number
  nested?: boolean
  unavailableLabel: string
  onNavigate?: () => void
}) {
  const itemStyle =
    index !== undefined
      ? nested
        ? ({ "--nav-child-index": Math.min(index, 3) } as CSSProperties)
        : ({ "--nav-item-index": Math.min(index, 7) } as CSSProperties)
      : undefined

  if (entry.children) {
    return (
      <NavTree label={entry.label} icon={entry.icon} style={itemStyle}>
        {entry.children.map((child, childIndex) => (
          <DirectoryItem
            key={child.id}
            entry={child}
            index={childIndex}
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
    <li style={itemStyle}>
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
  overlay,
  onNavigate,
  onSelectModule,
  onSetupGuideClick,
  onSupportClick,
}: {
  activeModule: NavModule
  navigation: WorkspaceNavigation
  mobile?: boolean
  overlay?: ReactNode
  onNavigate?: () => void
  onSelectModule?: (id: string) => void
  onSetupGuideClick?: () => void
  onSupportClick?: () => void
}) {
  const labels = useShellLabels()
  const { modules, unavailableLabel } = navigation
  const showPlaceholders = navigation.showPlaceholders !== false
  const showSetup = showPlaceholders || Boolean(onSetupGuideClick)
  const showSupport = showPlaceholders || Boolean(onSupportClick)
  const entries = showPlaceholders
    ? activeModule.items
    : availableEntries(activeModule.items)
  const directoryRef = useRef<HTMLElement>(null)
  const prevModuleRef = useRef(activeModule.id)
  const [animateList, setAnimateList] = useState(false)

  useEffect(() => {
    if (prevModuleRef.current !== activeModule.id) {
      prevModuleRef.current = activeModule.id
      setAnimateList(true)
      if (directoryRef.current) directoryRef.current.scrollTop = 0
    }
  }, [activeModule.id])

  const directory = (
    <>
      <CommandPalette onNavigate={onNavigate} />
      <nav
        className="workspace-directory"
        aria-label={labels.directory}
        ref={directoryRef}
      >
        <NavHighlight containerRef={directoryRef} />
        <ul
          key={activeModule.id}
          className="workspace-nav-list"
          data-animate={animateList ? "true" : undefined}
        >
          {entries.map((entry, index) => (
            <DirectoryItem
              key={entry.id}
              entry={entry}
              index={index}
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
      <div
        className={
          mobile ? "workspace-nav" : "workspace-nav workspace-nav-surface"
        }
      >
        <div className="workspace-nav-heading">
          <strong>{activeModule.label}</strong>
          {showPlaceholders && (
            <button
              type="button"
              className="workspace-nav-create"
              aria-label={navigation.createLabel}
              title={unavailableLabel}
              disabled
            >
              <AppIcon icon={SolarPlus} size={16} aria-hidden="true" />
            </button>
          )}
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

        {showPlaceholders ? (
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
        ) : (
          <div className="workspace-scope-panel">{directory}</div>
        )}

        {(showSetup || showSupport) && (
          <div className="workspace-nav-footer" aria-label={labels.help}>
            {showSetup && (
              <button
                type="button"
                title={onSetupGuideClick ? undefined : unavailableLabel}
                onClick={
                  onSetupGuideClick
                    ? () => {
                        onNavigate?.()
                        onSetupGuideClick()
                      }
                    : undefined
                }
              >
                <AppIcon
                  icon={SolarQuestionCircle}
                  size={16}
                  aria-hidden="true"
                />
                <span>{labels.setupGuide}</span>
              </button>
            )}
            {showSetup && showSupport && (
              <span
                className="workspace-nav-footer-divider"
                aria-hidden="true"
              />
            )}
            {showSupport && (
              <button
                type="button"
                title={onSupportClick ? undefined : unavailableLabel}
                onClick={
                  onSupportClick
                    ? () => {
                        onNavigate?.()
                        onSupportClick()
                      }
                    : undefined
                }
              >
                <AppIcon icon={SolarChatSquare} size={16} aria-hidden="true" />
                <span>{labels.support}</span>
              </button>
            )}
          </div>
        )}
      </div>
      {!mobile && overlay}
    </aside>
  )
}
