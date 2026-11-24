/** Spring settings for the rail dock. AGENTS.md §6 forbids spring bounce, so
 * every setting must be at least critically damped (damping ≥ 2√stiffness):
 * the control eases into its target without overshooting. */
export type DockSpring = { stiffness: number; damping: number }

export const dockSpring: DockSpring = { stiffness: 260, damping: 33 }
/** The AI control responds a little faster, still without overshoot. */
export const dockAiSpring: DockSpring = { stiffness: 300, damping: 35 }

export function dampingRatio({ stiffness, damping }: DockSpring) {
  return damping / (2 * Math.sqrt(stiffness))
}
