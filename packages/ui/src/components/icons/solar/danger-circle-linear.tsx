/* Solar by 480 Design. CC BY 4.0. https://icon-sets.iconify.design/solar/danger-circle-linear/ */
import type { SVGProps } from "react"

export function DangerCircleLinearIcon(props: SVGProps<SVGSVGElement>) {
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
      <g
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 7V13" />
        <path d="M12 16H12.0001" />
      </g>
    </svg>
  )
}
