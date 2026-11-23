import { useId, useState, type ReactNode } from "react"
import { AppIcon, SolarChevronDown } from "@marismoon/ui/icons"
import { SidebarNavItem } from "./SidebarNavItem"

export function NavTree({
  label,
  icon,
  children,
}: {
  label: string
  icon: ReactNode
  children: ReactNode
}) {
  const [expanded, setExpanded] = useState(true)
  const id = useId()

  return (
    <li>
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
      <ul id={id} className="nav-tree-children" hidden={!expanded}>
        {children}
      </ul>
    </li>
  )
}
