import {
  AreaDemo,
  ColorBarDemo,
  LineDemo,
  PieDemo,
  RadarDemo,
  StackedBarDemo,
} from "./chart-demos"
import "./motion-demos.css"

/** Aries chart standard: the soft categorical palette, rounded marks, soft
 * tooltips, and click / legend interaction. Sits above the official example so
 * both can be compared; the examples below use the same palette here. */
export function ChartShowcase() {
  return (
    <div className="components-grid chart-showcase">
      <LineDemo />
      <AreaDemo />
      <ColorBarDemo />
      <StackedBarDemo />
      <PieDemo />
      <RadarDemo />
    </div>
  )
}
