import { useState, type ReactNode } from "react"

import {
  AppIcon,
  SolarArchive,
  SolarCheck,
  SolarCircleCheck,
  SolarClock3,
  SolarCog,
  SolarEyeClosed,
  SolarInbox,
  SolarMail,
  SolarSearch,
  SolarShieldAlert,
  SolarTriangleAlert,
  SolarUserCross,
  SolarVerifiedCheck,
  SolarBuildings2,
  type AppIconComponent,
} from "@marismoon/ui/icons"
import { Badge } from "@marismoon/ui/ui/badge"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@marismoon/ui/ui/item"
import { RadioGroup, RadioGroupItem } from "@marismoon/ui/ui/radio-group"
import { Button } from "@marismoon/ui/ui/button"
import {
  Account,
  Actions,
  Brand,
  ErrorCode,
  ErrorId,
  GoButton,
  Heading,
  HelpList,
  KeyValue,
  Links,
  OtpField,
  QrBlock,
  Remember,
  ScreenCard,
  Steps,
  StatusIcon,
  TextField,
  Tip,
} from "./ui"
import { useUiText } from "@/lib/i18n/use-ui-text"
import { UiTrans } from "@/lib/i18n/UiTrans"

const rules = "至少 12 位，包含字母、数字与符号；不能与最近 5 次密码相同"

function Screen({ children }: { children: ReactNode }) {
  return (
    <ScreenCard>
      <Brand />
      {children}
    </ScreenCard>
  )
}

/* ---- 登录与账号 ---- */

function Login() {
  const tl = useUiText()

  const [totp, setTotp] = useState(false)
  if (totp) {
    return (
      <Screen>
        <Heading title={tl("输入动态口令")}>
          {tl("打开手机上的验证器 App，输入 6 位动态口令。口令每 30 秒更新。")}
        </Heading>
        <OtpField />
        <Actions>
          <GoButton to="close" primary>
            {tl("登录")}
          </GoButton>
        </Actions>
        <div className="base-links">
          <Button
            type="button"
            variant="link"
            size="xs"
            onClick={() => setTotp(false)}
          >
            {tl("返回上一步")}
          </Button>
          <Links items={[[tl("动态口令丢失？"), "lost"]]} />
        </div>
      </Screen>
    )
  }
  return (
    <Screen>
      <Heading title={tl("登录 Aries")}>
        {tl(
          "使用本地账号登录，登录后需输入动态口令；如已启用企业 SSO，也可用企业账号登录。"
        )}
      </Heading>
      <TextField label={tl("邮箱")} placeholder="name@example.test" />
      <TextField
        label={tl("密码")}
        type="password"
        placeholder={tl("请输入密码")}
        hint={tl("连续输错 5 次将锁定 15 分钟")}
      />
      <div className="base-row">
        <Remember>{tl("记住用户名")}</Remember>
        <Links items={[[tl("忘记密码？"), "forgot"]]} />
      </div>
      <Button
        type="button"
        size="default"
        className="base-wide"
        onClick={() => setTotp(true)}
      >
        {tl("登录")}
      </Button>
      <div className="base-links">
        <Links
          items={[
            [tl("使用企业账号（SSO）登录"), "login"],
            [tl("无法登录？"), "lost"],
          ]}
        />
      </div>
    </Screen>
  )
}

const Forgot = () => {
  const tl = useUiText()
  return (
    <Screen>
      <Heading title={tl("找回密码")}>
        {tl(
          "输入你的登录邮箱，我们会发送重置密码的链接。链接 30 分钟内有效，且只能使用一次。"
        )}
      </Heading>
      <TextField label={tl("邮箱")} placeholder="name@example.test" />
      <GoButton to="forgots" primary>
        {tl("发送重置邮件")}
      </GoButton>
      <Links
        items={[
          [tl("返回登录"), "login"],
          [tl("收不到邮件？"), "lost"],
        ]}
      />
    </Screen>
  )
}

