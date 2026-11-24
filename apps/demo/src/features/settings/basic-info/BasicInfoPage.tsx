import {
  createContext,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react"

import {
  AppIcon,
  SolarArchive,
  SolarBuildings2,
  SolarCog,
  SolarClose,
  SolarGlobal,
  SolarWallet,
  type AppIconComponent,
} from "@aries/ui/icons"
import { FrostCard } from "@aries/ui/shared/FrostCard"
import { StatusBadge } from "@aries/ui/shared/StatusBadge"
import { Button } from "@aries/ui/ui/button"
import { Input } from "@aries/ui/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@aries/ui/ui/select"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@aries/ui/ui/drawer"
import { useIsMobile } from "@aries/ui/hooks/use-mobile"
import { Switch } from "@aries/ui/ui/switch"
import { Textarea } from "@aries/ui/ui/textarea"
import { useUiText } from "@/lib/i18n/use-ui-text"

import "../../bills/components/bill-drawer.css"
import "./basic-info.css"

/** 系统设置 → 系统配置 → 基础信息（v2）。
 * 单栏受控宽度（760px）；每行「左：标题 + 说明 / 右：定宽控件」；每张卡片独立保存（仅脏数据激活）；
 * 系统信息 / 许可与配额 / 最近修改移入右侧抽屉。数据为静态 Mock。 */

const DirtyContext = createContext<() => void>(() => undefined)

function SettingCard({
  icon,
  title,
  description,
  children,
}: {
  icon: AppIconComponent
  title: string
  description: string
  children: ReactNode
}) {
  const tl = useUiText()
  const formRef = useRef<HTMLFormElement>(null)
  const [dirty, setDirty] = useState(false)
  const [saved, setSaved] = useState(false)
  const markDirty = () => {
    setDirty(true)
    setSaved(false)
  }

  return (
    <DirtyContext.Provider value={markDirty}>
      <FrostCard className="basic-card">
        <form
          ref={formRef}
          onChange={markDirty}
          onSubmit={(event) => {
            event.preventDefault()
            setDirty(false)
            setSaved(true)
          }}
          onReset={() => {
            setDirty(false)
            setSaved(false)
          }}
        >
          <header className="basic-card-header">
            <span className="basic-card-icon">
              <AppIcon icon={icon} size={16} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <h2>{title}</h2>
              <p>{description}</p>
            </div>
            <div className="basic-card-actions" role="status">
              {saved && !dirty && (
                <StatusBadge tone="success">{tl("已保存")}</StatusBadge>
              )}
              <Button
                type="reset"
                variant="ghost"
                size="small"
                disabled={!dirty}
              >
                {tl("撤销")}
              </Button>
              <Button
                type="submit"
                size="small"
                variant={dirty ? "default" : "outline"}
                disabled={!dirty}
              >
                {tl("保存")}
              </Button>
            </div>
          </header>
          <div className="basic-rows">{children}</div>
        </form>
      </FrostCard>
    </DirtyContext.Provider>
  )
}

function SettingRow({
  id,
  label,
  description,
  children,
  width = "md",
}: {
  id?: string
  label: string
  description?: string
  children: ReactNode
  /** 控件宽度档位：xs 120 / sm 180 / md 240 / lg 320（开关不受限） */
  width?: "xs" | "sm" | "md" | "lg"
}) {
  return (
    <div className="basic-row">
      <label className="basic-row-text" htmlFor={id}>
        <b>{label}</b>
        {description && <small>{description}</small>}
      </label>
      <div className="basic-row-control" data-width={width}>
        {children}
      </div>
    </div>
  )
}

function SelectControl({
  id,
  value,
  options,
}: {
  id: string
  value: string
  options: readonly string[]
}) {
  const markDirty = useContext(DirtyContext)
  return (
    <Select defaultValue={value} onValueChange={markDirty}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="popper">
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function SwitchControl({
  id,
  defaultChecked,
}: {
  id: string
  defaultChecked?: boolean
}) {
  const markDirty = useContext(DirtyContext)
  return (
    <Switch
      id={id}
      defaultChecked={defaultChecked}
      onCheckedChange={markDirty}
    />
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}

/** 系统信息抽屉：沿用 Aries 的 Drawer + bill-drawer 版式（Header / 分区 h3 + dl 行 / Footer）。 */
function InfoDrawer() {
  const tl = useUiText()
  const mobile = useIsMobile()

  return (
    <Drawer direction={mobile ? "bottom" : "right"} noBodyStyles>
      <DrawerTrigger asChild>
        <Button type="button" variant="outline">
          <AppIcon icon={SolarCog} size={16} aria-hidden="true" />
          {tl("系统信息")}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="relative pr-12">
          <DrawerTitle>{tl("系统信息")}</DrawerTitle>
          <DrawerDescription>
            {tl("系统信息、许可配额与最近修改")}
          </DrawerDescription>
          <DrawerClose asChild>
            <Button
              aria-label={tl("关闭")}
              className="absolute top-3 right-3"
              size="icon-sm"
              type="button"
              variant="ghost"
            >
              <AppIcon icon={SolarClose} size={18} aria-hidden="true" />
            </Button>
          </DrawerClose>
        </DrawerHeader>
        <div
          className="bill-drawer-body min-h-0 flex-1 overflow-y-auto px-4"
          data-vaul-no-drag=""
        >
          <section className="bill-drawer-section">
            <h3>{tl("系统信息")}</h3>
            <dl className="bill-drawer-rows">
              <Row label={tl("产品版本")}>
                <span className="financial-number">v1.8.2</span>
              </Row>
              <Row label={tl("构建号")}>
                <span className="financial-number">20261121.3</span>
              </Row>
              <Row label={tl("运行环境")}>
                <StatusBadge tone="success">{tl("生产")}</StatusBadge>
              </Row>
              <Row label={tl("部署区域")}>{tl("华东 2（上海）")}</Row>
              <Row label={tl("实例编号")}>
                <span className="financial-number">ORG-2026-0042</span>
              </Row>
              <Row label={tl("最近升级")}>
                <span className="financial-number">2026-11-02</span>
              </Row>
            </dl>
          </section>
          <section className="bill-drawer-section">
            <h3>
              {tl("许可与配额")}
              <StatusBadge tone="success">{tl("有效")}</StatusBadge>
            </h3>
            <dl className="bill-drawer-rows">
              <Row label={tl("云账号")}>
                <span className="financial-number">49 / 100</span>
              </Row>
              <Row label={tl("成员")}>
                <span className="financial-number">12 / 20</span>
              </Row>
              <Row label={tl("存储")}>
                <span className="financial-number">38%</span>
              </Row>
              <Row label={tl("许可到期")}>
                <span className="financial-number">2027-06-23</span>
              </Row>
            </dl>
          </section>
          <section className="bill-drawer-section">
            <h3>{tl("最近修改")}</h3>
            <dl className="bill-drawer-rows">
              <Row label="2026-11-18 16:42">{tl("张敏 修改了「出账日」")}</Row>
              <Row label="2026-10-29 10:05">
                {tl("李然 更新了「联系邮箱」")}
              </Row>
              <Row label="2026-10-08 09:31">
                {tl("张敏 开启了「截账后自动锁定」")}
              </Row>
            </dl>
          </section>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button type="button" variant="outline">
              {tl("关闭")}
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export function BasicInfoPage() {
  const tl = useUiText()
  const numberOption = (label: string, sample: string) =>
    `${tl(label)} · ${sample}`

  return (
    <div className="basic-flow">
      <div className="basic-toolbar">
        <p>
          {tl("最近修改")}
          <span className="financial-number"> 2026-11-18 16:42</span>
          {" · "}
          {tl("张敏")}
        </p>
        <InfoDrawer />
      </div>

      <SettingCard
        icon={SolarBuildings2}
        title={tl("组织资料")}
        description={tl("显示在账单、报表与通知中的组织信息")}
      >
        <div className="basic-identity">
          <span className="basic-logo" aria-hidden="true">
            M
          </span>
          <div className="basic-identity-text">
            <strong>{tl("Aries 科技有限公司")}</strong>
            <span>{tl("标志建议 256×256，PNG 或 SVG，不超过 1 MB")}</span>
          </div>
          <Button type="button" variant="outline">
            {tl("更换标志")}
          </Button>
        </div>
        <SettingRow id="basic-org-name" label={tl("组织名称")} width="lg">
          <Input id="basic-org-name" defaultValue={tl("Aries 科技有限公司")} />
        </SettingRow>
        <SettingRow id="basic-org-short" label={tl("组织简称")} width="md">
          <Input id="basic-org-short" defaultValue="Aries" />
        </SettingRow>
        <SettingRow id="basic-industry" label={tl("所属行业")} width="md">
          <SelectControl
            id="basic-industry"
            value={tl("互联网与软件")}
            options={[
              tl("互联网与软件"),
              tl("金融与保险"),
              tl("制造业"),
              tl("零售与电商"),
              tl("教育与科研"),
            ]}
          />
        </SettingRow>
        <SettingRow id="basic-size" label={tl("组织规模")} width="sm">
          <SelectControl
            id="basic-size"
            value={tl("201–500 人")}
            options={[
              tl("1–50 人"),
              tl("51–200 人"),
              tl("201–500 人"),
              tl("501–2000 人"),
              tl("2000 人以上"),
            ]}
          />
        </SettingRow>
        <SettingRow id="basic-contact" label={tl("联系人")} width="sm">
          <Input id="basic-contact" defaultValue={tl("张敏")} />
        </SettingRow>
        <SettingRow id="basic-phone" label={tl("联系电话")} width="sm">
          <Input
            id="basic-phone"
            type="tel"
            defaultValue="021-5555-0142"
            className="financial-number"
          />
        </SettingRow>
        <SettingRow
          id="basic-email"
          label={tl("联系邮箱")}
          description={tl("账单异常与授权到期提醒会发送到此邮箱")}
          width="lg"
        >
          <Input
            id="basic-email"
            type="email"
            defaultValue="finops@aries.example"
          />
        </SettingRow>
        <SettingRow id="basic-address" label={tl("办公地址")} width="lg">
          <Textarea
            id="basic-address"
            rows={2}
            defaultValue={tl("上海市浦东新区张江路 88 号 3 号楼 12 层")}
          />
        </SettingRow>
      </SettingCard>

      <SettingCard
        icon={SolarWallet}
        title={tl("账期与币种")}
        description={tl("决定账单归属月份、折算与锁定规则")}
      >
        <SettingRow
          id="basic-currency"
          label={tl("默认币种")}
          description={tl("外币账单按所选汇率来源折算为默认币种")}
          width="xs"
        >
          <SelectControl
            id="basic-currency"
            value="CNY"
            options={["CNY", "USD", "EUR"]}
          />
        </SettingRow>
        <SettingRow id="basic-rate" label={tl("汇率来源")} width="md">
          <SelectControl
            id="basic-rate"
            value={tl("中国人民银行中间价")}
            options={[
              tl("中国人民银行中间价"),
              tl("供应商账单汇率"),
              tl("手动维护"),
            ]}
          />
        </SettingRow>
        <SettingRow id="basic-cycle-day" label={tl("出账日")} width="sm">
          <SelectControl
            id="basic-cycle-day"
            value={tl("每月 1 日")}
            options={[tl("每月 1 日"), tl("每月 5 日"), tl("每月 10 日")]}
          />
        </SettingRow>
        <SettingRow id="basic-fiscal" label={tl("财年起始月")} width="xs">
          <SelectControl
            id="basic-fiscal"
            value={tl("1 月")}
            options={[tl("1 月"), tl("4 月"), tl("7 月"), tl("10 月")]}
          />
        </SettingRow>
        <SettingRow
          id="basic-close-day"
          label={tl("对账截止日")}
          description={tl("每月该日之后，上月账单不再允许调整")}
          width="xs"
        >
          <Input
            id="basic-close-day"
            type="number"
            min={1}
            max={28}
            defaultValue={10}
            className="financial-number"
          />
        </SettingRow>
        <SettingRow
          id="basic-estimate"
          label={tl("暂估单列显示")}
          description={tl("暂估金额与已出账金额分开统计，不混合汇总")}
          width="xs"
        >
          <SwitchControl id="basic-estimate" defaultChecked />
        </SettingRow>
        <SettingRow
          id="basic-lock"
          label={tl("截账后自动锁定")}
          description={tl("对账截止日后自动锁定上月账单，仅管理员可解锁")}
          width="xs"
        >
          <SwitchControl id="basic-lock" defaultChecked />
        </SettingRow>
      </SettingCard>

      <SettingCard
        icon={SolarGlobal}
        title={tl("区域与显示")}
        description={tl("影响当前组织内所有成员的默认显示方式")}
      >
        <SettingRow id="basic-language" label={tl("默认语言")} width="sm">
          <SelectControl
            id="basic-language"
            value={tl("简体中文")}
            options={[tl("简体中文"), "English"]}
          />
        </SettingRow>
        <SettingRow id="basic-timezone" label={tl("时区")} width="md">
          <SelectControl
            id="basic-timezone"
            value={tl("北京时间（UTC+8）")}
            options={[
              tl("北京时间（UTC+8）"),
              tl("东京时间（UTC+9）"),
              tl("协调世界时（UTC）"),
            ]}
          />
        </SettingRow>
        <SettingRow id="basic-date" label={tl("日期格式")} width="sm">
          <SelectControl
            id="basic-date"
            value="2026-11-21"
            options={["2026-11-21", "2026/11/21", tl("2026 年 11 月 21 日")]}
          />
        </SettingRow>
        <SettingRow id="basic-number" label={tl("数字与金额格式")} width="md">
          <SelectControl
            id="basic-number"
            value={numberOption("千分位逗号", "¥1,234,567.89")}
            options={[
              numberOption("千分位逗号", "¥1,234,567.89"),
              numberOption("千分位空格", "¥1 234 567,89"),
              numberOption("按万显示", tl("¥123.46 万")),
            ]}
          />
        </SettingRow>
      </SettingCard>

      <SettingCard
        icon={SolarArchive}
        title={tl("数据保留与提醒")}
        description={tl("控制历史数据保存时长与预警阈值")}
      >
        <SettingRow
          id="basic-bill-retention"
          label={tl("账单保留年限")}
          width="xs"
        >
          <SelectControl
            id="basic-bill-retention"
            value={tl("5 年")}
            options={[tl("3 年"), tl("5 年"), tl("7 年"), tl("永久")]}
          />
        </SettingRow>
        <SettingRow
          id="basic-log-retention"
          label={tl("采集日志保留天数")}
          width="xs"
        >
          <Input
            id="basic-log-retention"
            type="number"
            min={7}
            defaultValue={90}
            className="financial-number"
          />
        </SettingRow>
        <SettingRow
          id="basic-diff"
          label={tl("差异提醒阈值（%）")}
          description={tl("账单与预估偏差超过该比例时生成待确认项")}
          width="xs"
        >
          <Input
            id="basic-diff"
            type="number"
            min={0}
            step={0.5}
            defaultValue={2}
            className="financial-number"
          />
        </SettingRow>
        <SettingRow
          id="basic-budget"
          label={tl("预算预警阈值（%）")}
          description={tl("本期支出达到预算的该比例时发送预警")}
          width="xs"
        >
          <Input
            id="basic-budget"
            type="number"
            min={50}
            max={100}
            defaultValue={85}
            className="financial-number"
          />
        </SettingRow>
        <SettingRow
          id="basic-weekly"
          label={tl("发送每周运营周报")}
          description={tl("每周一 09:00 发送到联系邮箱")}
          width="xs"
        >
          <SwitchControl id="basic-weekly" defaultChecked />
        </SettingRow>
      </SettingCard>
    </div>
  )
}
