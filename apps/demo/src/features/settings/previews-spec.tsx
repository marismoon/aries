import { AppIcon, SolarMail, SolarSearch } from "@marismoon/ui/icons"
import { Badge } from "@marismoon/ui/ui/badge"
import { Button } from "@marismoon/ui/ui/button"
import { Input } from "@marismoon/ui/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@marismoon/ui/ui/select"
import type { PreviewItem } from "./preview-types"

const heights = [
  { label: "xs", size: "xs", px: 24, use: "表格内的文字式操作" },
  {
    label: "dense（默认）",
    size: "dense",
    px: 32,
    use: "页面内的按钮、输入、下拉、筛选",
  },
  { label: "sm", size: "sm", px: 36, use: "触控较多的紧凑区域" },
  { label: "default", size: "default", px: 40, use: "对话框、抽屉、主操作" },
  { label: "lg", size: "lg", px: 44, use: "移动端点击目标" },
] as const

const radii = [
  {
    name: "控件 · 圆润",
    token: "--radius-workspace-control",
    value: "1.125rem",
    use: "按钮、输入、下拉、页签、标签",
  },
  {
    name: "内部分组",
    token: "--radius-control",
    value: "1rem",
    use: "卡片内的分组、列表行",
  },
  {
    name: "面板 · 卡片",
    token: "--radius-panel",
    value: "1.5rem",
    use: "卡片、抽屉、浮层",
  },
]

const type = [
  { size: "0.6875rem", sample: "11 · 徽标与图表标注" },
  { size: "0.75rem", sample: "12 · 标签、表头、辅助说明" },
  { size: "0.8125rem", sample: "13 · 控件与表格正文" },
  { size: "0.875rem", sample: "14 · 正文、菜单项" },
  { size: "0.9375rem", sample: "15 · 卡片标题" },
  { size: "1.25rem", sample: "20 · 页面标题" },
]

const swatches = [
  ["primary", "主色"],
  ["accent", "强调底"],
  ["secondary", "次要底"],
  ["muted", "弱化底"],
  ["destructive", "危险"],
  ["success", "成功"],
  ["warning", "警告"],
  ["info", "信息"],
] as const

export const specPreviews: PreviewItem[] = [
  {
    id: "spec-height",
    title: "控件高度",
    description: "默认即标准：不写 size 就是 32px 的圆润控件",
    usage:
      '<Button>  <Input />  <SelectTrigger>  → 默认 32px；弹层与主操作写 size="default"（40px）',
    wide: true,
    stack: true,
    node: (
      <div className="spec-rows">
        {heights.map(({ label, size, px, use }) => (
          <div key={label} className="spec-row">
            <code>{px}px</code>
            <Button size={size} variant="outline">
              {label}
            </Button>
            <span>{use}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "spec-controls",
    title: "同一行的控件",
    description: "按钮、输入、下拉、标签在同一基线上等高、同样圆润",
    usage: "筛选区：Input + SelectTrigger + Button 直接并排，无需再调高度",
    wide: true,
    node: (
      <>
        <div className="relative w-56">
          <Input placeholder="搜索账号、供应商…" aria-label="搜索" />
        </div>
        <Select defaultValue="all">
          <SelectTrigger aria-label="供应商">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="all">全部</SelectItem>
            <SelectItem value="aliyun">阿里云</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">
          <AppIcon icon={SolarSearch} data-icon="inline-start" />
          查询
        </Button>
        <Button>
          <AppIcon icon={SolarMail} data-icon="inline-start" />
          发送
        </Button>
        <Badge>标签</Badge>
      </>
    ),
  },
  {
    id: "spec-radius",
    title: "圆角",
    description: "控件一律圆润，面板更大；不使用方角",
    stack: true,
    node: (
      <div className="spec-rows">
        {radii.map(({ name, token, value, use }) => (
          <div key={token} className="spec-row">
            <span
              className="spec-radius"
              style={{ borderRadius: `var(${token})` }}
              aria-hidden="true"
            />
            <div>
              <strong>{name}</strong>
              <code>
                {token} · {value}
              </code>
              <span>{use}</span>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "spec-type",
    title: "字号",
    description: "界面只使用这六档",
    stack: true,
    node: (
      <div className="spec-rows">
        {type.map(({ size, sample }) => (
          <div key={size} className="spec-row">
            <code>{size}</code>
            <span style={{ fontSize: size }}>{sample}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "spec-color",
    title: "语义色",
    description: "只用主题变量，不写死颜色",
    wide: true,
    node: (
      <div className="spec-swatches">
        {swatches.map(([token, label]) => (
          <div key={token} className="spec-swatch">
            <span style={{ background: `var(--${token})` }} />
            <strong>{label}</strong>
            <code>--{token}</code>
          </div>
        ))}
      </div>
    ),
  },
]
