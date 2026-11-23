import type { ComponentProps } from "react"

/** The official examples are written for Next.js; these keep them portable. */
export function Link({
  href,
  ...props
}: ComponentProps<"a"> & { href: string }) {
  return <a href={href} {...props} />
}

export function Image({
  alt,
  fill: _fill,
  priority: _priority,
  ...props
}: ComponentProps<"img"> & { fill?: boolean; priority?: boolean }) {
  return <img alt={alt} {...props} />
}