const ForgotSent = () => {
  const tl = useUiText()
  return (
    <Screen>
      <StatusIcon icon={SolarMail} tone="success" />
      <Heading title={tl("请查收邮件")}>
        <UiTrans
          source="如果 <0>{{email}}</0> 对应一个可用账号，我们已发送重置邮件。链接 30 分钟内有效，只能使用一次；没收到请检查垃圾邮件，或稍后重新发送。为保护账号安全，无论邮箱是否已注册，这里的提示都一样。"
          components={[<b />]}
          values={{ email: "n***@example.test" }}
        />
      </Heading>
      <Actions>
        <GoButton to="forgots">{tl("重新发送")}</GoButton>
        <GoButton to="login" primary>
          {tl("返回登录")}
        </GoButton>
      </Actions>
    </Screen>
  )
}

const Reset = () => {
  const tl = useUiText()
  return (
    <Screen>
      <Heading title={tl("设置新密码")}>
        <UiTrans
          source="你正在为 <0>{{email}}</0> 重置密码。重置后其他设备将退出登录。"
          components={[<b />]}
          values={{ email: "n***@example.test" }}
        />
      </Heading>
      <TextField label={tl("新密码")} type="password" hint={tl(rules)} />
      <TextField label={tl("确认新密码")} type="password" />
      <GoButton to="resetok" primary>
        {tl("重置密码")}
      </GoButton>
    </Screen>
  )
}

const ResetExpired = () => {
  const tl = useUiText()
  return (
    <Screen>
      <StatusIcon icon={SolarClock3} tone="warning" />
      <Heading title={tl("链接已失效")}>
        {tl("重置链接已过期或已被使用。请重新获取一封新的重置邮件。")}
      </Heading>
      <GoButton to="forgot" primary>
        {tl("重新获取")}
      </GoButton>
    </Screen>
  )
}

const ResetDone = () => {
  const tl = useUiText()
  return (
    <Screen>
      <StatusIcon icon={SolarCircleCheck} tone="success" />
      <Heading title={tl("密码已重置")}>
        {tl(
          "你的密码已更新，其他设备已退出登录。请使用新密码登录；如已启用动态口令，登录时仍需输入口令。"
        )}
      </Heading>
      <GoButton to="login" primary>
        {tl("去登录")}
      </GoButton>
    </Screen>
  )
}

const Rebind = () => {
  const tl = useUiText()
  return (
    <Screen>
      <Heading title={tl("重新绑定动态口令")}>
        {tl(
          "更换手机或验证器 App 时使用。绑定成功后，旧设备上的口令立即失效。"
        )}
      </Heading>
      <QrBlock />
      <OtpField />
      <GoButton to="close" primary>
        {tl("验证并绑定")}
      </GoButton>
      <Tip>
        {tl("提醒：绑定会写入审计日志；若设备已丢失，请联系系统管理员重置。")}
      </Tip>
    </Screen>
  )
}

const entities = [
  ["星河科技（上海）有限公司", "主体 · 上海", "星河上海"],
  ["星河科技（北京）有限公司", "主体 · 北京", "星河北京"],
  ["星河云服（香港）有限公司", "主体 · 香港", "星河香港"],
] as const

function ChooseEntity() {
  const tl = useUiText()

  const [selected, setSelected] = useState(0)
  return (
    <Screen>
      <Heading title={tl("选择企业主体")}>
        {tl(
          "你被授权查看 {{count}} 个企业主体；主体之间的数据互相隔离，进入后可在左下角用户菜单切换。",
          { count: entities.length }
        )}
      </Heading>
      <RadioGroup
        value={String(selected)}
        onValueChange={(value) => setSelected(Number(value))}
        aria-label={tl("企业主体")}
        className="gap-2"
      >
        {entities.map(([name, note], index) => (
          <Item
            key={name}
            asChild
            variant="outline"
            size="sm"
            className="has-data-[state=checked]:bg-accent"
          >
            <label htmlFor={`entity-${index}`}>
              <ItemMedia variant="icon">
                <AppIcon icon={SolarBuildings2} aria-hidden="true" />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{tl(name)}</ItemTitle>
                <ItemDescription>{tl(note)}</ItemDescription>
              </ItemContent>
              <RadioGroupItem id={`entity-${index}`} value={String(index)} />
            </label>
          </Item>
        ))}
      </RadioGroup>
      <Remember>
        {tl("下次直接进入「{{entity}}」", {
          entity: tl(entities[selected]![2]),
        })}
      </Remember>
      <GoButton to="close" primary>
        {tl("进入")}
      </GoButton>
    </Screen>
  )
}

