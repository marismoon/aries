import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center text-sm font-medium whitespace-nowrap transition-[background-color,border-color,color,box-shadow,scale] duration-150 ease-(--ease-feedback) select-none disabled:pointer-events-none disabled:opacity-50 aria-invalid:shadow-[inset_0_0_0_1px_var(--destructive),var(--field-shadow)] motion-safe:active:not-aria-[haspopup]:scale-[0.97] [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Filled variants carry a faint top-lit sheen over the token fill
        // (styles/tokens.css); only the primary adds the glass rim and the
        // brand-tinted lift.
        default:
          "bg-primary bg-(image:--control-sheen) text-primary-foreground shadow-(--primary-shadow) hover:bg-(--primary-hover)",
        // Capsule look shared with the bills filters: a soft raised fill that
        // brightens on hover.
        outline:
          "bg-(--field-surface) text-foreground shadow-(--field-shadow) hover:bg-(--field-surface-hover) hover:text-foreground aria-expanded:bg-(--field-surface-hover)",
        secondary:
          "bg-secondary bg-(image:--control-sheen) text-secondary-foreground shadow-(--field-shadow) hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "bg-destructive/10 bg-(image:--control-sheen) text-destructive hover:bg-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-(--control-size) gap-2 px-3.5 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 [&_svg[data-icon]]:size-[1.125rem]",
        dense:
          "h-(--control-size-dense) gap-1.5 px-2.5 [&_svg[data-icon]]:size-4",
        // Small floating cards (small alert dialogs, popovers, toasts).
        small:
          "h-(--control-size-small) gap-1 px-2.5 text-xs pointer-coarse:h-10 [&_svg[data-icon]]:size-3.5",
        xs: "h-6 gap-1 px-2.5 text-xs has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 pointer-coarse:h-9",
        sm: "h-(--control-size-compact) gap-1.5 px-3 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg[data-icon]]:size-4",
        lg: "h-(--control-size-touch) gap-2 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3 [&_svg[data-icon]]:size-5",
        icon: "size-(--control-size-dense) [&_svg[data-icon]]:size-4",
        "icon-xs": "size-6 pointer-coarse:size-10 [&_svg[data-icon]]:size-3.5",
        "icon-sm": "size-7 pointer-coarse:size-10 [&_svg[data-icon]]:size-4",
        "icon-lg": "size-(--control-size) [&_svg[data-icon]]:size-[1.125rem]",
      },
      shape: {
        default: "rounded-lg",
        // A pill at every height: the 18px control radius only closes up to
        // 36px, which left the 40px+ sizes and icon-lg with squared corners.
        workspace: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "dense",
      shape: "workspace",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "dense",
  shape = "workspace",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, shape, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
