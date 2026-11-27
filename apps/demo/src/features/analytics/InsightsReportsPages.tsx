import { useMemo, useState, type FormEvent } from "react"
import { toast } from "sonner"

import {
  AppIcon,
  SolarCheck,
  SolarPlus,
  SolarRefreshCcw,
  SolarSparkles,
} from "@marismoon/ui/icons"
import { DataTable } from "@marismoon/ui/shared/DataTable"
import { FrostCard } from "@marismoon/ui/shared/FrostCard"
import { StatusBadge } from "@marismoon/ui/shared/StatusBadge"
import {
  createDataTableColumns,
  useDataTable,
} from "@marismoon/ui/shared/use-data-table"
import { Button } from "@marismoon/ui/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@marismoon/ui/ui/dialog"
import { Field, FieldLabel } from "@marismoon/ui/ui/field"
import { Input } from "@marismoon/ui/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@marismoon/ui/ui/select"
import { Switch } from "@marismoon/ui/ui/switch"
import {
  RingKpiCard,
  SparklineKpiCard,
} from "@/features/settings/SettingsSummaryVisuals"
import { useUiText } from "@/lib/i18n/use-ui-text"
import {
  analyticsActions,
  useAnalyticsStore,
  type CustomReportItem,
  type InsightDomain,
} from "./analytics-data"

import "../bills/components/bills-controls.css"
import "../bills/components/bills-table.css"
import "../settings/settings-table.css"
import "./analytics.css"

const domainLabels: Record<InsightDomain, string> = {
  platform: "平台数据",
  backend: "后台数据",
  system: "系统数据",
  cost: "成本数据",
}

const reportCol = createDataTableColumns<CustomReportItem>()
const reportAlign = {
  enabled: "center",
  actions: "end",
} as const

export function AiInsightsSummary() {
  const tl = useUiText()
  const { insights } = useAnalyticsStore()
  const openCount = insights.filter((i) => i.status === "open").length
  const adoptedCount = insights.filter((i) => i.status === "adopted").length
  const avgConfidence = Math.round(
    insights.reduce((s, i) => s + i.confidencePct, 0) /
      Math.max(insights.length, 1)
  )
  const adoptRate = Math.round(
    (adoptedCount / Math.max(insights.length, 1)) * 100
  )

  const domainBars = (["platform", "backend", "system", "cost"] as const).map(
    (domain) => ({
      label: tl(domainLabels[domain]),
      value: insights.filter((i) => i.domain === domain).length,
    })
  )
  const adoptTrend = [
    { label: "W1", value: 32 },
    { label: "W2", value: 40 },
    { label: "W3", value: 46 },
    { label: "W4", value: 52 },
    { label: "W5", value: 58 },
    { label: "W6", value: Math.max(adoptRate, 25) },
  ]

  return (
    <section
      className="settings-summary-grid"
      data-cols="3"
      aria-label={tl("智能洞察概况")}
    >
      <SparklineKpiCard
        featured
        label={tl("跨维度智能洞察")}
        value={`${insights.length} ${tl("条")}`}
        formatHoverValue={(v) => `${v} ${tl("条")}`}
        badge={`${tl("待评估")} ${openCount}`}
        badgeTone="info"
        note={tl("覆盖平台、后台、系统与成本四维异常归因")}
        data={domainBars}
        variant="bar"
        color="var(--chart-1)"
      />

      <SparklineKpiCard
        label={tl("优化建议采纳率")}
        value={`${adoptRate}%`}
        formatHoverValue={(v) => `${v}%`}
        badge={`${adoptedCount}/${insights.length}`}
        badgeTone="success"
        note={tl("近 6 周 AI 降本与性能优化建议采纳趋势")}
        data={adoptTrend}
        variant="area"
        color="var(--chart-positive)"
      />

      <RingKpiCard
        label={tl("归因模型置信度")}
        value={`${avgConfidence}%`}
        badge={tl("近 30 日基线")}
        badgeTone="info"
        note={tl("基于近 30 天指标基线与异常关联计算")}
        rings={[
          {
            label: tl("归因模型置信度"),
            value: avgConfidence,
            maxValue: 100,
            color: "var(--chart-2)",
          },
        ]}
      />
    </section>
  )
}

