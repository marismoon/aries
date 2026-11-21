"use client"

import * as React from "react"
import { cn } from "cn"
import { useReducedMotion } from "motion/react"
import { div as MotionDiv } from "motion/react-m"
import { Dialog as DialogPrimitive } from "radix-ui"

import { AppIcon, SolarX } from "../icons"
import { dialogEntry, overlayEntry } from "../motion/motion-tokens"
import { Button } from "./button"
import { useUiLabels } from "../../lib/ui-labels"

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  children,
  instant = false,
  ...props
}: Omit<React.ComponentProps<typeof DialogPrimitive.Overlay>, "asChild"> & {
  instant?: boolean
}) {
  const reduceMotion = useReducedMotion()

  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      data-motion={instant ? "instant" : undefined}
      className={cn(
        "fixed inset-0 isolate z-50 bg-(--overlay) supports-backdrop-filter:backdrop-blur-sm",
        className
      )}
      {...props}
      asChild
    >
      <MotionDiv
        {...overlayEntry}
        initial={reduceMotion || instant ? false : overlayEntry.initial}
      >
        {children}
      </MotionDiv>
    </DialogPrimitive.Overlay>
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  instant = false,
  ...props
}: Omit<React.ComponentProps<typeof DialogPrimitive.Content>, "asChild"> & {
  showCloseButton?: boolean
  instant?: boolean
}) {
  const reduceMotion = useReducedMotion()
  const labels = useUiLabels()

  return (
    <DialogPortal>
      <DialogOverlay instant={instant} />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        data-motion={instant ? "instant" : undefined}
        className={cn(
          "fixed top-1/2 left-1/2 z-50 grid max-h-[calc(100dvh-2rem)] w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-5 overflow-y-auto overscroll-contain rounded-2xl border border-border bg-popover p-6 text-sm text-popover-foreground shadow-xl ring-1 ring-foreground/5 outline-none sm:max-w-md dark:ring-foreground/10",
          className
        )}
        {...props}
        asChild
      >
        <MotionDiv
          {...dialogEntry}
          initial={reduceMotion || instant ? false : dialogEntry.initial}
        >
          {children}
          {showCloseButton && (
            <DialogPrimitive.Close data-slot="dialog-close" asChild>
              <Button
                variant="ghost"
                className="absolute top-4 right-4 size-11 bg-secondary sm:size-9"
                size="icon-sm"
              >
                <AppIcon icon={SolarX} size={16} aria-hidden="true" />
                <span className="sr-only">{labels.close}</span>
              </Button>
            </DialogPrimitive.Close>
          )}
        </MotionDiv>
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-1.5", className)}
      {...props}
    />
  )
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean
}) {
  const labels = useUiLabels()
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close asChild>
          <Button variant="outline">{labels.close}</Button>
        </DialogPrimitive.Close>
      )}
    </div>
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        "font-heading text-base leading-none font-medium",
        className
      )}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        "text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
