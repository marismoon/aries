import { toast } from "sonner"

import { AppIcon, SolarBell, SolarClock3 } from "@marismoon/ui/icons"
import { FrostCard } from "@marismoon/ui/shared/FrostCard"
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
  notificationsActions,
  useNotificationsStore,
  type UserNotificationPreferences,
} from "@/shared/mocks/notifications-store"
import {
  getCurrentMember,
  useWorkspaceStore,
} from "@/shared/mocks/workspace-store"

import "../settings/basic-info/basic-info.css"
import "./notifications.css"

const categoryRows: readonly {
  title: string
  description: string
  inAppKey: keyof UserNotificationPreferences
  emailKey: keyof UserNotificationPreferences
}[] = [
  {
    title: "成本与预算预警",
    description: "部门预算超限、账单差异超阈值与周环比费用异常波动",
    inAppKey: "costInApp",
    emailKey: "costEmail",
  },
  {
    title: "云账号与采集任务",
    description: "云厂商凭证即将过期、账单采集失败与重试超时提醒",
    inAppKey: "cloudInApp",
    emailKey: "cloudEmail",
  },
  {
    title: "安全与权限审计",
    description: "异常出口 IP 登录拦截、高敏权限调整与 2FA 合规催办",
    inAppKey: "securityInApp",
    emailKey: "securityEmail",
  },
  {
    title: "系统公告与对账归档",
    description: "月度自动对账完成、报表生成通知与例行维护公告",
    inAppKey: "systemInApp",
    emailKey: "systemEmail",
  },
]

export function NotificationPreferencesPage() {
  const tl = useUiText()
  const { preferences } = useNotificationsStore()
  const workspace = useWorkspaceStore()
  const currentMember = getCurrentMember(workspace)

  function updatePref(patch: Partial<UserNotificationPreferences>) {
    notificationsActions.updatePreferences(patch)
    toast.success(tl("已保存个人通知偏好"))
  }

  return (
    <div className="grid gap-4">
      <FrostCard className="basic-card">
        <header className="basic-card-header">
          <span className="basic-card-icon">
            <AppIcon icon={SolarBell} size={16} aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h2>{tl("个人订阅频道")}</h2>
            <p>
              {tl(
                "当前账号：{{name}}（{{email}}），控制右上角铃铛与邮件的接收范围。",
                {
                  name: tl(currentMember?.name ?? "张敏"),
                  email: currentMember?.email ?? "zhangmin@aries.example",
                }
              )}
            </p>
          </div>
        </header>

        <div className="basic-rows">
          {categoryRows.map((row) => (
            <div key={row.title} className="basic-row">
              <div className="basic-row-text">
                <b>{tl(row.title)}</b>
                <small>{tl(row.description)}</small>
              </div>
              <div className="basic-row-control flex items-center gap-4">
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{tl("站内铃铛")}</span>
                  <Switch
                    checked={Boolean(preferences[row.inAppKey])}
                    onCheckedChange={(checked) =>
                      updatePref({ [row.inAppKey]: checked })
                    }
                    aria-label={`${tl(row.title)} ${tl("站内铃铛")}`}
                  />
                </label>
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{tl("邮件")}</span>
                  <Switch
                    checked={Boolean(preferences[row.emailKey])}
                    onCheckedChange={(checked) =>
                      updatePref({ [row.emailKey]: checked })
                    }
                    aria-label={`${tl(row.title)} ${tl("邮件")}`}
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      </FrostCard>

      <FrostCard className="basic-card">
        <header className="basic-card-header">
          <span className="basic-card-icon">
            <AppIcon icon={SolarClock3} size={16} aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h2>{tl("免打扰与汇总偏好")}</h2>
            <p>
              {tl(
                "在非工作时段暂缓一般级别提醒，严重安全与预算告警仍即时触达。"
              )}
            </p>
          </div>
        </header>

        <div className="basic-rows">
          <div className="basic-row">
            <div className="basic-row-text">
              <b>{tl("浏览器桌面推送")}</b>
              <small>
                {tl("在标签页后台运行时弹出系统级高优先级告警通知")}
              </small>
            </div>
            <div className="basic-row-control">
              <Switch
                checked={preferences.desktopPush}
                onCheckedChange={(checked) =>
                  updatePref({ desktopPush: checked })
                }
                aria-label={tl("浏览器桌面推送")}
              />
            </div>
          </div>

          <div className="basic-row">
            <div className="basic-row-text">
              <b>{tl("每日晨间告警摘要")}</b>
              <small>
                {tl("每个工作日 09:00 汇总昨日未解决告警与预算变化发送至邮箱")}
              </small>
            </div>
            <div className="basic-row-control">
              <Switch
                checked={preferences.dailyDigest}
                onCheckedChange={(checked) =>
                  updatePref({ dailyDigest: checked })
                }
                aria-label={tl("每日晨间告警摘要")}
              />
            </div>
          </div>

          <div className="basic-row">
            <div className="basic-row-text">
              <b>{tl("夜间免打扰模式")}</b>
              <small>
                {tl("在选定时段内仅静默重要与一般级别提醒，严重告警不受影响")}
              </small>
            </div>
            <div className="basic-row-control flex items-center gap-3">
              <Select
                value={preferences.quietRange}
                onValueChange={(value) => updatePref({ quietRange: value })}
                disabled={!preferences.quietModeEnabled}
              >
                <SelectTrigger aria-label={tl("免打扰时段")} className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" align="end">
                  <SelectItem value="22:00–08:00">22:00–08:00</SelectItem>
                  <SelectItem value="23:00–08:30">23:00–08:30</SelectItem>
                  <SelectItem value="20:00–09:00">20:00–09:00</SelectItem>
                </SelectContent>
              </Select>
              <Switch
                checked={preferences.quietModeEnabled}
                onCheckedChange={(checked) =>
                  updatePref({ quietModeEnabled: checked })
                }
                aria-label={tl("夜间免打扰模式")}
              />
            </div>
          </div>
        </div>
      </FrostCard>
    </div>
  )
}
