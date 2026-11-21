import type { ComponentProps } from "react"
import { cn } from "cn"
import { Checkbox as CheckboxPrimitive } from "radix-ui"

import { AppIcon, SolarCheck } from "../icons"

function Checkbox({
  className,
  ...props
}: ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer relative inline-flex size-4 shrink-0 items-center justify-center rounded-[5px] border border-input bg-(--field-surface) align-middle transition-colors after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:outline-offset-1 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground enabled:data-[state=unchecked]:hover:bg-(--field-surface-hover) pointer-coarse:after:-inset-y-3",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current data-[state=indeterminate]:before:block data-[state=indeterminate]:before:h-0.5 data-[state=indeterminate]:before:w-2 data-[state=indeterminate]:before:rounded-full data-[state=indeterminate]:before:bg-current data-[state=indeterminate]:[&>svg]:hidden"
      >
        <AppIcon
          icon={SolarCheck}
          size={14}
          viewBox="7 7 10 10"
          className="[&_circle]:hidden"
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