const stepOp = (
  tl: ReturnType<typeof useUiText>,
  op: string,
  detail: string,
  intro: string
) => (
  <>
    <Heading title={tl("需要二次验证")}>
      <UiTrans
        source="你正在执行高风险操作：<0>{{op}}</0>。{{intro}}本次验证 10 分钟内有效，并写入审计日志。"
        components={[<b />]}
        values={{ op, intro }}
      />
    </Heading>
    <KeyValue
      rows={[
        [tl("操作"), detail],
        [tl("发起人"), tl("陈**")],
      ]}
    />
  </>
)

const StepUp = () => {
  const tl = useUiText()
  return (
    <Screen>
      {stepOp(
        tl,
        tl("更换账号凭据"),
        tl("更换凭据 · 阿里云 · 生产账号"),
        tl("请输入验证器 App 中的 6 位动态口令确认；")
      )}
      <OtpField />
      <GoButton to="close" primary>
        {tl("验证并继续")}
      </GoButton>
      <Links
        items={[
          [tl("取消操作"), "close"],
          [tl("动态口令丢失？"), "lost"],
        ]}
      />
    </Screen>
  )
}

const Lost = () => {
  const tl = useUiText()
  return (
    <Screen>
      <Heading title={tl("无法登录？")}>
        {tl("请按下面的情况处理；密码可自助重置，动态口令丢失须由管理员重置。")}
      </Heading>
      <HelpList
        items={[
          [
            tl("忘记密码"),
            tl(
              "可在登录页点击「忘记密码？」，用登录邮箱接收重置链接自助重置；若邮件功能未启用、收不到邮件或邮箱已变更，请联系系统管理员重置（一次性临时密码，登录后须立即设置新密码）。"
            ),
          ],
          [
            tl("动态口令丢失或换了手机"),
            tl(
              "联系系统管理员，在「系统 › 用户管理」中重置动态口令，之后重新绑定。"
            ),
          ],
          [
            tl("账号无法访问某个主体"),
            tl(
              "请管理员在「角色管理」与「用户管理」中调整你的角色与数据范围。"
            ),
          ],
        ]}
      />
      <Account />
      <GoButton to="login" primary>
        {tl("返回登录")}
      </GoButton>
    </Screen>
  )
}

const Disabled = () => {
  const tl = useUiText()
  return (
    <Screen>
      <StatusIcon icon={SolarUserCross} tone="danger" />
      <Heading title={tl("账号已停用")}>
        {tl("此账号已被系统管理员停用，无法登录。如有疑问，请联系系统管理员。")}
      </Heading>
      <Account />
      <GoButton to="login" primary>
        {tl("返回登录")}
      </GoButton>
    </Screen>
  )
}

