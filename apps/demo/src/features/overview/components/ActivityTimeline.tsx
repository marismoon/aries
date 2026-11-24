import { useState, type CSSProperties } from "react"

import { FrostCard } from "@marismoon/ui/shared/FrostCard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@marismoon/ui/ui/tabs"
import { formatActivityTime, formatWan } from "@marismoon/ui/lib/format"
import { defaultActivity, issuedTrend } from "@/shared/mocks/overview"
import type { ActivityEvent } from "@/shared/types/overview"

import "./overview-workflow.css"
import { useUiText } from "@/lib/i18n/use-ui-text"

const chartMax =
  Math.ceil(Math.max(...issuedTrend.map(({ amount }) => amount)) / 500_000) *
  500_000
const ticks = [chartMax, 0]

export function ActivityTimeline({
  addedActivities,
}: {
  addedActivities: readonly ActivityEvent[]
}) {
  const tl = useUiText()

  const events = [...addedActivities, ...defaultActivity]
  const [view, setView] = useState("timeline")

  return (
    <FrostCard className="workflow-card activity-card">
      <Tabs value={view} onValueChange={setView} className="activity-tabs">
        <header className="workflow-header">
          <div>
            <h2>{tl("近期动态")}</h2>
            <p>
              {view === "trend"
                ? tl("近 6 个月月度出账统计")
                : tl("出账、采集与待办处理 · 最近 {{length}} 条", {
                    length: events.length,
                  })}
            </p>
          </div>
          <TabsList
            className="activity-toolbar"
            aria-label={tl("近期动态视图")}
          >
            <TabsTrigger value="timeline">{tl("时间线")}</TabsTrigger>
            <TabsTrigger value="trend">{tl("近 6 个月")}</TabsTrigger>
          </TabsList>
        </header>

        <TabsContent value="timeline" className="activity-viewport">
          <ol
            className="activity-list"
            style={{ "--activity-count": events.length } as CSSProperties}
          >
            {events.map((event) => (
              <li key={event.id}>
                <time
                  className="activity-time financial-number"
                  dateTime={event.time}
                >
                  <span
                    className="activity-dot"
                    data-tone={event.tone}
                    aria-hidden="true"
                  />
                  {formatActivityTime(event.time)}
                </time>
                <div className="activity-copy">
                  <h3>{tl.parts(event.title)}</h3>
                  <p>{tl.parts(event.description)}</p>
                </div>
              </li>
            ))}
          </ol>
        </TabsContent>

        <TabsContent value="trend" className="activity-viewport">
          <figure className="activity-chart">
            <figcaption>{tl("出账金额（CNY 万元）")}</figcaption>
            <div className="activity-chart-grid">
              <div
                className="activity-chart-ticks financial-number"
                aria-hidden="true"
              >
                {ticks.map((tick) => (
                  <span key={tick}>{formatWan(tick)}</span>
                ))}
              </div>
              <ol
                className="activity-chart-bars"
                aria-label={tl("每月出账金额")}
              >
                {issuedTrend.map(({ month, amount }) => (
                  <li key={month}>
                    <span className="activity-chart-amount financial-number">
                      {formatWan(amount)}
                      <span className="sr-only"> {tl("万元")}</span>
                    </span>
                    <div className="activity-chart-column" aria-hidden="true">
                      <div
                        className="activity-chart-bar"
                        style={{ height: `${(amount / chartMax) * 100}%` }}
                      />
                    </div>
                    <span className="activity-chart-month">{tl(month)}</span>
                  </li>
                ))}
              </ol>
            </div>
          </figure>
        </TabsContent>
      </Tabs>
    </FrostCard>
  )
}
