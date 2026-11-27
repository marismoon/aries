import {
  BklitAreaDemo,
  BklitBarDemo,
  BklitComposedDemo,
  BklitFunnelDemo,
  BklitHeatmapDemo,
  BklitLineDemo,
  BklitLiveLineDemo,
  BklitLollipopDemo,
  BklitPieDemo,
  BklitRadarDemo,
  BklitRingDemo,
  BklitSparklineDemo,
  BklitSparklineKpiCardsDemo,
  BklitStackedBarDemo,
} from "./bklit-chart-demos"

/** Aries chart standard: Bklit UI charts mapped to Aries theme tokens. */
export function ChartShowcase() {
  return (
    <div className="components-grid chart-showcase">
      <div className="components-grid col-span-full auto-rows-fr">
        <BklitLineDemo />
        <BklitAreaDemo />
        <BklitBarDemo />
        <BklitStackedBarDemo />
        <BklitComposedDemo />
        <BklitPieDemo />
        <BklitRingDemo />
        <BklitRadarDemo />
        <BklitFunnelDemo />
        <BklitLollipopDemo />
        <BklitHeatmapDemo />
        <BklitSparklineDemo />
      </div>
      <BklitSparklineKpiCardsDemo />
      <BklitLiveLineDemo />
    </div>
  )
}
