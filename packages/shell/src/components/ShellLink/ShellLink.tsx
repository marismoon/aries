import { useShellRouter, type ShellLinkProps } from "../../types/adapter"

export function ShellLink(props: ShellLinkProps) {
  const { activePath, renderLink, onNavigate } = useShellRouter()
  if (renderLink) return renderLink(props)

  const { to, end, onClick, className, children, ...anchor } = props
  // Server rendering has no window: resolve against a placeholder origin, so
  // relative links count as local and absolute ones as external.
  const here =
    typeof window === "undefined" ? "http://localhost/" : window.location.href
  const url = new URL(to, here)
  const local = url.origin === new URL(here).origin
  const path = activePath.toLowerCase()
  const destination = url.pathname.toLowerCase()
  const active =
    local &&
    end !== undefined &&
    (path === destination ||
      (!end &&
        destination !== "/" &&
        path.startsWith(destination.replace(/\/$/, "") + "/")))

  return (
    <a
      {...anchor}
      href={to}
      className={
        active ? [className, "active"].filter(Boolean).join(" ") : className
      }
      aria-current={active ? "page" : anchor["aria-current"]}
      onClick={(event) => {
        onClick?.(event)
        if (
          onNavigate &&
          local &&
          !event.defaultPrevented &&
          event.button === 0 &&
          !event.altKey &&
          !event.ctrlKey &&
          !event.metaKey &&
          !event.shiftKey &&
          (!anchor.target || anchor.target === "_self") &&
          !event.currentTarget.hasAttribute("download")
        ) {
          event.preventDefault()
          void onNavigate(to)
        }
      }}
    >
      {children}
    </a>
  )
}