function Setup() {
  const tl = useUiText()

  const labels = [
    tl("管理员"),
    tl("主体"),
    tl("币种"),
    tl("供应商"),
    tl("检查"),
  ] as const
  const titles = [
    tl("设置管理员与登录"),
    tl("添加企业主体"),
    tl("币种与时区"),
    tl("添加首个供应商账号"),
    tl("完成检查"),
  ] as const
  const [step, setStep] = useState(0)
  const [checked, setChecked] = useState(false)
  const checks = [
    [tl("数据库"), tl("已连接")],
    [tl("对象存储"), tl("已连接")],
    [tl("密钥环"), tl("已加载")],
    [tl("任务队列与调度"), tl("运行正常")],
  ] as const
  const body = [
    <>
      <TextField label={tl("管理员姓名")} placeholder={tl("请输入姓名")} />
      <TextField
        label={tl("管理员邮箱")}
        defaultValue="admin@starriver.example.test"
        hint={tl("首个系统管理员，由部署方提供")}
      />
      <TextField
        label={tl("初始密码")}
        type="password"
        hint={tl("至少 12 位；首次登录后须再次修改，并绑定动态口令")}
      />
      <Tip>{tl("动态口令在首次登录时绑定，不在这个向导里设置。")}</Tip>
    </>,
    <>
      <TextField
        label={tl("主体名称")}
        defaultValue={tl("星河科技（上海）有限公司")}
      />
      <TextField
        label={tl("税号")}
        placeholder={tl("用于开票抬头；保存后默认脱敏")}
      />
      <TextField
        label={tl("开票抬头")}
        defaultValue={tl("星河科技（上海）有限公司")}
        hint={tl("默认与主体名称一致，可修改")}
      />
    </>,
    <>
      <TextField label={tl("默认币种")} defaultValue={tl("CNY 人民币")} />
      <TextField label={tl("默认时区")} defaultValue={tl("UTC+8 北京")} />
      <TextField
        label={tl("汇率来源")}
        defaultValue={tl("中国人民银行中间价")}
        hint={tl("仅用于导出时可选折算；可在「币种汇率」调整")}
      />
    </>,
    <Tip>{tl("登录后在账号管理添加供应商账号。")}</Tip>,
    checked ? (
      <HelpList items={checks} />
    ) : (
      <HelpList
        items={[
          [tl("完成检查"), tl("检查数据库、对象存储、密钥环及任务依赖。")],
        ]}
      />
    ),
  ]
  return (
    <Screen>
      <Steps current={step} labels={labels} />
      <Heading title={titles[step]!}>
        {tl(
          "首次部署的初始化向导；完成后前往登录。以上设置之后都可以在系统里调整。"
        )}
      </Heading>
      {body[step]}
      <Actions>
        {step < 4 ? (
          <Button
            type="button"
            size="default"
            className="base-wide"
            onClick={() => setStep(step + 1)}
          >
            {step === 3 ? tl("跳过") : tl("下一步")}
          </Button>
        ) : checked ? (
          <GoButton to="login" primary>
            {tl("完成并前往登录")}
          </GoButton>
        ) : (
          <Button
            type="button"
            size="default"
            className="base-wide"
            onClick={() => setChecked(true)}
          >
            {tl("运行检查")}
          </Button>
        )}
      </Actions>
    </Screen>
  )
}

const ChangePassword = () => {
  const tl = useUiText()
  return (
    <Screen>
      <Heading title={tl("设置新密码")}>
        {tl("管理员重置或首次登录后须设置新密码；也可主动修改。")}
      </Heading>
      <TextField label={tl("新密码")} type="password" hint={tl(rules)} />
      <TextField label={tl("确认新密码")} type="password" />
      <GoButton to="login" primary>
        {tl("保存并继续")}
      </GoButton>
    </Screen>
  )
}

/* ---- 个人安全与二次验证 ---- */

