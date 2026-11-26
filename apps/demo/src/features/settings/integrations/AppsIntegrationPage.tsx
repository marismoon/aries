import { useState, type FormEvent } from "react"
import { toast } from "sonner"

import { useIsMobile } from "@marismoon/ui/hooks/use-mobile"
import {
  AppIcon,
  SolarCloud,
  SolarCog,
  SolarLink,
  SolarRefreshCcw,
} from "@marismoon/ui/icons"
import { FrostCard } from "@marismoon/ui/shared/FrostCard"
import { StatusBadge } from "@marismoon/ui/shared/StatusBadge"
import { Button } from "@marismoon/ui/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@marismoon/ui/ui/drawer"
import { Field, FieldLabel } from "@marismoon/ui/ui/field"
import { Input } from "@marismoon/ui/ui/input"
import { Switch } from "@marismoon/ui/ui/switch"
import { Tip } from "@/features/settings/base-pages/ui"
import { useUiText } from "@/lib/i18n/use-ui-text"
import {
  useWorkspaceStore,
  workspaceActions,
} from "@/shared/mocks/workspace-store"
import type { IntegrationItem } from "@/shared/types/workspace-settings"

import "../../bills/components/bill-drawer.css"
import "../basic-info/basic-info.css"

const statusMeta: Record<
  IntegrationItem["status"],
  { label: string; tone: "success" | "warning" | "neutral" }
> = {
  connected: { label: "已连接", tone: "success" },
  warning: { label: "凭证即将过期", tone: "warning" },
  disconnected: { label: "未启用", tone: "neutral" },
}

const categoryLabels = {
  cloud: "云厂商账单",
  collab: "协同与通知",
  identity: "身份认证",
} as const

