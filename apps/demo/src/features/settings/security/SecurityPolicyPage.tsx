import { useState, type FormEvent } from "react"
import { toast } from "sonner"

import {
  AppIcon,
  SolarCloseLine,
  SolarGlobal,
  SolarPlus,
  SolarShieldAlert,
  SolarVerifiedCheck,
} from "@marismoon/ui/icons"
import { FrostCard } from "@marismoon/ui/shared/FrostCard"
import { Button } from "@marismoon/ui/ui/button"
import { Input } from "@marismoon/ui/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@marismoon/ui/ui/select"
import { Switch } from "@marismoon/ui/ui/switch"
import { useUiText } from "@/lib/i18n/use-ui-text"
import {
  useWorkspaceStore,
  workspaceActions,
} from "@/shared/mocks/workspace-store"
import { securityPolicySchema } from "@/shared/types/workspace-settings"

import "../basic-info/basic-info.css"

export function SecurityPolicyPage() {
  const tl = useUiText()
  const { securityPolicy } = useWorkspaceStore()

  const [minLength, setMinLength] = useState(
    String(securityPolicy.minPasswordLength)
  )
  const [requireComplexity, setRequireComplexity] = useState(
    securityPolicy.requireComplexity
  )
  const [rotateDays, setRotateDays] = useState(
    String(securityPolicy.passwordRotateDays)
  )
  const [enforceTwoFactor, setEnforceTwoFactor] = useState(
    securityPolicy.enforceTwoFactor
  )
  const [sessionTimeout, setSessionTimeout] = useState(
    String(securityPolicy.sessionTimeoutHours)
  )
  const [singleSession, setSingleSession] = useState(
    securityPolicy.singleSessionOnly
  )
  const [newCidr, setNewCidr] = useState("")

  function savePasswordPolicy(event: FormEvent) {
    event.preventDefault()
    workspaceActions.saveSecurityPolicy(
      {
        minPasswordLength: Number(minLength) || 10,
        requireComplexity,
        passwordRotateDays: Number(rotateDays) || 90,
      },
      tl("密码与轮换策略")
    )
    toast.success(tl("已保存密码策略"))
  }

  function saveSessionPolicy(event: FormEvent) {
    event.preventDefault()
    workspaceActions.saveSecurityPolicy(
      {
        enforceTwoFactor,
        sessionTimeoutHours: Number(sessionTimeout) || 12,
        singleSessionOnly: singleSession,
      },
      tl("二次验证与会话控制")
    )
    toast.success(tl("已保存二次验证与会话策略"))
  }

  function handleAddIp(event: FormEvent) {
    event.preventDefault()
    const cidr = newCidr.trim()
    if (!cidr) return
    if (securityPolicy.ipAllowlist.includes(cidr)) {
      toast.error(tl("该网段已在白名单中"))
      return
    }
    workspaceActions.saveSecurityPolicy(
      { ipAllowlist: [...securityPolicy.ipAllowlist, cidr] },
      tl("IP 白名单")
    )
    setNewCidr("")
    toast.success(tl("已新增办公网白名单"))
  }

  function handleRemoveIp(cidr: string) {
    workspaceActions.saveSecurityPolicy(
      {
        ipAllowlist: securityPolicy.ipAllowlist.filter((item) => item !== cidr),
      },
      tl("IP 白名单")
    )
    toast(tl("已移除白名单网段"))
  }

  return (
    <div className="settings-basic-page">
      <div className="basic-flow">
        <FrostCard className="basic-card">
          <form onSubmit={savePasswordPolicy}>
            <header className="basic-card-header">
              <span className="basic-card-icon">
                <AppIcon icon={SolarShieldAlert} size={16} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <h2>{tl("密码与轮换策略")}</h2>
              </div>
              <div className="basic-card-actions">
                <Button type="submit" size="small">
                  {tl("保存")}
                </Button>
              </div>
            </header>
            <div className="basic-rows">
              <div className="basic-row">
                <label className="basic-row-text" htmlFor="sec-min-len">
                  <b>{tl("密码最小长度")}</b>
                  <small>{tl("建议不少于 10 位字符")}</small>
                </label>
                <div className="basic-row-control" data-width="xs">
                  <Input
                    id="sec-min-len"
                    type="number"
                    min={8}
                    max={32}
                    className="financial-number"
                    value={minLength}
                    onChange={(e) => setMinLength(e.target.value)}
                  />
                </div>
              </div>
              <div className="basic-row">
                <label className="basic-row-text" htmlFor="sec-complexity">
                  <b>{tl("必须包含大小写字母与数字")}</b>
                </label>
                <div className="basic-row-control" data-width="xs">
                  <Switch
                    id="sec-complexity"
                    checked={requireComplexity}
                    onCheckedChange={setRequireComplexity}
                  />
                </div>
              </div>
              <div className="basic-row">
                <label className="basic-row-text" htmlFor="sec-rotate">
                  <b>{tl("密码强制轮换周期（天）")}</b>
                  <small>{tl("设为 0 表示不强制定期更换")}</small>
                </label>
                <div className="basic-row-control" data-width="xs">
                  <Input
                    id="sec-rotate"
                    type="number"
                    min={0}
                    max={365}
                    className="financial-number"
                    value={rotateDays}
                    onChange={(e) => setRotateDays(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </form>
        </FrostCard>

        <FrostCard className="basic-card">
          <form onSubmit={saveSessionPolicy}>
            <header className="basic-card-header">
              <span className="basic-card-icon">
                <AppIcon
                  icon={SolarVerifiedCheck}
                  size={16}
                  aria-hidden="true"
                />
              </span>
              <div className="min-w-0 flex-1">
                <h2>{tl("二次验证与会话控制")}</h2>
              </div>
              <div className="basic-card-actions">
                <Button type="submit" size="small">
                  {tl("保存")}
                </Button>
              </div>
            </header>
            <div className="basic-rows">
              <div className="basic-row">
                <label className="basic-row-text" htmlFor="sec-2fa">
                  <b>{tl("二次验证（2FA）范围")}</b>
                </label>
                <div className="basic-row-control" data-width="sm">
                  <Select
                    value={enforceTwoFactor}
                    onValueChange={(value) => {
                      const result =
                        securityPolicySchema.shape.enforceTwoFactor.safeParse(
                          value
                        )
                      if (result.success) setEnforceTwoFactor(result.data)
                    }}
                  >
                    <SelectTrigger id="sec-2fa" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="optional">{tl("不强制")}</SelectItem>
                      <SelectItem value="admins">
                        {tl("仅管理员强制")}
                      </SelectItem>
                      <SelectItem value="all">{tl("全员强制")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="basic-row">
                <label className="basic-row-text" htmlFor="sec-timeout">
                  <b>{tl("会话超时时间（小时）")}</b>
                </label>
                <div className="basic-row-control" data-width="xs">
                  <Input
                    id="sec-timeout"
                    type="number"
                    min={1}
                    max={168}
                    className="financial-number"
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(e.target.value)}
                  />
                </div>
              </div>
              <div className="basic-row">
                <label className="basic-row-text" htmlFor="sec-single">
                  <b>{tl("仅允许单终端在线")}</b>
                  <small>{tl("新设备登录时自动吊销旧会话令牌")}</small>
                </label>
                <div className="basic-row-control" data-width="xs">
                  <Switch
                    id="sec-single"
                    checked={singleSession}
                    onCheckedChange={setSingleSession}
                  />
                </div>
              </div>
            </div>
          </form>
        </FrostCard>

        <FrostCard className="basic-card">
          <header className="basic-card-header">
            <span className="basic-card-icon">
              <AppIcon icon={SolarGlobal} size={16} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <h2>{tl("IP 白名单")}</h2>
              <p>{tl("限制仅允许指定办公网段或 VPN 出口访问工作区")}</p>
            </div>
          </header>
          <div className="basic-rows">
            <div className="grid gap-3 pt-4">
              <form onSubmit={handleAddIp} className="flex flex-wrap gap-2">
                <Input
                  className="max-w-64 financial-number"
                  value={newCidr}
                  onChange={(e) => setNewCidr(e.target.value)}
                  placeholder="203.0.113.0/24"
                  aria-label={tl("新增白名单网段")}
                />
                <Button type="submit" size="small" variant="outline">
                  <AppIcon
                    icon={SolarPlus}
                    data-icon="inline-start"
                    aria-hidden
                  />
                  {tl("添加网段")}
                </Button>
              </form>

              <ul className="flex flex-wrap gap-2">
                {securityPolicy.ipAllowlist.map((cidr) => (
                  <li
                    key={cidr}
                    className="inline-flex items-center gap-1.5 rounded-full border border-(--border-subtle) bg-(--recess) px-3 py-1 text-xs text-foreground financial-number"
                  >
                    <span>{cidr}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveIp(cidr)}
                      aria-label={tl("移除网段 {{cidr}}", { cidr })}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <AppIcon icon={SolarCloseLine} size={12} aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </FrostCard>
      </div>
    </div>
  )
}
