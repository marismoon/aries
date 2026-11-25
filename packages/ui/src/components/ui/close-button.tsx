import * as React from "react"
import { cn } from "cn"

import { AppIcon, SolarClose } from "../icons"
import { Button } from "./button"

/**
 * The one look for close, remove and clear buttons: no fill at rest or on
 * hover; the icon goes from muted Linear to foreground Bold on hover or press.
 * Add it to a ghost button that renders `CloseIcon`.
 */
const closeButtonClass =
  "bg-transparent text-muted-foreground shadow-none hover:bg-transparent hover:text-foreground active:text-foreground aria-expanded:bg-transparent dark:hover:bg-transparent"

function CloseIcon(
  props: Omit<React.ComponentProps<typeof AppIcon>, "icon" | "stateful">
) {
  return (
    <AppIcon
      icon={SolarClose}
      size={16}
      stateful
      aria-hidden="true"
      {...props}
    />
  )
}

/** Icon-only close button. Pass `aria-label`, or a `sr-only` label as children. */
function CloseButton({
  className,
  children,
  type = "button",
  size = "icon-sm",
  ...props
}: Omit<React.ComponentProps<typeof Button>, "variant">) {
  return (
    <Button
      data-slot="close-button"
      type={type}
      variant="ghost"
      size={size}
      className={cn(closeButtonClass, className)}
      {...props}
    >
      <CloseIcon />
      {children}
    </Button>
  )
}

export { CloseButton, CloseIcon, closeButtonClass }
