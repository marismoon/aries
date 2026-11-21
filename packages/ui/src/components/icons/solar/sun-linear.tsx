/* Solar by 480 Design. CC BY 4.0. https://www.shadcn.io/icon/solar-sun-linear */
import type { SVGProps } from "react"

export function SunLinearIcon(props: SVGProps<SVGSVGElement>) {
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
        <circle cx="12" cy="12" r="6" />
        <path
          strokeLinecap="round"
          d="M12 2v1m0 18v1m10-10h-1M3 12H2m17.07-7.07l-.392.393M5.322 18.678l-.393.393m14.141-.001l-.392-.393M5.322 5.322l-.393-.393"
        />
      </g>
    </svg>
  )
}
