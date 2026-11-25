"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { useReducedMotion } from "motion/react"
import { span as MotionSpan } from "motion/react-m"
import { Tabs as TabsPrimitive } from "radix-ui"
import { flushSync } from "react-dom"

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn(
        "group/tabs flex gap-2 data-horizontal:flex-col",
        className
      )}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  "group/tabs-list relative inline-flex w-fit items-center justify-center rounded-full p-[3px] text-muted-foreground group-data-horizontal/tabs:h-[34px] group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col group-data-vertical/tabs:p-1 data-[variant=line]:rounded-none pointer-coarse:group-data-horizontal/tabs:h-11",
  {
    variants: {
      variant: {
        default: "bg-(--recess)",
        line: "gap-1 bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

type GlideRect = { x: number; y: number; width: number; height: number }
type GlideLook = { background: string; boxShadow: string; borderRadius: string }
type Glide = { key: number; from: GlideRect; to: GlideRect; look: GlideLook }

const glideTween = { duration: 0.22, ease: [0.23, 1, 0.32, 1] } as const
const activeTrigger = ':scope > [data-slot="tabs-trigger"][data-state="active"]'

const rectOf = (element: HTMLElement): GlideRect => ({
  x: element.offsetLeft,
  y: element.offsetTop,
  width: element.offsetWidth,
  height: element.offsetHeight,
})

/**
 * When the selected tab changes, a ghost pill carrying the active tab's own
 * look (whatever page or shell CSS gives it) slides from the old tab to the
 * new one; while it moves, `data-gliding` on the list hides the triggers'
 * fills (motion.css). At rest nothing is added, so every existing tab style
 * stays exactly as it was. The look is read on pointerdown / keydown, before
 * Radix switches tabs and before any colour transition starts.
 */
function useTabGlide(list: HTMLElement | null) {
  const [glide, setGlide] = React.useState<Glide | null>(null)
  const reduced = useReducedMotion()

  React.useLayoutEffect(() => {
    if (!list || reduced) return
    let current = list.querySelector<HTMLElement>(activeTrigger)
    let currentRect = current ? rectOf(current) : null
    let look: GlideLook | null = null
    let key = 0

    const readLook = () => {
      const active = list.querySelector<HTMLElement>(activeTrigger)
      if (!active || list.dataset.gliding !== undefined) return
      const style = getComputedStyle(active)
      look = {
        background: style.backgroundColor,
        boxShadow: style.boxShadow,
        borderRadius: style.borderRadius,
      }
      currentRect = rectOf(active)
    }
    readLook()

    const observer = new MutationObserver(() => {
      const next = list.querySelector<HTMLElement>(activeTrigger)
      if (!next || next === current) return
      current = next
      const from = currentRect
      const to = rectOf(next)
      currentRect = to
      if (!from || !look) return
      list.dataset.gliding = ""
      const glideLook = look
      flushSync(() => setGlide({ key: ++key, from, to, look: glideLook }))
    })
    observer.observe(list, {
      subtree: true,
      attributes: true,
      attributeFilter: ["data-state"],
    })
    list.addEventListener("pointerdown", readLook, true)
    list.addEventListener("keydown", readLook, true)
    return () => {
      observer.disconnect()
      list.removeEventListener("pointerdown", readLook, true)
      list.removeEventListener("keydown", readLook, true)
      delete list.dataset.gliding
    }
  }, [list, reduced])

  const finish = React.useCallback(() => {
    list?.removeAttribute("data-gliding")
    setGlide(null)
  }, [list])

  // Animation frames pause in background tabs; never leave the triggers
  // without their fill because the ghost could not land.
  React.useEffect(() => {
    if (!glide) return
    const timeout = setTimeout(finish, glideTween.duration * 1000 + 120)
    return () => clearTimeout(timeout)
  }, [glide, finish])

  return { glide, finish }
}

function TabsList({
  className,
  variant = "default",
  children,
  ref,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>) {
  const [list, setList] = React.useState<HTMLDivElement | null>(null)
  const { glide, finish } = useTabGlide(variant === "default" ? list : null)
  const setRefs = React.useCallback(
    (node: HTMLDivElement | null) => {
      setList(node)
      if (typeof ref === "function") ref(node)
      else if (ref) ref.current = node
    },
    [ref]
  )

  return (
    <TabsPrimitive.List
      ref={setRefs}
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    >
      {glide && (
        <MotionSpan
          key={glide.key}
          aria-hidden="true"
          data-slot="tabs-glide"
          className="pointer-events-none absolute top-0 left-0"
          style={glide.look}
          initial={glide.from}
          animate={glide.to}
          transition={glideTween}
          onAnimationComplete={finish}
        />
      )}
      {children}
    </TabsPrimitive.List>
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-full border border-transparent! px-3 py-0.5 text-xs font-[620] whitespace-nowrap text-foreground/60 transition-[background-color,color,box-shadow] duration-150 group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start group-data-vertical/tabs:px-3 group-data-vertical/tabs:py-0.5 hover:bg-(--sidebar-item-hover) hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 dark:text-muted-foreground dark:hover:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0",
        "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent dark:group-data-[variant=line]/tabs-list:data-active:border-transparent dark:group-data-[variant=line]/tabs-list:data-active:bg-transparent",
        "data-active:bg-[var(--item-selected,var(--layout-control))] data-active:text-foreground data-active:hover:bg-[var(--item-selected,var(--layout-control))] dark:data-active:border-input dark:data-active:bg-input/30 dark:data-active:text-foreground",
        "after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:bottom-[-5px] group-data-horizontal/tabs:after:h-0.5 group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:-right-1 group-data-vertical/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-active:after:opacity-100",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 text-sm", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
