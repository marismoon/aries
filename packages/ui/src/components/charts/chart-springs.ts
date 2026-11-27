/** Keep each chart spring at or above critical damping, including non-unit masses. */
export function chartSpring(stiffness: number, damping = 0, mass = 1) {
  return {
    type: "spring" as const,
    stiffness,
    damping: Math.max(damping, 2 * Math.sqrt(stiffness * Math.max(1, mass))),
    mass,
  }
}

export const chartSprings = {
  gridRing: chartSpring(100),
  gridSpoke: chartSpring(80),
  highlight: chartSpring(180, 28),
  tooltip: chartSpring(300),
  segment: chartSpring(400),
  halo: chartSpring(420),
  swell: chartSpring(420, 32, 0.6),
  panelSize: chartSpring(500, 45),
  fallback: chartSpring(60, 20),
}

export function funnelRingSpring(index: number) {
  return chartSpring(Math.max(60, 300 - index * 60))
}
