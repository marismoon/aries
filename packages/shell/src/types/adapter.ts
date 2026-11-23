import {
  createContext,
  useContext,
  type ComponentPropsWithRef,
  type ReactNode,
} from "react"

export type ShellLinkProps = Omit<ComponentPropsWithRef<"a">, "href"> & {
  to: string
  /** When supplied, render a navigation link and mark its active state. */
  end?: boolean
}

export interface ShellRouterAdapter {
  activePath: string
  /** Distinguishes visits to the same path when restoring scroll or selection. */
  locationKey?: string
  onNavigate?: (path: string) => void | Promise<void>
  renderLink?: (props: ShellLinkProps) => ReactNode
}

const ShellRouterContext = createContext<ShellRouterAdapter | null>(null)
export const ShellRouterProvider = ShellRouterContext.Provider

export function useShellRouter() {
  const adapter = useContext(ShellRouterContext)
  if (!adapter) throw new Error("ShellRouterProvider is required")
  return adapter
}
