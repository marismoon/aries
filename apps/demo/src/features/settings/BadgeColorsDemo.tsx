import { Badge, badgeTones } from "@aries/ui/ui/badge"
import { Example, ExampleWrapper } from "./examples/example"

const tones = Object.keys(badgeTones) as (keyof typeof badgeTones)[]

/** Ant Design preset colours as tag-style badges (soft) and solid badges. */
export function BadgeColorsDemo() {
  return (
    <ExampleWrapper>
      <Example title="Colors · 柔和（variant）">
        <div className="flex flex-wrap gap-2">
          {tones.map((tone) => (
            <Badge key={tone} variant={tone}>
              {tone}
            </Badge>
          ))}
        </div>
      </Example>
      <Example title="Colors · 实心（solid）">
        <div className="flex flex-wrap gap-2">
          {tones.map((tone) => (
            <Badge key={tone} variant={tone} solid>
              {tone}
            </Badge>
          ))}
        </div>
      </Example>
    </ExampleWrapper>
  )
}
