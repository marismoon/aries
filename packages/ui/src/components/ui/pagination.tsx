import type { ComponentProps } from "react"
import { cn } from "cn"

import {
  AppIcon,
  SolarChevronLeft,
  SolarChevronRight,
  SolarEllipsis,
} from "../icons"
import { Button } from "./button"
import { useUiLabels } from "../../lib/ui-labels"

function Pagination({ className, ...props }: ComponentProps<"nav">) {
  return (
    <nav
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  )
}

function PaginationContent({ className, ...props }: ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex items-center gap-1", className)}
      {...props}
    />
  )
}

function PaginationItem(props: ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = {
  isActive?: boolean
  href?: string
} & Pick<ComponentProps<typeof Button>, "size"> &
  Omit<ComponentProps<typeof Button>, "size" | "variant">

function PaginationLink({
  className,
  isActive,
  size = "icon",
  href,
  children,
  ...props
}: PaginationLinkProps) {
  const classes = cn(
    // The current page uses the same raised capsule as the page-size select.
    isActive
      ? "bg-[var(--item-selected,var(--field-surface))] shadow-(--field-shadow) hover:bg-[var(--item-selected,var(--field-surface-hover))]"
      : // Page numbers, previous and next share one hover: the same raised capsule.
        "hover:bg-[var(--item-hover,var(--field-surface))] hover:text-foreground hover:shadow-(--field-shadow)",
    className
  )
  const common = {
    variant: isActive ? ("outline" as const) : ("ghost" as const),
    size,
    "data-slot": "pagination-link",
    "data-active": isActive || undefined,
    className: classes,
  }

  // Official markup renders an anchor; the table uses real buttons.
  if (href !== undefined) {
    return (
      <Button asChild {...common}>
        <a href={href} aria-current={isActive ? "page" : undefined}>
          {children}
        </a>
      </Button>
    )
  }

  return (
    <Button
      type="button"
      aria-current={isActive ? "page" : undefined}
      {...common}
      {...props}
    >
      {children}
    </Button>
  )
}

function PaginationPrevious({
  className,
  children,
  ...props
}: ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      size="default"
      className={cn("pl-1.5!", className)}
      {...props}
    >
      <AppIcon icon={SolarChevronLeft} data-icon="inline-start" />
      <span className="hidden sm:block">{children}</span>
    </PaginationLink>
  )
}

function PaginationNext({
  className,
  children,
  ...props
}: ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      size="default"
      className={cn("pr-1.5!", className)}
      {...props}
    >
      <span className="hidden sm:block">{children}</span>
      <AppIcon icon={SolarChevronRight} data-icon="inline-end" />
    </PaginationLink>
  )
}

function PaginationEllipsis({ className, ...props }: ComponentProps<"span">) {
  const labels = useUiLabels()
  return (
    <span
      data-slot="pagination-ellipsis"
      className={cn(
        "flex size-(--control-size) items-center justify-center text-muted-foreground",
        className
      )}
      {...props}
    >
      <AppIcon
        icon={SolarEllipsis}
        fill="currentColor"
        stroke="none"
        aria-hidden="true"
      />
      <span className="sr-only">{labels.morePages}</span>
    </span>
  )
}

/**
 * Page numbers to render: always the first and last page, the current page
 * with one neighbour on each side, and "ellipsis" for the gaps. At most seven
 * entries, so the control keeps a stable width while paging.
 */
function getPaginationRange(
  current: number,
  total: number
): (number | "ellipsis")[] {
  if (total <= 5) return Array.from({ length: total }, (_, index) => index + 1)
  if (current <= 3) return [1, 2, 3, 4, "ellipsis", total]
  if (current >= total - 2) {
    return [1, "ellipsis", total - 3, total - 2, total - 1, total]
  }
  return [1, "ellipsis", current - 1, current, current + 1, "ellipsis", total]
}

export {
  getPaginationRange,
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}
