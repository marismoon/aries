import type { ComponentProps } from "react"
import { cn } from "cn"

/** Grid that lays out the official examples of one component. */
export function ExampleWrapper({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="example-wrapper"
      className={cn(
        "grid w-full min-w-0 items-start gap-3 md:grid-cols-2",
        className
      )}
      {...props}
    />
  )
}

/** One titled example, set on a Marismoon glass card. */
export function Example({
  title,
  children,
  className,
  containerClassName,
  ...props
}: ComponentProps<"div"> & { title?: string; containerClassName?: string }) {
  return (
    <div
      data-slot="example"
      className={cn(
        "flex min-w-0 flex-col gap-1 self-stretch",
        containerClassName
      )}
      {...props}
    >
      {title && (
        <div className="px-1.5 pt-1 text-xs font-medium text-muted-foreground">
          {title}
        </div>
      )}
      <div
        data-slot="example-content"
        className={cn(
          "surface flex min-w-0 flex-1 flex-col items-start gap-5 p-5 text-foreground *:[div:not([class*='w-'])]:w-full",
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}
