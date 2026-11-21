/* Solar by 480 Design. CC BY 4.0. https://www.shadcn.io/icon/solar-clock-circle-linear */
import type { SVGProps } from "react"

export function ClockCircleLinearIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      {...props}
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 8v4l2.5 2.5"
        />
      </g>
    </svg>
  )
}
