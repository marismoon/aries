import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"

// Ant Design preset colours (base tone of each hue). Tag-style: a tinted fill, a
// soft border and a deepened label, so every tone stays legible on glass.
const tones = {
  red: "#f5222d",
  volcano: "#fa541c",
  orange: "#fa8c16",
  gold: "#faad14",
  yellow: "#d4b106",
  lime: "#7cb305",
  green: "#52c41a",
  cyan: "#13c2c2",
  blue: "#1677ff",
  geekblue: "#2f54eb",
  purple: "#722ed1",
  magenta: "#eb2f96",
  gray: "#8c8c8c",
} as const

const toneBase =
  "border-[color-mix(in_srgb,var(--tone)_30%,transparent)] bg-[color-mix(in_srgb,var(--tone)_11%,transparent)] text-[color-mix(in_srgb,var(--tone)_80%,black)] dark:border-[color-mix(in_srgb,var(--tone)_36%,transparent)] dark:bg-[color-mix(in_srgb,var(--tone)_20%,transparent)] dark:text-[color-mix(in_srgb,var(--tone)_72%,white)] data-[solid=true]:border-transparent data-[solid=true]:bg-(--tone) data-[solid=true]:text-white"

const toneVariants = Object.fromEntries(
  Object.keys(tones).map((name) => [
    name,
    // The colour itself is set inline (--tone): Tailwind cannot see class
    // names built at runtime.
    toneBase,
  ])
) as Record<keyof typeof tones, string>

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-[color,background-color,border-color] duration-150 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg[data-icon]]:size-3 [&>svg]:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
        outline:
          "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost:
          "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
        ...toneVariants,
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  solid = false,
  style,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean; solid?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      data-solid={solid || undefined}
      className={cn(badgeVariants({ variant }), className)}
      style={
        variant && variant in tones
          ? ({
              "--tone": tones[variant as keyof typeof tones],
              ...style,
            } as React.CSSProperties)
          : style
      }
      {...props}
    />
  )
}

export { Badge, badgeVariants, tones as badgeTones }
