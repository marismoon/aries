import { useState, type FormEvent } from "react"
import { useNavigate, useSearchParams } from "react-router"
import { toast } from "sonner"

import { useDarkGlass } from "@marismoon/ui/hooks/use-backdrop-canvas"
import { AppIcon, SolarCircleCheck, SolarUser } from "@marismoon/ui/icons"
import { AriesMagicRings } from "@marismoon/ui/shared/AriesMagicRings"
import { BrandPaletteControl } from "@marismoon/ui/shared/BrandPaletteControl"
import { DarkStyleControl } from "@marismoon/ui/shared/DarkStyleControl"
import { StatusBadge } from "@marismoon/ui/shared/StatusBadge"
import { ThemeSwitcher } from "@marismoon/ui/shared/ThemeSwitcher"
import { Button } from "@marismoon/ui/ui/button"
import { Field, FieldLabel } from "@marismoon/ui/ui/field"
import { Input } from "@marismoon/ui/ui/input"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@marismoon/ui/ui/input-otp"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@marismoon/ui/ui/item"
import { Switch } from "@marismoon/ui/ui/switch"
import {
  Actions,
  Brand,
  Heading,
  HelpList,
  ScreenCard,
  StatusIcon,
} from "@/features/settings/base-pages/ui"
import { useUiText } from "@/lib/i18n/use-ui-text"
import {
  useWorkspaceStore,
  workspaceActions,
} from "@/shared/mocks/workspace-store"

import "@/features/settings/base-pages/base-pages.css"

const presetMemberIds = ["mem-01", "mem-02", "mem-04"] as const

type AuthView = "credentials" | "otp" | "forgot" | "forgot-sent" | "lost"

