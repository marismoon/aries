import { span as MotionSpan } from "motion/react-m"
import { useEffect, useState, type ComponentProps, type ReactNode } from "react"

import { cn } from "../../lib/utils"
import { useUiLabels } from "../../lib/ui-labels"
import { AppIcon, SolarCheckmark, SolarCopy } from "../icons"
import { Button } from "../ui/button"

/** How long the "copied" state stays before the button settles back. */
export const copiedHoldMs = 1800

const swap = { duration: 0.16, ease: [0.23, 1, 0.32, 1] } as const

/** Both states stay mounted in one grid cell, so the button never changes
 * width; only opacity, scale and blur move (no layout animation). */
function Swap({
  on,
  idle,
  done,
  className,
}: {
  on: boolean
  idle: ReactNode
  done: ReactNode
  className?: string
}) {
  return (
    <span className={cn("grid *:col-start-1 *:row-start-1", className)}>
      <MotionSpan
        className="grid place-items-center"
        aria-hidden={on || undefined}
        initial={false}
        animate={
          on
            ? { opacity: 0, scale: 0.6, filter: "blur(2px)" }
            : { opacity: 1, scale: 1, filter: "blur(0px)" }
        }
        transition={swap}
      >
        {idle}
      </MotionSpan>
      <MotionSpan
        className="grid place-items-center"
        aria-hidden={!on || undefined}
        initial={false}
        animate={
          on
            ? { opacity: 1, scale: 1, filter: "blur(0px)" }
            : { opacity: 0, scale: 0.6, filter: "blur(2px)" }
        }
        transition={swap}
      >
        {done}
      </MotionSpan>
    </span>
  )
}

export type CopyButtonProps = Omit<
  ComponentProps<typeof Button>,
  "children" | "onClick" | "value"
> & {
  /** Text written to the clipboard. */
  value: string
  /** Visible label; omit for an icon-only button (then `aria-label` is set
   * from the labels). */
  label?: string
  onCopied?: () => void
  onError?: () => void
  /** Announce "已复制" in a polite live region. Turn off when the host
   * already announces the result. */
  announce?: boolean
}

/**
 * Copies `value` and confirms in place: the copy icon turns into a success
 * check and the label into "已复制", then both settle back after
 * {@link copiedHoldMs}. Uses `m.*` components, so render inside `LazyMotion`.
 */
export function CopyButton({
  value,
  label,
  onCopied,
  onError,
  announce = true,
  className,
  variant = "outline",
  ...props
}: CopyButtonProps) {
  const labels = useUiLabels()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timeout = setTimeout(() => setCopied(false), copiedHoldMs)
    return () => clearTimeout(timeout)
  }, [copied])

  const icon = (
    <Swap
      on={copied}
      className="shrink-0"
      idle={<AppIcon icon={SolarCopy} data-icon="inline-start" aria-hidden />}
      done={
        <AppIcon
          icon={SolarCheckmark}
          data-icon="inline-start"
          className="text-(--success)"
          aria-hidden
        />
      }
    />
  )

  return (
    <>
      <Button
        type="button"
        variant={variant}
        data-copied={copied || undefined}
        aria-label={label ? undefined : copied ? labels.copied : labels.copy}
        className={className}
        onClick={() => {
          navigator.clipboard
            .writeText(value)
            .then(() => {
              setCopied(true)
              onCopied?.()
            })
            .catch(() => onError?.())
        }}
        {...props}
      >
        {icon}
        {label && (
          <Swap
            on={copied}
            className="justify-items-start"
            idle={label}
            done={labels.copied}
          />
        )}
      </Button>
      {announce && (
        <span aria-live="polite" className="sr-only">
          {copied ? labels.copied : ""}
        </span>
      )}
    </>
  )
}