function SecurityStatus({
  required,
  bound,
}: {
  required: boolean
  bound: boolean
}) {
  const tl = useUiText()

  return (
    <Screen>
      <StatusIcon
        icon={bound ? SolarVerifiedCheck : SolarShieldAlert}
        tone={bound ? "default" : "warning"}
      />
      <div className="base-tag">
        <Badge variant={required ? "blue" : "gray"}>
          {required ? tl("管理员要求") : tl("自行选择")}
        </Badge>
      </div>
      <Heading title={bound ? tl("动态口令已启用") : tl("动态口令未启用")}>
        {required
          ? tl(
              "系统管理员要求启用动态口令。登录和高风险操作需使用验证器 App，无法自行关闭。"
            )
          : bound
            ? tl("登录和高风险操作将验证动态口令。请妥善保管验证器设备。")
            : tl(
                "当前可使用密码登录。启用动态口令后，登录与高风险操作将增加一道验证。"
              )}
      </Heading>
      <Actions>
        <GoButton to={bound ? "pv_b" : "pv_u"} primary>
          {bound ? tl("重新绑定动态口令") : tl("启用动态口令")}
        </GoButton>
        {bound && !required && (
          <GoButton to="pdis">{tl("关闭动态口令")}</GoButton>
        )}
        <GoButton to="pchpw">{tl("修改登录密码")}</GoButton>
        <GoButton to="close">{tl("返回控制台")}</GoButton>
      </Actions>
    </Screen>
  )
}

const VerifyUnbound = () => {
  const tl = useUiText()
  return (
    <Screen>
      <Heading title={tl("验证当前身份")}>
        {tl("请输入当前密码确认身份，之后使用验证器 App 扫码启用动态口令。")}
      </Heading>
      <TextField label={tl("当前密码")} type="password" />
      <GoButton to="penroll" primary>
        {tl("继续，显示绑定密钥")}
      </GoButton>
    </Screen>
  )
}

const VerifyBound = () => {
  const tl = useUiText()
  return (
    <Screen>
      <Heading title={tl("验证当前身份")}>
        {tl(
          "请输入当前密码与当前动态口令。验证后才能开始重新绑定；完成前旧设备仍然有效。"
        )}
      </Heading>
      <TextField label={tl("当前密码")} type="password" />
      <OtpField />
      <GoButton to="penroll" primary>
        {tl("继续，显示绑定密钥")}
      </GoButton>
    </Screen>
  )
}

const Enroll = () => {
  const tl = useUiText()
  return (
    <Screen>
      <Heading title={tl("启用动态口令")}>
        {tl(
          "使用验证器 App 扫码或输入本次密钥，再填写 6 位动态口令。离开此流程将取消本次启用。"
        )}
      </Heading>
      <QrBlock />
      <OtpField />
      <GoButton to="psec_b" primary>
        {tl("验证并启用")}
      </GoButton>
    </Screen>
  )
}

const Disable = () => {
  const tl = useUiText()
  return (
    <Screen>
      <Heading title={tl("关闭动态口令")}>
        {tl(
          "关闭后登录仅使用密码，高风险操作将重新验证当前密码。确认后，其他设备将退出登录。"
        )}
      </Heading>
      <TextField label={tl("当前密码")} type="password" />
      <OtpField />
      <GoButton to="psec_u" primary>
        {tl("确认关闭动态口令")}
      </GoButton>
    </Screen>
  )
}

const ChangeOwnPassword = () => {
  const tl = useUiText()
  return (
    <Screen>
      <Heading title={tl("修改登录密码")}>
        {tl("修改密码前需要二次验证；完成后其他设备将退出登录。")}
      </Heading>
      <TextField label={tl("当前密码")} type="password" />
      <TextField label={tl("新密码")} type="password" hint={tl(rules)} />
      <TextField label={tl("确认新密码")} type="password" />
      <GoButton to="pchpwok" primary>
        {tl("验证并修改密码")}
      </GoButton>
    </Screen>
  )
}

const ChangedOwnPassword = () => {
  const tl = useUiText()
  return (
    <Screen>
      <StatusIcon icon={SolarCircleCheck} tone="success" />
      <Heading title={tl("密码已修改")}>
        {tl("当前会话保留，其他设备已退出登录。")}
      </Heading>
      <GoButton to="psec_b" primary>
        {tl("返回个人安全页")}
      </GoButton>
    </Screen>
  )
}

