"use client"

import * as React from "react"
import { type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui"

import { toggleVariants } from "./toggle"

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants> & {
    spacing?: number
    orientation?: "horizontal" | "vertical"
  }
>({
  size: "default",
  variant: "default",
  spacing: 2,
  orientation: "horizontal",
})

function ToggleGroup({
  className,
  variant,
  size,
  spacing = 2,
  orientation = "horizontal",
  children,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleVariants> & {
    spacing?: number
    orientation?: "horizontal" | "vertical"
  }) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      data-spacing={spacing}
      data-orientation={orientation}
      style={{ "--gap": spacing } as React.CSSProperties}
      className={cn(
        // Segmented capsule, the same look as the 近期动态 view switch.
        "group/toggle-group flex w-fit flex-row items-center gap-0.5 rounded-full bg-(--recess) p-[3px] data-vertical:flex-col data-vertical:items-stretch data-vertical:rounded-(--radius-control)",
        className
      )}
      {...props}
    >
      <ToggleGroupContext.Provider
        value={{ variant, size, spacing, orientation }}
      >
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  )
}

function ToggleGroupItem({
  className,
  children,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> &
  VariantProps<typeof toggleVariants>) {
  const context = React.useContext(ToggleGroupContext)

  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      data-variant={context.variant || variant}
      data-size={context.size || size}
      data-spacing={context.spacing}
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        "h-7 min-w-7 shrink-0 rounded-full bg-transparent px-3 text-xs font-[620] text-muted-foreground shadow-none hover:bg-[var(--item-hover,transparent)] hover:text-foreground focus-visible:z-10 aria-pressed:bg-[var(--item-selected,var(--layout-control))] aria-pressed:text-foreground aria-pressed:hover:bg-[var(--item-selected,var(--layout-control))] data-[state=on]:bg-[var(--item-selected,var(--layout-control))] data-[state=on]:text-foreground data-[state=on]:hover:bg-[var(--item-selected,var(--layout-control))] pointer-coarse:h-10 pointer-coarse:min-w-10",
        className
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  )
}

export { ToggleGroup, ToggleGroupItem }