export function AppsIntegrationPage() {
  const tl = useUiText()
  const mobile = useIsMobile()
  const store = useWorkspaceStore()

  const [categoryFilter, setCategoryFilter] = useState<
    "all" | "cloud" | "collab" | "identity"
  >("all")
  const [activeId, setActiveId] = useState<string | null>(null)
  const [endpointDraft, setEndpointDraft] = useState("")
  const [appIdDraft, setAppIdDraft] = useState("")

  const items =
    categoryFilter === "all"
      ? store.integrations
      : store.integrations.filter((item) => item.category === categoryFilter)

  const activeItem =
    store.integrations.find((item) => item.id === activeId) ?? null

  function openConfig(id: string) {
    const found = store.integrations.find((item) => item.id === id)
    if (!found) return
    setActiveId(id)
    setEndpointDraft(found.endpoint)
    setAppIdDraft(found.appId)
  }

  function handleSaveConfig(event: FormEvent) {
    event.preventDefault()
    if (!activeItem) return
    workspaceActions.updateIntegration(activeItem.id, {
      endpoint: endpointDraft.trim() || activeItem.endpoint,
      appId: appIdDraft.trim() || activeItem.appId,
      enabled: true,
      status: "connected",
    })
    toast.success(
      tl("已保存「{{name}}」集成配置", { name: tl(activeItem.name) })
    )
    setActiveId(null)
  }

  function handleTestConnection() {
    if (!activeItem) return
    const now = new Date()
    const pad = (n: number) => String(n).padStart(2, "0")
    const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
    workspaceActions.updateIntegration(activeItem.id, {
      status: "connected",
      enabled: true,
      lastSyncAt: stamp,
    })
    toast.success(
      tl("{{name}} 模拟连通性测试通过", {
        name: tl(activeItem.name),
      })
    )
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {(["all", "cloud", "collab", "identity"] as const).map((cat) => (
          <Button
            key={cat}
            type="button"
            size="dense"
            shape="workspace"
            variant={categoryFilter === cat ? "default" : "outline"}
            onClick={() => setCategoryFilter(cat)}
          >
            {cat === "all" ? tl("全部应用") : tl(categoryLabels[cat])}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          const meta = statusMeta[item.status]
          return (
            <FrostCard key={item.id} className="basic-card flex flex-col gap-3">
              <header className="basic-card-header">
                <span className="basic-card-icon">
                  <AppIcon
                    icon={item.category === "cloud" ? SolarCloud : SolarLink}
                    size={16}
                    aria-hidden="true"
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <h2>{tl(item.name)}</h2>
                  <p>{tl(categoryLabels[item.category])}</p>
                </div>
                <Switch
                  checked={item.enabled}
                  onCheckedChange={(checked) => {
                    workspaceActions.updateIntegration(item.id, {
                      enabled: checked,
                      status: checked ? "connected" : "disconnected",
                    })
                    toast.success(
                      checked
                        ? tl("已启用「{{name}}」集成", {
                            name: tl(item.name),
                          })
                        : tl("已停用「{{name}}」集成", {
                            name: tl(item.name),
                          })
                    )
                  }}
                  aria-label={tl("切换 {{name}} 启用状态", {
                    name: tl(item.name),
                  })}
                />
              </header>

              <p className="min-h-9 text-xs leading-relaxed text-muted-foreground">
                {tl(item.description)}
              </p>

              <div className="mt-auto flex items-center justify-between gap-2 border-t border-(--border-subtle) pt-3">
                <div className="flex flex-col gap-1">
                  <StatusBadge tone={meta.tone}>{tl(meta.label)}</StatusBadge>
                  <span className="text-[11px] text-muted-foreground financial-number">
                    {tl("最近同步")} {item.lastSyncAt}
                  </span>
                </div>
                <Button
                  type="button"
                  size="small"
                  variant="outline"
                  onClick={() => openConfig(item.id)}
                >
                  <AppIcon
                    icon={SolarCog}
                    data-icon="inline-start"
                    aria-hidden
                  />
                  {tl("配置")}
                </Button>
              </div>
            </FrostCard>
          )
        })}
      </div>

      <Drawer
        open={activeItem !== null}
        onOpenChange={(open) => {
          if (!open) setActiveId(null)
        }}
        direction={mobile ? "bottom" : "right"}
        noBodyStyles
      >
        <DrawerContent>
          {activeItem && (
            <>
              <DrawerHeader>
                <DrawerTitle>{tl(activeItem.name)}</DrawerTitle>
                <DrawerDescription>
                  {tl(activeItem.description)}
                </DrawerDescription>
              </DrawerHeader>
              <form
                id="integration-config-form"
                onSubmit={handleSaveConfig}
                className="bill-drawer-body grid min-h-0 flex-1 content-start gap-4 overflow-y-auto px-4"
                data-vaul-no-drag=""
              >
                <Field>
                  <FieldLabel htmlFor="int-endpoint">
                    {tl("服务接口地址")}
                  </FieldLabel>
                  <Input
                    id="int-endpoint"
                    controlSize="dense"
                    value={endpointDraft}
                    onChange={(e) => setEndpointDraft(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="int-app-id">
                    {tl("应用标识 / App ID")}
                  </FieldLabel>
                  <Input
                    id="int-app-id"
                    controlSize="dense"
                    className="financial-number"
                    value={appIdDraft}
                    onChange={(e) => setAppIdDraft(e.target.value)}
                  />
                </Field>
                <Tip>{tl("集成配置仅保存在本地。")}</Tip>
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    size="small"
                    onClick={handleTestConnection}
                  >
                    <AppIcon
                      icon={SolarRefreshCcw}
                      data-icon="inline-start"
                      aria-hidden
                    />
                    {tl("模拟测试连通性")}
                  </Button>
                </div>
              </form>
              <DrawerFooter>
                <Button type="submit" form="integration-config-form">
                  {tl("保存配置")}
                </Button>
                <DrawerClose asChild>
                  <Button type="button" variant="outline">
                    {tl("关闭")}
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  )
}