const StepPassword = ({ code }: { code: boolean }) => {
  const tl = useUiText()
  return (
    <Screen>
      {stepOp(
        tl,
        tl("修改登录密码"),
        tl("修改登录密码 · 当前账号"),
        code
          ? tl("请输入验证器 App 中的 6 位动态口令确认；")
          : tl("请重新输入当前密码确认；")
      )}
      {code ? (
        <OtpField />
      ) : (
        <TextField label={tl("当前密码")} type="password" />
      )}
      <GoButton to="pchpw" primary>
        {tl("验证并继续")}
      </GoButton>
      <Links
        items={[
          [tl("取消操作"), "pchpw"],
          [
            code ? tl("动态口令丢失？") : tl("忘记密码？"),
            code ? "lost" : "forgot",
          ],
        ]}
      />
    </Screen>
  )
}

const StepUpPassword = () => {
  const tl = useUiText()
  return (
    <Screen>
      {stepOp(
        tl,
        tl("更换账号凭据"),
        tl("更换凭据 · 阿里云 · 生产账号"),
        tl("请重新输入当前密码确认；")
      )}
      <TextField label={tl("当前密码")} type="password" />
      <GoButton to="close" primary>
        {tl("验证并继续")}
      </GoButton>
      <Links
        items={[
          [tl("取消操作"), "close"],
          [tl("忘记密码？"), "forgot"],
        ]}
      />
    </Screen>
  )
}

/* ---- 会话与异常 ---- */

const NoData = () => {
  const tl = useUiText()
  return (
    <Screen>
      <StatusIcon icon={SolarInbox} />
      <Heading title={tl("暂无可见的企业主体")}>
        {tl(
          "你的账号尚未被授权任何企业主体。请联系系统管理员分配数据范围后重新登录。"
        )}
      </Heading>
      <Account />
      <GoButton to="login" primary>
        {tl("返回登录")}
      </GoButton>
    </Screen>
  )
}

const Expired = () => {
  const tl = useUiText()
  return (
    <Screen>
      <StatusIcon icon={SolarClock3} tone="warning" />
      <Heading title={tl("登录已过期")}>
        {tl(
          "为了账号安全，长时间未操作会自动退出。你刚才未保存的修改已暂存在本机，重新登录后可继续。"
        )}
      </Heading>
      <GoButton to="login" primary>
        {tl("重新登录")}
      </GoButton>
    </Screen>
  )
}

const Forbidden = () => {
  const tl = useUiText()
  return (
    <Screen>
      <StatusIcon icon={SolarEyeClosed} tone="danger" />
      <ErrorCode>403</ErrorCode>
      <Heading title={tl("没有访问权限")}>
        {tl("你的角色无法查看此页面。如需访问，请联系系统管理员调整角色权限。")}
      </Heading>
      <KeyValue
        rows={[
          [tl("页面"), tl("系统 › 操作审计")],
          [tl("需要权限"), tl("操作审计：查看")],
          [tl("当前角色"), tl("供应商对接")],
        ]}
      />
      <Actions>
        <GoButton to="close">{tl("返回上一页")}</GoButton>
        <GoButton to="close" primary>
          {tl("回到总览")}
        </GoButton>
      </Actions>
    </Screen>
  )
}

const NotFound = () => {
  const tl = useUiText()
  return (
    <Screen>
      <StatusIcon icon={SolarSearch} />
      <ErrorCode>404</ErrorCode>
      <Heading title={tl("页面不存在")}>
        {tl(
          "链接可能已失效，或页面已被移动。可以回到总览，或用顶部搜索（⌘K）查找。"
        )}
      </Heading>
      <Actions>
        <GoButton to="close">{tl("返回上一页")}</GoButton>
        <GoButton to="close" primary>
          {tl("回到总览")}
        </GoButton>
      </Actions>
    </Screen>
  )
}

