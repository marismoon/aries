import { FrostCard } from "@marismoon/ui/shared/FrostCard"
import {
  collectionChannels,
  collectionStates,
  dashboardMetrics,
} from "@marismoon/core/mocks/overview"
import { demoPeriod } from "@marismoon/core/mocks/period"

import "./overview-metrics.css"
import { useUiText } from "@/lib/i18n/use-ui-text"

const currencyInfo = {
  CNY: { name: "人民币", symbol: "¥", tone: "success" },
  USD: { name: "美元", symbol: "$", tone: "brand" },
  EUR: { name: "欧元", symbol: "€", tone: "info" },
}

export function CollectionProgress() {
  const tl = useUiText()

  const { completed, accountCount } = dashboardMetrics
  const { processing, manual, parseSuccess } = collectionStates
  const month = Number(demoPeriod.slice(-2))
  const states = [
    { label: tl("已完成"), count: completed, tone: "complete" },
    { label: tl("解析中"), count: processing, tone: "processing" },
    { label: tl("待介入"), count: manual, tone: "intervention" },
  ] as const

  return (
    <FrostCard
      className="collection-progress"
      id="collection"
      role="region"
      aria-labelledby="collection-heading"
    >
      <header className="collection-heading">
        <h2 id="collection-heading">
          {tl("{{month}} 月采集与归档进度", { month })}
        </h2>
        <p>
          {tl("{{accountCount}} 个云账号 · 采集状态与币种分布", {
            accountCount,
          })}
        </p>
      </header>

      <div className="collection-alert">
        <strong className="financial-number">
          {tl("{{manual}} 个账号待介入", { manual })}
        </strong>
        <p className="financial-number">
          {tl("{{completed}} 个已完成 · {{processing}} 个解析中", {
            completed,
            processing,
          })}
        </p>
      </div>

      <div className="collection-distribution">
        <div className="collection-segments" aria-hidden="true">
          {states.map(({ tone, count }) => (
            <span key={tone} data-tone={tone} style={{ flexGrow: count }} />
          ))}
        </div>
        <ul className="collection-legend" aria-label={tl("云账号采集完成情况")}>
          {states.map(({ label, count, tone }) => (
            <li key={tone}>
              <i aria-hidden="true" data-tone={tone} />
              <span className="financial-number">
                {label} {count}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <ul className="collection-breakdown" aria-label={tl("币种与解析指标")}>
        {collectionChannels.map(({ currency, completed, total }) => {
          const { name, symbol, tone } = currencyInfo[currency]
          return (
            <li
              key={currency}
              className="collection-breakdown-row"
              data-tone={tone}
            >
              <span className="collection-icon" aria-hidden="true">
                {symbol}
              </span>
              <div className="collection-breakdown-copy">
                <strong>
                  {currency} · {tl(name)}
                </strong>
                <span className="financial-number">
                  {tl("{{completed}} / {{total}} 个账号", { completed, total })}
                </span>
              </div>
              <progress
                className="collection-bar"
                value={completed}
                max={total}
                aria-label={tl("{{currency}} 采集完成率", { currency })}
              />
            </li>
          )
        })}
        <li className="collection-breakdown-row" data-tone="brand">
          <span className="collection-icon" aria-hidden="true">
            {tl("解")}
          </span>
          <div className="collection-breakdown-copy">
            <strong>{tl("明细解析成功率")}</strong>
            <span className="financial-number">
              {tl("自动化解析 · {{parseSuccess}}%", { parseSuccess })}
            </span>
          </div>
          <progress
            className="collection-bar"
            value={parseSuccess}
            max={100}
            aria-label={tl("解析成功率")}
          />
        </li>
        <li className="collection-breakdown-row" data-tone="success">
          <span className="collection-icon" aria-hidden="true">
            {tl("总")}
          </span>
          <div className="collection-breakdown-copy">
            <strong>{tl("总体采集完成率")}</strong>
            <span className="financial-number">
              {tl("{{completed}} / {{total}} 个账号 ·", {
                completed,
                total: accountCount,
              })}{" "}
              {((completed / accountCount) * 100).toFixed(1)}%
            </span>
          </div>
          <progress
            className="collection-bar"
            value={completed}
            max={accountCount}
            aria-label={tl("云账号采集完成率")}
          />
        </li>
      </ul>
    </FrostCard>
  )
}
