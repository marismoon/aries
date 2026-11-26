import { useId, useState, type CSSProperties, type ReactNode } from "react"
import { AppIcon, SolarChevronDown } from "@marismoon/ui/icons"
import { SidebarNavItem } from "../SidebarNavItem"

export function NavTree({
  label,
  icon,
  style,
  children,
}: {
  label: string
  icon: ReactNode
  style?: CSSProperties
  children: ReactNode
}) {
  const [expanded, setExpanded] = useState(true)
  const id = useId()

  return (
    <li style={style}>
      <SidebarNavItem
        className="workspace-nav-parent"
        aria-controls={id}
        aria-expanded={expanded}
        onClick={() => setExpanded(!expanded)}
      >
        {icon}
        <span>{label}</span>
        <AppIcon
          icon={SolarChevronDown}
          size={16}
          className="nav-caret"
          aria-hidden="true"
        />
      </SidebarNavItem>
      <div
        id={id}
        className="nav-tree-panel"
        data-expanded={expanded ? "true" : "false"}
        aria-hidden={!expanded || undefined}
        inert={!expanded || undefined}
      >
        <div className="nav-tree-panel-inner">
          <ul className="nav-tree-children">{children}</ul>
        </div>
      </div>
    </li>
  )
}
