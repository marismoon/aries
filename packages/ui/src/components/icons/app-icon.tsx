import { createElement, type ComponentType, type SVGProps } from "react"

import { boldIconOf } from "./icon-variants"

export type AppIconComponent = ComponentType<SVGProps<SVGSVGElement>>

type AppIconProps = SVGProps<SVGSVGElement> & {
  icon: AppIconComponent
  size?: number
  /**
   * For icons inside a control with a selected state. Renders the Linear icon
   * and, when one exists, its Bold counterpart; `styles/icon-states.css` shows
   * Bold on hover or when the control is selected. Decorative icons only.
   */
  stateful?: boolean
}

export function AppIcon({
  icon: Icon,
  size = 20,
  width = size,
  height = size,
  focusable = false,
  stateful = false,
  "aria-hidden": ariaHidden,
  ...props
}: AppIconProps) {
  const hasLabel = Boolean(props["aria-label"] || props["aria-labelledby"])
  const Bold = stateful && !hasLabel ? boldIconOf(Icon) : undefined

  const icon = (
    <Icon
      data-app-icon="solar"
      data-icon-variant={Bold ? "linear" : undefined}
      {...props}
      width={width}
      height={height}
      focusable={focusable}
      aria-hidden={ariaHidden ?? (hasLabel ? undefined : true)}
      role={props.role ?? (hasLabel ? "img" : undefined)}
    />
  )

  if (!Bold) return icon

  const boldProps: SVGProps<SVGSVGElement> & Record<`data-${string}`, string> =
    {
      "data-app-icon": "solar",
      "data-icon-variant": "bold",
      ...props,
      width,
      height,
      focusable,
      "aria-hidden": true,
    }

  return (
    <>
      {icon}
      {createElement(Bold, boldProps)}
    </>
  )
}