export function AiInsightsPage() {
  const tl = useUiText()
  const { insights } = useAnalyticsStore()
  const [domainFilter, setDomainFilter] = useState<"all" | InsightDomain>("all")

  const filtered = useMemo(
    () =>
      domainFilter === "all"
        ? insights
        : insights.filter((item) => item.domain === domainFilter),
    [domainFilter, insights]
  )

  return (
    <div className="analytics-page">
      <div className="analytics-toolbar-row">
        <div
          className="analytics-range-pills"
          role="group"
          aria-label={tl("按维度筛选洞察")}
        >
          {(
            [
              ["all", "全部维度"],
              ["platform", "平台数据"],
              ["backend", "后台数据"],
              ["system", "系统数据"],
              ["cost", "成本数据"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className="analytics-range-btn"
              aria-pressed={domainFilter === key}
              onClick={() => setDomainFilter(key)}
            >
              {tl(label)}
            </button>
          ))}
        </div>
      </div>

      <div className="analytics-insight-grid">
        {filtered.map((item) => (
          <FrostCard key={item.id} className="analytics-insight-card">
            <div className="analytics-insight-content">
              <div className="analytics-insight-head">
                <div className="flex items-center gap-2">
                  <span className="bill-row-pill">
                    {tl(domainLabels[item.domain])}
                  </span>
                  <StatusBadge
                    tone={
                      item.status === "adopted"
                        ? "success"
                        : item.status === "dismissed"
                          ? "neutral"
                          : "info"
                    }
                  >
                    {item.status === "adopted"
                      ? tl("已采纳")
                      : item.status === "dismissed"
                        ? tl("已忽略")
                        : tl("待评估")}
                  </StatusBadge>
                </div>
                <span className="text-xs text-muted-foreground financial-number">
                  {tl("置信度")} {item.confidencePct}%
                </span>
              </div>

              <h3 className="analytics-insight-title">{tl(item.title)}</h3>
              <p className="analytics-insight-summary">{tl(item.summary)}</p>
              <div className="analytics-insight-impact">
                <AppIcon icon={SolarSparkles} size={15} aria-hidden="true" />
                <span>{tl(item.impact)}</span>
              </div>
              <p className="analytics-insight-summary">
                <strong>{tl("建议操作")}：</strong>
                {tl(item.recommendation)}
              </p>
            </div>

            <div className="analytics-insight-foot">
              <span className="text-xs text-muted-foreground financial-number">
                {item.detectedAt}
              </span>
              {item.status === "open" ? (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="small"
                    variant="outline"
                    onClick={() => {
                      analyticsActions.updateInsightStatus(item.id, "dismissed")
                      toast.success(tl("已忽略该洞察"))
                    }}
                  >
                    {tl("忽略")}
                  </Button>
                  <Button
                    type="button"
                    size="small"
                    onClick={() => {
                      analyticsActions.updateInsightStatus(item.id, "adopted")
                      toast.success(tl("已采纳优化建议"))
                    }}
                  >
                    <AppIcon
                      icon={SolarCheck}
                      data-icon="inline-start"
                      aria-hidden
                    />
                    {tl("采纳建议")}
                  </Button>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">
                  {item.status === "adopted" ? tl("已采纳") : tl("已归档")}
                </span>
              )}
            </div>
          </FrostCard>
        ))}
      </div>
    </div>
  )
}

export function CustomReportsSummary() {
  const tl = useUiText()
  const { reports } = useAnalyticsStore()
  const enabledCount = reports.filter((r) => r.enabled).length
  const pct = Math.round((enabledCount / Math.max(reports.length, 1)) * 100)
  const pdfCount = reports.filter((r) => r.format === "PDF").length
  const xlsxCount = reports.filter((r) => r.format === "XLSX").length
  const csvCount = reports.filter((r) => r.format === "CSV").length

  const deliveryBars = [
    { label: "11/20", value: 6 },
    { label: "11/21", value: 8 },
    { label: "11/22", value: 4 },
    { label: "11/23", value: 9 },
    { label: "11/24", value: 11 },
    { label: "11/25", value: 7 },
    { label: "11/26", value: enabledCount * 2 + 3 },
  ]
  const autoRateTrend = [
    { label: "W1", value: Math.max(pct - 18, 40) },
    { label: "W2", value: Math.max(pct - 12, 48) },
    { label: "W3", value: Math.max(pct - 8, 56) },
    { label: "W4", value: Math.max(pct - 4, 64) },
    { label: "W5", value: Math.max(pct - 2, 70) },
    { label: "W6", value: pct },
  ]

  return (
    <section
      className="settings-summary-grid"
      data-cols="2"
      aria-label={tl("自定义报表概况")}
    >
      <SparklineKpiCard
        featured
        label={tl("定时报表模板与交付量")}
        value={`${enabledCount} / ${reports.length} ${tl("份")}`}
        formatHoverValue={(v) => `${v} ${tl("次快照")}`}
        badge={`PDF ${pdfCount} · XLSX ${xlsxCount} · CSV ${csvCount}`}
        badgeTone="info"
        note={tl("近 7 日自动生成并推送的最新报表快照次数")}
        data={deliveryBars}
        variant="bar"
        color="var(--chart-1)"
      />

      <SparklineKpiCard
        label={tl("定时任务自动化覆盖率")}
        value={`${pct}%`}
        formatHoverValue={(v) => `${v}%`}
        badge={tl("支持手动触发")}
        badgeTone="success"
        note={tl("支持随时手动触发立即生成最新快照")}
        data={autoRateTrend}
        variant="area"
        color="var(--chart-2)"
      />
    </section>
  )
}

export function CustomReportsPage() {
  const tl = useUiText()
  const { reports } = useAnalyticsStore()

  const [createOpen, setCreateOpen] = useState(false)
  const [name, setName] = useState("")
  const [domain, setDomain] = useState<InsightDomain>("cost")
  const [schedule, setSchedule] = useState("每周一 09:00")
  const [format, setFormat] = useState<"PDF" | "CSV" | "XLSX">("PDF")
  const [recipients, setRecipients] = useState("张敏、李然")

  function handleCreate(event: FormEvent) {
    event.preventDefault()
    if (!name.trim()) {
      toast.error(tl("请填写报表名称"))
      return
    }
    analyticsActions.addReport({
      name: name.trim(),
      domain,
      schedule: schedule.trim() || "每周一 09:00",
      format,
      recipients: recipients.trim() || "张敏",
    })
    toast.success(tl("已创建自定义报表"))
    setName("")
    setCreateOpen(false)
  }

  const columns = useMemo(
    () =>
      reportCol.columns([
        reportCol.accessor("name", {
          header: tl("报表名称 / 周期"),
          cell: ({ row }) => (
            <>
              <span className="bill-row-id">{tl(row.original.name)}</span>
              <span className="bill-row-account">
                {tl(row.original.schedule)} · {tl(row.original.recipients)}
              </span>
            </>
          ),
        }),
        reportCol.accessor("domain", {
          header: tl("数据域"),
          cell: ({ getValue }) => (
            <span className="bill-row-pill">
              {tl(domainLabels[getValue()])}
            </span>
          ),
        }),
        reportCol.accessor("format", {
          header: tl("格式"),
          cell: ({ getValue }) => (
            <span className="bill-row-pill financial-number">{getValue()}</span>
          ),
        }),
        reportCol.accessor("lastGeneratedAt", {
          header: tl("最近生成"),
          cell: ({ getValue }) => (
            <span className="text-muted-foreground financial-number">
              {getValue()}
            </span>
          ),
        }),
        reportCol.accessor("enabled", {
          header: tl("定时推送"),
          cell: ({ row, getValue }) => (
            <Switch
              checked={getValue()}
              onCheckedChange={(checked) => {
                analyticsActions.toggleReport(row.original.id, checked)
                toast.success(
                  checked ? tl("已启用定时报表") : tl("已暂停定时报表")
                )
              }}
              aria-label={tl("切换报表 {{name}}", {
                name: tl(row.original.name),
              })}
            />
          ),
        }),
        reportCol.display({
          id: "actions",
          header: tl("操作"),
          cell: ({ row }) => (
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              className="bill-detail-action"
              aria-label={tl("立即生成快照")}
              title={tl("立即生成快照")}
              onClick={() => {
                analyticsActions.runReportNow(row.original.id)
                toast.success(tl("已生成最新报表快照"))
              }}
            >
              <AppIcon icon={SolarRefreshCcw} size={16} />
            </Button>
          ),
        }),
      ]),
    [tl]
  )

  const table = useDataTable({
    columns,
    data: reports,
    getRowId: (row) => row.id,
    initialState: { pagination: { pageIndex: 0, pageSize: 10 } },
  })

  return (
    <>
      <FrostCard className="settings-register analytics-reports-table">
        <div className="bills-toolbar">
          <div className="bills-toolbar-head">
            <span className="bills-toolbar-title">{tl("自定义报表列表")}</span>
            <Button
              type="button"
              size="small"
              onClick={() => setCreateOpen(true)}
            >
              <AppIcon icon={SolarPlus} data-icon="inline-start" aria-hidden />
              {tl("新建报表")}
            </Button>
          </div>
        </div>
        <DataTable
          table={table}
          caption={tl("自定义报表列表")}
          columnAlign={reportAlign}
          rowHeaderColumn="name"
          selectAllLabel={tl("选择全部报表")}
          selectRowLabel={(row) => tl(row.name)}
          paginationLabel={tl("报表分页")}
          empty={null}
        />
      </FrostCard>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{tl("新建自定义报表")}</DialogTitle>
            <DialogDescription>
              {tl("配置数据维度、导出格式与定时推送周期。")}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="grid gap-3">
            <Field>
              <FieldLabel htmlFor="rpt-name">{tl("报表名称")}</FieldLabel>
              <Input
                id="rpt-name"
                controlSize="dense"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={tl("例如：季度多云成本与 SLA 汇总")}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="rpt-domain">{tl("数据域")}</FieldLabel>
                <Select
                  value={domain}
                  onValueChange={(v) => setDomain(v as InsightDomain)}
                >
                  <SelectTrigger id="rpt-domain" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="platform">{tl("平台数据")}</SelectItem>
                    <SelectItem value="backend">{tl("后台数据")}</SelectItem>
                    <SelectItem value="system">{tl("系统数据")}</SelectItem>
                    <SelectItem value="cost">{tl("成本数据")}</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="rpt-format">{tl("导出格式")}</FieldLabel>
                <Select
                  value={format}
                  onValueChange={(v) => setFormat(v as "PDF" | "CSV" | "XLSX")}
                >
                  <SelectTrigger id="rpt-format" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="PDF">PDF</SelectItem>
                    <SelectItem value="XLSX">XLSX</SelectItem>
                    <SelectItem value="CSV">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="rpt-schedule">{tl("生成周期")}</FieldLabel>
              <Input
                id="rpt-schedule"
                controlSize="dense"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="rpt-recipients">{tl("接收对象")}</FieldLabel>
              <Input
                id="rpt-recipients"
                controlSize="dense"
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
              />
            </Field>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
              >
                {tl("取消")}
              </Button>
              <Button type="submit">{tl("创建报表")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