export function LoginPage() {
  const tl = useUiText()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const store = useWorkspaceStore()
  const darkGlass = useDarkGlass()

  const [view, setView] = useState<AuthView>("credentials")
  const [email, setEmail] = useState("zhangmin@aries.example")
  const [password, setPassword] = useState("Aries@2026")
  const [requireOtp, setRequireOtp] = useState(true)
  const [otp, setOtp] = useState("123456")

  const rawRedirect = searchParams.get("redirect")
  const destination =
    rawRedirect && rawRedirect.startsWith("/") && !rawRedirect.startsWith("//")
      ? rawRedirect
      : "/overview"

  function completeSignIn(
    memberId?: string,
    authMethod: "password" | "password+2fa" | "sso" = requireOtp
      ? "password+2fa"
      : "password"
  ) {
    const result = workspaceActions.signIn({ memberId, email, authMethod })
    if (result !== "signed-in") {
      toast.error(result === "disabled" ? tl("账号已停用") : tl("账号不存在"))
      return
    }
    toast.success(tl("已进入演示工作区"))
    void navigate(destination, { replace: true })
  }

  function handleCredentialsSubmit(event: FormEvent) {
    event.preventDefault()
    if (!email.trim() || !password.trim()) {
      toast.error(tl("请输入邮箱与密码"))
      return
    }
    if (requireOtp) {
      setView("otp")
      return
    }
    completeSignIn(undefined, "password")
  }

  function handleOtpSubmit(event: FormEvent) {
    event.preventDefault()
    if (!/^\d{6}$/.test(otp)) {
      toast.error(tl("请输入 6 位动态验证码"))
      return
    }
    completeSignIn(undefined, "password+2fa")
  }

  function handleForgotSubmit(event: FormEvent) {
    event.preventDefault()
    if (!email.trim()) {
      toast.error(tl("请输入邮箱"))
      return
    }
    setView("forgot-sent")
  }

  const presetAccounts = presetMemberIds
    .map((id) => {
      const member = store.members.find((m) => m.id === id)
      const role = store.roles.find((r) => r.id === member?.roleId)
      return member ? { member, roleName: role?.name ?? "" } : null
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)

  return (
    <div
      className="base-preview"
      style={darkGlass ? { background: "transparent" } : undefined}
    >
      {darkGlass && <AriesMagicRings />}

      <div className="base-preview-close flex items-center gap-1.5">
        <DarkStyleControl />
        <BrandPaletteControl />
        <ThemeSwitcher />
      </div>

      <div className="base-preview-stage">
        <ScreenCard>
          <Brand />

          {view === "credentials" && (
            <>
              <Heading title={tl("演示登录")} />

              <form onSubmit={handleCredentialsSubmit} className="grid gap-4">
                <Field>
                  <FieldLabel htmlFor="login-email">{tl("邮箱")}</FieldLabel>
                  <Input
                    id="login-email"
                    type="email"
                    controlSize="default"
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@aries.example"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="login-password">{tl("密码")}</FieldLabel>
                  <Input
                    id="login-password"
                    type="password"
                    controlSize="default"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={tl("请输入密码")}
                  />
                </Field>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setView("forgot")}
                  >
                    {tl("忘记密码？")}
                  </Button>
                </div>

                <Item variant="muted" size="sm">
                  <ItemContent>
                    <ItemTitle>{tl("演示二次验证（2FA）步骤")}</ItemTitle>
                  </ItemContent>
                  <ItemActions>
                    <Switch
                      checked={requireOtp}
                      onCheckedChange={setRequireOtp}
                      aria-label={tl("演示二次验证（2FA）步骤")}
                    />
                  </ItemActions>
                </Item>

                <Actions>
                  <Button type="submit" size="default" className="base-wide">
                    {requireOtp ? tl("下一步：二次验证") : tl("登录")}
                  </Button>
                </Actions>
              </form>

              <div className="base-links">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => completeSignIn("mem-01", "sso")}
                >
                  {tl("模拟 SSO 登录")}
                </Button>
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setView("lost")}
                >
                  {tl("无法登录？")}
                </Button>
              </div>

              <div className="grid gap-2 border-t border-(--border-subtle) pt-3">
                <span className="text-xs font-medium text-muted-foreground">
                  {tl("演示身份")}
                </span>
                <ItemGroup className="gap-2">
                  {presetAccounts.map(({ member, roleName }) => (
                    <Item key={member.id} asChild variant="outline" size="sm">
                      <button
                        type="button"
                        className="w-full text-left"
                        onClick={() =>
                          completeSignIn(member.id, "password+2fa")
                        }
                      >
                        <ItemMedia variant="icon">
                          <AppIcon icon={SolarUser} aria-hidden="true" />
                        </ItemMedia>
                        <ItemContent>
                          <ItemTitle>{tl(member.name)}</ItemTitle>
                          <ItemDescription>{member.email}</ItemDescription>
                        </ItemContent>
                        <ItemActions>
                          <StatusBadge tone="info">{tl(roleName)}</StatusBadge>
                        </ItemActions>
                      </button>
                    </Item>
                  ))}
                </ItemGroup>
              </div>
            </>
          )}

          {view === "otp" && (
            <>
              <Heading title={tl("输入演示口令")}>
                {tl("可使用任意 6 位数字。")}
              </Heading>

              <form onSubmit={handleOtpSubmit} className="grid gap-4">
                <Field>
                  <FieldLabel>{tl("动态口令")}</FieldLabel>
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={setOtp}
                    aria-label={tl("动态口令")}
                    containerClassName="justify-center"
                  >
                    <InputOTPGroup className="gap-2">
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <InputOTPSlot key={index} index={index} />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </Field>

                <Actions>
                  <Button type="submit" size="default" className="base-wide">
                    {tl("登录")}
                  </Button>
                </Actions>
              </form>

              <div className="base-links">
                <Button
                  type="button"
                  variant="link"
                  size="xs"
                  onClick={() => setView("credentials")}
                >
                  {tl("返回上一步")}
                </Button>
                <Button
                  type="button"
                  variant="link"
                  size="xs"
                  onClick={() => setView("lost")}
                >
                  {tl("动态口令丢失？")}
                </Button>
              </div>
            </>
          )}

          {view === "forgot" && (
            <>
              <Heading title={tl("模拟找回密码")} />
              <form onSubmit={handleForgotSubmit} className="grid gap-4">
                <Field>
                  <FieldLabel htmlFor="forgot-email">{tl("邮箱")}</FieldLabel>
                  <Input
                    id="forgot-email"
                    type="email"
                    controlSize="default"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@aries.example"
                  />
                </Field>
                <Actions>
                  <Button type="submit" size="default" className="base-wide">
                    {tl("模拟发送重置邮件")}
                  </Button>
                </Actions>
              </form>
              <div className="base-links">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setView("credentials")}
                >
                  {tl("返回登录")}
                </Button>
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setView("lost")}
                >
                  {tl("收不到邮件？")}
                </Button>
              </div>
            </>
          )}

          {view === "forgot-sent" && (
            <>
              <StatusIcon icon={SolarCircleCheck} tone="success" />
              <Heading title={tl("已模拟发送重置邮件")} />
              <Actions>
                <Button
                  type="button"
                  size="default"
                  className="base-wide"
                  onClick={() => setView("credentials")}
                >
                  {tl("返回登录")}
                </Button>
              </Actions>
            </>
          )}

          {view === "lost" && (
            <>
              <Heading title={tl("演示登录帮助")} />
              <HelpList
                items={[
                  [tl("忘记密码"), tl("用演示邮箱体验密码重置。")],
                  [
                    tl("动态口令丢失或换了手机"),
                    tl("演示口令可在登录页重新输入。"),
                  ],
                  [
                    tl("账号无法访问某个主体"),
                    tl("返回登录页可切换演示身份。"),
                  ],
                ]}
              />
              <Actions>
                <Button
                  type="button"
                  size="default"
                  className="base-wide"
                  onClick={() => setView("credentials")}
                >
                  {tl("返回登录")}
                </Button>
              </Actions>
            </>
          )}
        </ScreenCard>
      </div>
    </div>
  )
}
