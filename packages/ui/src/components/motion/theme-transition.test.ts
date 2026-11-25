import { describe, expect, it } from "vitest"

import { revealProperties, revealRadius, themeReveal } from "./theme-transition"

describe("theme reveal", () => {
  it("covers the farthest viewport corner from the origin", () => {
    const viewport = { width: 1440, height: 900 }
    expect(revealRadius({ x: 1400, y: 24 }, viewport)).toBeCloseTo(
      Math.hypot(1400, 876)
    )
    expect(revealRadius({ x: 720, y: 450 }, viewport)).toBeCloseTo(
      Math.hypot(720, 450)
    )
  })

  it("passes the origin and a whole-pixel radius to the CSS keyframes", () => {
    expect(revealProperties({ x: 10, y: 20 }, 299.2)).toEqual({
      "--theme-reveal-x": "10px",
      "--theme-reveal-y": "20px",
      "--theme-reveal-r": "300px",
    })
  })

  it("stays within the large-surface range without overshoot", () => {
    expect(themeReveal.duration).toBeGreaterThanOrEqual(150)
    expect(themeReveal.duration).toBeLessThanOrEqual(500)
    // Bezier y-control points within [0, 1] cannot overshoot.
    const [, y1, , y2] = themeReveal.easing
      .slice("cubic-bezier(".length, -1)
      .split(",")
      .map(Number)
    expect(y1).toBeGreaterThanOrEqual(0)
    expect(y2).toBeLessThanOrEqual(1)
  })
})
