import type { ReactNode } from "react"
import type { ModuleCommands } from "../components/CommandPalette"

export interface NavNode {
  id: string
  label: string
  icon?: ReactNode
  path?: string
  count?: number
  children?: readonly NavNode[]
}

export interface NavModule {
  id: string
  label: string
  icon: ReactNode
  railPosition: "main" | "footer"
  visibleOnMobile: boolean
  items: readonly NavNode[]
  commands: ModuleCommands
}

export interface WorkspaceNavigation {
  modules: readonly NavModule[]
  /** Keep unavailable navigation examples visible by default. */
  showPlaceholders?: boolean
  directoryDescription: string
  createLabel: string
  unavailableLabel: string
  brandLabel: string
  brandPath: string
  brandMark: ReactNode
  userLabel: string
  avatarSrc: string
  avatarFallback: string
}