const ServerError = () => {
  const tl = useUiText()
  return (
    <Screen>
      <StatusIcon icon={SolarTriangleAlert} tone="danger" />
      <ErrorCode>500</ErrorCode>
      <Heading title={tl("服务暂时异常")}>
        {tl(
          "我们已记录这次错误，请稍后重试。如果问题持续，请把错误编号发给技术支持。"
        )}
      </Heading>
      <ErrorId id="ERR-20261103-7F3A91" />
      <Actions>
        <GoButton to="e500" primary>
          {tl("刷新重试")}
        </GoButton>
        <GoButton to="close">{tl("回到总览")}</GoButton>
      </Actions>
    </Screen>
  )
}

const Maintenance = () => {
  const tl = useUiText()
  return (
    <Screen>
      <StatusIcon icon={SolarCog} tone="warning" />
      <Heading title={tl("系统维护中")}>
        {tl(
          "我们正在升级系统，期间后台暂不可用；已在运行的采集任务不受影响，恢复后自动继续。"
        )}
      </Heading>
      <KeyValue
        rows={[
          [tl("开始"), "2026-11-08 02:00"],
          [tl("预计恢复"), "2026-11-08 03:00"],
        ]}
      />
      <GoButton to="maint" primary>
        {tl("刷新状态")}
      </GoButton>
    </Screen>
  )
}

/* ---- 目录 ---- */

export type ScreenDef = {
  key: string
  title: string
  summary: string
  icon: AppIconComponent
  Component: () => ReactNode
}

const screen = (
  key: string,
  title: string,
  summary: string,
  icon: AppIconComponent,
  Component: () => ReactNode
): ScreenDef => ({ key, title, summary, icon, Component })

