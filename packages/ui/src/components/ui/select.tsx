"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "cn"
import { Select as SelectPrimitive } from "radix-ui"

import { AppIcon, SolarChevronDown, SolarChevronUp } from "../icons"
import "./select.css"
import "./text-field.css"

const SelectPopperContext = React.createContext(false)

function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectGroup({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn("scroll-my-1.5 p-1", className)}
      {...props}
    />
  )
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

const triggerSizes = {
  // A pill at every height, like Button and Input.
  default: "h-(--control-size) rounded-full",
  dense: "h-(--control-size-dense) rounded-full",
  sm: "h-(--control-size-compact) rounded-full",
} as const

function SelectTrigger({
  className,
  size = "dense",
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: keyof typeof triggerSizes
}) {
  const dense = size === "dense"

  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      data-field-focus={dense ? "quiet" : undefined}
      className={cn(
        "flex w-fit min-w-0 items-center justify-between border px-3 whitespace-nowrap transition-[background-color,border-color,box-shadow] duration-150 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 data-placeholder:text-muted-foreground *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        dense
          ? "field-surface gap-1 border-transparent py-0 text-xs *:data-[slot=select-value]:font-[630]"
          : "gap-1.5 border-input bg-(--control) py-2 text-sm hover:border-ring focus-visible:border-ring aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        triggerSizes[size],
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <AppIcon
          icon={SolarChevronDown}
          size={dense ? 13 : 16}
          aria-hidden="true"
          className="pointer-events-none text-muted-foreground"
        />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  position: legacyPosition,
  alignItemWithTrigger = legacyPosition !== "popper",
  align,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content> & {
  alignItemWithTrigger?: boolean
}) {
  const popper = !alignItemWithTrigger
  const position = popper ? "popper" : "item-aligned"

  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        data-position={position}
        data-align-trigger={alignItemWithTrigger}
        className={cn(
          "relative z-50 max-h-(--radix-select-content-available-height) origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto bg-popover text-popover-foreground duration-150 ease-(--ease-feedback) data-[align-trigger=true]:animate-none data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:duration-100 data-closed:fade-out-0",
          popper
            ? "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1"
            : "min-w-36 rounded-2xl shadow-lg ring-1 ring-foreground/5 dark:ring-foreground/10 data-open:zoom-in-98 data-closed:zoom-out-98",
          className
        )}
        position={position}
        align={align ?? (popper ? "start" : "center")}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          data-position={position}
          className={popper ? "w-full min-w-0 p-1" : undefined}
        >
          <SelectPopperContext value={popper}>{children}</SelectPopperContext>
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("px-2 py-1 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

function SelectItemTooltip({
  anchor,
  text,
}: {
  anchor: React.RefObject<HTMLSpanElement | null>
  text: string
}) {
  const tooltip = React.useRef<HTMLSpanElement>(null)

  React.useLayoutEffect(() => {
    const option = anchor.current?.parentElement
    const content = tooltip.current
    if (!option || !content) return

    const place = () => {
      const { left, right, top, bottom, height } =
        option.getBoundingClientRect()
      const { offsetWidth, offsetHeight } = content
      const edge = 8
      const width = document.documentElement.clientWidth
      const maxLeft = width - offsetWidth - edge
      let x = right + edge
      let y = top + (height - offsetHeight) / 2

      if (x > maxLeft) {
        x = left - offsetWidth - edge
        if (x < edge) {
          x = Math.min(left, maxLeft)
          y = bottom + edge
          if (y + offsetHeight + edge > window.innerHeight) {
            y = top - offsetHeight - edge
          }
        }
      }

      content.style.left = `${Math.max(edge, x)}px`
      content.style.top = `${Math.max(
        edge,
        Math.min(y, window.innerHeight - offsetHeight - edge)
      )}px`
    }

    place()
    window.addEventListener("resize", place)
    window.addEventListener("scroll", place, true)
    return () => {
      window.removeEventListener("resize", place)
      window.removeEventListener("scroll", place, true)
    }
  }, [anchor, text])

  // The read-only preview floats above the listbox without a dismissal layer.
  return createPortal(
    <span
      ref={tooltip}
      role="tooltip"
      data-slot="select-item-tooltip"
      className="pointer-events-none fixed z-[60] w-max max-w-[min(18rem,calc(100vw-16px))] rounded-xl bg-foreground px-3 py-1.5 text-xs wrap-anywhere text-background"
    >
      {text}
    </span>,
    document.body
  )
}

function SelectItem({
  className,
  children,
  count,
  title,
  "aria-describedby": describedBy,
  onFocus,
  onBlur,
  onPointerMove,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item> & { count?: number }) {
  const popper = React.useContext(SelectPopperContext)
  const clip = React.useRef<HTMLSpanElement>(null)
  const countId = React.useId()
  const [overflowText, setOverflowText] = React.useState("")
  const [keyboardFocus, setKeyboardFocus] = React.useState(false)
  const hasCount = popper && count !== undefined

  React.useLayoutEffect(() => {
    const viewport = clip.current
    if (!viewport) return

    const measure = () => {
      const overflow = viewport.scrollWidth - viewport.clientWidth
      const overflowing = viewport.clientWidth > 0 && overflow > 0
      viewport.style.setProperty("--select-overflow", `${overflow}px`)
      // About 45px per second, so long names stay readable while scrolling.
      viewport.style.setProperty(
        "--select-scroll-duration",
        `${Math.max(0.4, overflow / 45).toFixed(2)}s`
      )
      setOverflowText(overflowing ? (viewport.textContent ?? "") : "")
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(viewport)
    void document.fonts.ready.then(() => {
      if (viewport.isConnected) measure()
    })
    return () => observer.disconnect()
  }, [children, popper])

  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      data-popper={popper || undefined}
      className={cn(
        "relative w-full cursor-default items-center py-1.5 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        popper
          ? "grid min-h-6 grid-cols-[minmax(0,1fr)_auto] px-2.5 py-0.5 text-[0.8125rem]"
          : "flex min-h-7 gap-2 rounded-xl pr-2 pl-2 focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className
      )}
      aria-describedby={
        hasCount
          ? [describedBy, countId].filter(Boolean).join(" ")
          : describedBy
      }
      title={title ?? (overflowText || undefined)}
      onFocus={(event) => {
        onFocus?.(event)
        if (popper) {
          setKeyboardFocus(event.currentTarget.matches(":focus-visible"))
        }
      }}
      onBlur={(event) => {
        onBlur?.(event)
        setKeyboardFocus(false)
      }}
      onPointerMove={(event) => {
        onPointerMove?.(event)
        if (event.pointerType === "mouse") setKeyboardFocus(false)
      }}
      {...props}
    >
      {popper ? (
        <SelectPrimitive.ItemText
          ref={clip}
          data-slot="select-item-text"
          data-overflowing={Boolean(overflowText) || undefined}
        >
          <span data-slot="select-item-label">{children}</span>
        </SelectPrimitive.ItemText>
      ) : (
        <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      )}
      {hasCount && (
        <span
          id={countId}
          data-slot="select-item-count"
          className="col-start-2 row-start-1 text-right text-xs text-muted-foreground tabular-nums"
        >
          {count}
        </span>
      )}
      {keyboardFocus && overflowText && (
        <SelectItemTooltip anchor={clip} text={overflowText} />
      )}
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("pointer-events-none -mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "z-10 flex cursor-default items-center justify-center bg-popover py-1",
        className
      )}
      {...props}
    >
      <AppIcon icon={SolarChevronUp} size={16} aria-hidden="true" />
    </SelectPrimitive.ScrollUpButton>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "z-10 flex cursor-default items-center justify-center bg-popover py-1",
        className
      )}
      {...props}
    >
      <AppIcon icon={SolarChevronDown} size={16} aria-hidden="true" />
    </SelectPrimitive.ScrollDownButton>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
