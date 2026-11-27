import { describe, expect, it } from "vitest"
import { chartSpring, chartSprings, funnelRingSpring } from "./chart-springs"

describe("chart springs", () => {
  it("settles without oscillation for every preset and funnel layer", () => {
    for (const spring of [
      ...Object.values(chartSprings),
      ...Array.from({ length: 6 }, (_, i) => funnelRingSpring(i)),
    ]) {
      expect(spring.stiffness).toBeGreaterThan(0)
      expect(spring.damping).toBeGreaterThanOrEqual(
        2 * Math.sqrt(spring.stiffness * Math.max(spring.mass, 1))
      )
    }
  })

  it("preserves higher damping and accounts for mass", () => {
    expect(chartSpring(100, 32).damping).toBe(32)
    expect(chartSpring(100, 4, 4).damping).toBe(40)
  })
})
