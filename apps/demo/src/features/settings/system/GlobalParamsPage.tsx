import { useState, type FormEvent } from "react"
import { toast } from "sonner"

import {
  AppIcon,
  SolarCloud,
  SolarCog,
  SolarDownload,
} from "@marismoon/ui/icons"
import { FrostCard } from "@marismoon/ui/shared/FrostCard"
import { Button } from "@marismoon/ui/ui/button"
import { Input } from "@marismoon/ui/ui/input"
import { Switch } from "@marismoon/ui/ui/switch"
import { useUiText } from "@/lib/i18n/use-ui-text"
import {
  useWorkspaceStore,
  workspaceActions,
} from "@/shared/mocks/workspace-store"

import "../basic-info/basic-info.css"

export function GlobalParamsPage() {
  const tl = useUiText()
  const { globalParams } = useWorkspaceStore()

  const [concurrency, setConcurrency] = useState(
    String(globalParams.collectionConcurrency)
  )
  const [retries, setRetries] = useState(String(globalParams.collectionRetries))
  const [timeoutSec, setTimeoutSec] = useState(
    String(globalParams.collectionTimeoutSec)
  )

  const [exportLimit, setExportLimit] = useState(
    String(globalParams.exportRowLimit)
  )
  const [watermark, setWatermark] = useState(globalParams.exportWatermark)

  const [apiRate, setApiRate] = useState(
    String(globalParams.apiRateLimitPerMin)
  )
  const [webhookTimeout, setWebhookTimeout] = useState(
    String(globalParams.webhookTimeoutSec)
  )
  const [strictSchema, setStrictSchema] = useState(
    globalParams.strictSchemaCheck
  )

  function saveCollection(event: FormEvent) {
    event.preventDefault()
    workspaceActions.saveGlobalParams(
      {
        collectionConcurrency: Number(concurrency) || 8,
        collectionRetries: Number(retries) || 3,
        collectionTimeoutSec: Number(timeoutSec) || 45,
      },
      tl("采集任务调度")
    )
    toast.success(tl("已保存采集调度参数"))
  }

  function saveExport(event: FormEvent) {
    event.preventDefault()
    workspaceActions.saveGlobalParams(
      {
        exportRowLimit: Number(exportLimit) || 50000,
        exportWatermark: watermark,
      },
      tl("导出与合规")
    )
    toast.success(tl("已保存导出与合规参数"))
  }

  function saveRuntime(event: FormEvent) {
    event.preventDefault()
    workspaceActions.saveGlobalParams(
      {
        apiRateLimitPerMin: Number(apiRate) || 600,
        webhookTimeoutSec: Number(webhookTimeout) || 10,
        strictSchemaCheck: strictSchema,
      },
      tl("API 与运行阈值")
    )
    toast.success(tl("已保存 API 与运行阈值"))
  }

  return (
    <div className="settings-basic-page">
      <div className="basic-flow">
        <FrostCard className="basic-card">
          <form onSubmit={saveCollection}>
            <header className="basic-card-header">
              <span className="basic-card-icon">
                <AppIcon icon={SolarCloud} size={16} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <h2>{tl("采集任务调度")}</h2>
              </div>
              <div className="basic-card-actions">
                <Button type="submit" size="small">
                  {tl("保存")}
                </Button>
              </div>
            </header>
            <div className="basic-rows">
              <div className="basic-row">
                <label className="basic-row-text" htmlFor="gp-concurrency">
                  <b>{tl("最大并发采集数")}</b>
                  <small>{tl("同时拉取的云账号任务上限（1–32）")}</small>
                </label>
                <div className="basic-row-control" data-width="xs">
                  <Input
                    id="gp-concurrency"
                    type="number"
                    min={1}
                    max={32}
                    className="financial-number"
                    value={concurrency}
                    onChange={(e) => setConcurrency(e.target.value)}
                  />
                </div>
              </div>
              <div className="basic-row">
                <label className="basic-row-text" htmlFor="gp-retries">
                  <b>{tl("失败自动重试次数")}</b>
                  <small>{tl("遇到云厂商接口限流时的指数退避重试次数")}</small>
                </label>
                <div className="basic-row-control" data-width="xs">
                  <Input
                    id="gp-retries"
                    type="number"
                    min={0}
                    max={10}
                    className="financial-number"
                    value={retries}
                    onChange={(e) => setRetries(e.target.value)}
                  />
                </div>
              </div>
              <div className="basic-row">
                <label className="basic-row-text" htmlFor="gp-timeout">
                  <b>{tl("单次请求超时（秒）")}</b>
                </label>
                <div className="basic-row-control" data-width="xs">
                  <Input
                    id="gp-timeout"
                    type="number"
                    min={5}
                    max={300}
                    className="financial-number"
                    value={timeoutSec}
                    onChange={(e) => setTimeoutSec(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </form>
        </FrostCard>

        <FrostCard className="basic-card">
          <form onSubmit={saveExport}>
            <header className="basic-card-header">
              <span className="basic-card-icon">
                <AppIcon icon={SolarDownload} size={16} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <h2>{tl("导出与合规")}</h2>
              </div>
              <div className="basic-card-actions">
                <Button type="submit" size="small">
                  {tl("保存")}
                </Button>
              </div>
            </header>
            <div className="basic-rows">
              <div className="basic-row">
                <label className="basic-row-text" htmlFor="gp-export-limit">
                  <b>{tl("单次导出行数上限")}</b>
                  <small>{tl("超出上限时自动转为后台异步打包导出")}</small>
                </label>
                <div className="basic-row-control" data-width="sm">
                  <Input
                    id="gp-export-limit"
                    type="number"
                    min={1000}
                    step={1000}
                    className="financial-number"
                    value={exportLimit}
                    onChange={(e) => setExportLimit(e.target.value)}
                  />
                </div>
              </div>
              <div className="basic-row">
                <label className="basic-row-text" htmlFor="gp-watermark">
                  <b>{tl("导出报表附带操作人水印")}</b>
                  <small>
                    {tl("在 CSV / Excel 附注中记录下载者账号与时间戳")}
                  </small>
                </label>
                <div className="basic-row-control" data-width="xs">
                  <Switch
                    id="gp-watermark"
                    checked={watermark}
                    onCheckedChange={setWatermark}
                  />
                </div>
              </div>
            </div>
          </form>
        </FrostCard>

        <FrostCard className="basic-card">
          <form onSubmit={saveRuntime}>
            <header className="basic-card-header">
              <span className="basic-card-icon">
                <AppIcon icon={SolarCog} size={16} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <h2>{tl("API 与运行阈值")}</h2>
              </div>
              <div className="basic-card-actions">
                <Button type="submit" size="small">
                  {tl("保存")}
                </Button>
              </div>
            </header>
            <div className="basic-rows">
              <div className="basic-row">
                <label className="basic-row-text" htmlFor="gp-api-rate">
                  <b>{tl("API 速率限制（次 / 分钟）")}</b>
                </label>
                <div className="basic-row-control" data-width="xs">
                  <Input
                    id="gp-api-rate"
                    type="number"
                    min={60}
                    className="financial-number"
                    value={apiRate}
                    onChange={(e) => setApiRate(e.target.value)}
                  />
                </div>
              </div>
              <div className="basic-row">
                <label className="basic-row-text" htmlFor="gp-webhook-timeout">
                  <b>{tl("Webhook 回调超时（秒）")}</b>
                </label>
                <div className="basic-row-control" data-width="xs">
                  <Input
                    id="gp-webhook-timeout"
                    type="number"
                    min={3}
                    max={60}
                    className="financial-number"
                    value={webhookTimeout}
                    onChange={(e) => setWebhookTimeout(e.target.value)}
                  />
                </div>
              </div>
              <div className="basic-row">
                <label className="basic-row-text" htmlFor="gp-strict-schema">
                  <b>{tl("启用严格账单字段校验")}</b>
                  <small>
                    {tl("遇到未知币种或缺失账期字段时拒绝入库并告警")}
                  </small>
                </label>
                <div className="basic-row-control" data-width="xs">
                  <Switch
                    id="gp-strict-schema"
                    checked={strictSchema}
                    onCheckedChange={setStrictSchema}
                  />
                </div>
              </div>
            </div>
          </form>
        </FrostCard>
      </div>
    </div>
  )
}
