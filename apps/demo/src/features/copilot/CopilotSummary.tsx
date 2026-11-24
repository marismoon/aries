import { formatWan } from "@aries/ui/lib/format"
import { dashboardMetrics, issuedTrend } from "@/shared/mocks/overview"

import "./copilot-summary.css"
import { useUiText } from "@/lib/i18n/use-ui-text"

const trendMaximum = Math.max(...issuedTrend.map(({ amount }) => amount))

export function CopilotSummary({ questionId }: { questionId?: string | null }) {
  const tl = useUiText()

  if (questionId !== "growth" && questionId !== "summary") return null

  return (
    <div className="copilot-summary">
      {questionId === "summary" && (
        <dl
          className="copilot-summary-facts financial-number"
          aria-label={tl("运营总览快照")}
        >
          <div>
            <dt>{tl("CNY 已出账")}</dt>
            <dd>
              {formatWan(dashboardMetrics.issued)} {tl("万元")}
            </dd>
          </div>
          <div>
            <dt>{tl("CNY 暂估单列")}</dt>
            <dd>
              {formatWan(dashboardMetrics.estimated)} {tl("万元")}
            </dd>
          </div>
          <div>
            <dt>{tl("采集完成")}</dt>
            <dd>
              {tl("{{completed}} / {{total}} 个账号", {
                completed: dashboardMetrics.completed,
                total: dashboardMetrics.accountCount,
              })}
            </dd>
          </div>
        </dl>
      )}

      <figure className="copilot-summary-chart">
        <figcaption>
          <strong>{tl("近 6 月已出账")}</strong>
          <span>{tl("CNY · 万元")}</span>
        </figcaption>
        <dl className="copilot-summary-bars">
          {issuedTrend.map(({ month, amount }, index) => (
            <div
              key={month}
              title={tl("{{month}} · {{value}} 万元", {
                month,
                value: formatWan(amount),
              })}
            >
              <dt>{month}</dt>
              <dd>
                <span
                  className="copilot-summary-bar"
                  aria-hidden="true"
                  data-current={index === issuedTrend.length - 1 || undefined}
                  style={{ blockSize: `${(amount / trendMaximum) * 100}%` }}
                />
                <span className="sr-only">
                  {formatWan(amount)} {tl("万元")}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </figure>
    </div>
  )
}