export const screens: Record<string, ScreenDef> = Object.fromEntries(
  [
    screen(
      "login",
      "登录",
      "邮箱密码 → 动态口令；可使用企业 SSO",
      SolarCheck,
      Login
    ),
    screen(
      "forgot",
      "找回密码",
      "输入登录邮箱，发送重置链接（30 分钟内有效、单次使用）",
      SolarMail,
      Forgot
    ),
    screen(
      "forgots",
      "查收邮件",
      "统一提示，不透露邮箱是否已注册",
      SolarMail,
      ForgotSent
    ),
    screen(
      "reset",
      "设置新密码",
      "通过邮件链接设置新密码，其他设备退出登录",
      SolarCog,
      Reset
    ),
    screen(
      "resetx",
      "重置链接失效",
      "链接过期或已使用，重新获取",
      SolarClock3,
      ResetExpired
    ),
    screen(
      "resetok",
      "密码已重置",
      "重置完成，提示使用新密码登录",
      SolarCircleCheck,
      ResetDone
    ),
    screen(
      "totp",
      "重新绑定动态口令",
      "更换设备时重新绑定",
      SolarVerifiedCheck,
      Rebind
    ),
    screen(
      "community",
      "选择企业主体",
      "多主体账号登录后选择",
      SolarBuildings2,
      ChooseEntity
    ),
    screen(
      "stepup",
      "二次验证",
      "高风险操作前的二次验证",
      SolarShieldAlert,
      StepUp
    ),
    screen(
      "lost",
      "无法登录",
      "无法登录的处理指引（不提供自助找回）",
      SolarSearch,
      Lost
    ),
    screen("disabled", "账号已停用", "被管理员停用", SolarUserCross, Disabled),
    screen(
      "setup",
      "首次部署向导",
      "管理员与 SSO → 主体 → 币种 → 首个供应商 → 完成检查",
      SolarArchive,
      Setup
    ),
    screen(
      "chpw",
      "设置新密码",
      "管理员重置或首次登录后须设置新密码；也可主动修改",
      SolarCog,
      ChangePassword
    ),
    screen(
      "psec_u",
      "动态口令未启用（可选）",
      "可选策略下尚未绑定：启用、修改密码、返回",
      SolarShieldAlert,
      () => <SecurityStatus required={false} bound={false} />
    ),
    screen(
      "psec_b",
      "动态口令已启用（可选）",
      "可选策略下已绑定：重新绑定、关闭、修改密码",
      SolarVerifiedCheck,
      () => <SecurityStatus required={false} bound />
    ),
    screen(
      "psec_r",
      "动态口令已启用（管理员要求）",
      "管理员要求且已绑定：无「关闭」入口",
      SolarVerifiedCheck,
      () => <SecurityStatus required bound />
    ),
    screen(
      "psec_ru",
      "动态口令未启用（管理员要求）",
      "管理员要求但尚未绑定：必须启用",
      SolarShieldAlert,
      () => <SecurityStatus required bound={false} />
    ),
    screen(
      "pv_u",
      "验证当前密码",
      "启用前先验证当前密码",
      SolarCog,
      VerifyUnbound
    ),
    screen(
      "pv_b",
      "验证密码与口令",
      "重新绑定前验证密码与当前动态口令",
      SolarCog,
      VerifyBound
    ),
    screen(
      "penroll",
      "绑定动态口令",
      "扫码或输入密钥，再填 6 位口令",
      SolarVerifiedCheck,
      Enroll
    ),
    screen(
      "pdis",
      "关闭动态口令",
      "密码加动态口令确认关闭，其他设备退出",
      SolarShieldAlert,
      Disable
    ),
    screen(
      "pchpw",
      "修改登录密码",
      "自助修改密码，需二次验证",
      SolarCog,
      ChangeOwnPassword
    ),
    screen(
      "pchpwok",
      "密码已修改",
      "当前会话保留，其他设备退出",
      SolarCircleCheck,
      ChangedOwnPassword
    ),
    screen(
      "pstep",
      "二次验证（动态口令）",
      "已绑定动态口令时，改密前的二次验证",
      SolarShieldAlert,
      () => <StepPassword code />
    ),
    screen(
      "pstepp",
      "二次验证（密码）",
      "未绑定动态口令时，改用当前密码二次验证",
      SolarShieldAlert,
      () => <StepPassword code={false} />
    ),
    screen(
      "stepupp",
      "二次验证（无口令账号）",
      "无动态口令的账号，用当前密码做二次验证",
      SolarShieldAlert,
      StepUpPassword
    ),
    screen("nodata", "无可见主体", "未被授权任何主体", SolarInbox, NoData),
    screen(
      "expired",
      "登录已过期",
      "长时间未操作自动退出",
      SolarClock3,
      Expired
    ),
    screen(
      "e403",
      "403 无权限",
      "角色无权访问，显示所需权限",
      SolarEyeClosed,
      Forbidden
    ),
    screen(
      "e404",
      "404 页面不存在",
      "链接失效 / 页面被移动",
      SolarSearch,
      NotFound
    ),
    screen(
      "e500",
      "500 服务异常",
      "服务异常，含错误编号",
      SolarTriangleAlert,
      ServerError
    ),
    screen(
      "maint",
      "系统维护中",
      "计划维护，显示恢复时间",
      SolarCog,
      Maintenance
    ),
  ].map((item) => [item.key, item])
)

export const screenGroups = [
  {
    slug: "login",
    title: "登录与账号",
    description: "登录、找回密码、动态口令、选择企业主体、二次验证与首次部署。",
    keys: [
      "login",
      "forgot",
      "forgots",
      "reset",
      "resetx",
      "resetok",
      "totp",
      "community",
      "stepup",
      "lost",
      "disabled",
      "setup",
      "chpw",
    ],
  },
  {
    slug: "security",
    title: "个人安全与二次验证",
    description: "动态口令的启用、重新绑定、关闭，以及自助改密和二次验证。",
    keys: [
      "psec_u",
      "psec_b",
      "psec_r",
      "psec_ru",
      "pv_u",
      "pv_b",
      "penroll",
      "pdis",
      "pchpw",
      "pchpwok",
      "pstep",
      "pstepp",
      "stepupp",
    ],
  },
  {
    slug: "session",
    title: "会话与异常",
    description: "未授权、登录过期、权限不足、页面不存在、服务异常与系统维护。",
    keys: ["nodata", "expired", "e403", "e404", "e500", "maint"],
  },
] as const
