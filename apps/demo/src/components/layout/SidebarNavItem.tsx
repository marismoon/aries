import type { ComponentProps } from "react"
import { cn } from "cn"
import { Button } from "@marismoon/ui/ui/button"

export function SidebarNavItem({
  asChild,
  className,
  ...props
}: ComponentProps<typeof Button>) {
  return (
    <Button
      size="default"
      asChild={asChild}
      type={asChild ? undefined : "button"}
      variant="ghost"
      className={cn("workspace-nav-item", className)}
      {...props}
    />
  )
}
