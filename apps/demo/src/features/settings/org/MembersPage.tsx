import { useId, useMemo, useState, type FormEvent } from "react"
import { useReducedMotion } from "motion/react"
import { button as MotionButton } from "motion/react-m"
import { toast } from "sonner"

import { useIsMobile } from "@marismoon/ui/hooks/use-mobile"
import {
  AppIcon,
  SolarEye,
  SolarPlus,
  SolarSearch,
  SolarUsersGroupRounded,
} from "@marismoon/ui/icons"
import { DataTable } from "@marismoon/ui/shared/DataTable"
import { EmptyState } from "@marismoon/ui/shared/EmptyState"
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
  DialogTrigger,
} from "@marismoon/ui/ui/dialog"
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
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@marismoon/ui/ui/item"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@marismoon/ui/ui/select"
import { Switch } from "@marismoon/ui/ui/switch"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@marismoon/ui/ui/tooltip"
import { useUiText } from "@/lib/i18n/use-ui-text"
import {
  useWorkspaceStore,
  workspaceActions,
} from "@/shared/mocks/workspace-store"
import type {
  DemoMember,
  MemberStatus,
} from "@/shared/types/workspace-settings"
import { SparklineKpiCard } from "../SettingsSummaryVisuals"
import { collectDescendantIds, OrgDepartmentTree } from "./OrgDepartmentTree"
import {
  OrganizationDeleteDialog,
  OrganizationLifecycleActions,
} from "./OrganizationLifecycle"

import "../../bills/components/bill-drawer.css"
import "../../bills/components/bills-controls.css"
import "../../bills/components/bills-table.css"
import "../settings-table.css"
import "./departments-tree.css"

const column = createDataTableColumns<DemoMember>()
const columnAlign = { actions: "end" } as const

const statusTone: Record<
  MemberStatus,
  { label: string; tone: "success" | "info" | "neutral" }
> = {
  active: { label: "正常", tone: "success" },
  invited: { label: "待激活", tone: "info" },
  disabled: { label: "已禁用", tone: "neutral" },
}

export function MembersSummary() {
  const tl = useUiText()
  const store = useWorkspaceStore()

  const total = store.members.length
  const activeCount = store.members.filter((m) => m.status === "active").length
  const invitedCount = store.members.filter(
    (m) => m.status === "invited"
  ).length
  const disabledCount = store.members.filter(
    (m) => m.status === "disabled"
  ).length
  const twoFaActiveCount = store.members.filter(
    (m) => m.status === "active" && m.twoFactorEnabled
  ).length
  const twoFaRate =
    activeCount > 0 ? Math.round((twoFaActiveCount / activeCount) * 100) : 0

  const headcountTrend = [
    { label: "W1", value: Math.max(total - 5, 1) },
    { label: "W2", value: Math.max(total - 4, 1) },
    { label: "W3", value: Math.max(total - 3, 1) },
    { label: "W4", value: Math.max(total - 2, 1) },
    { label: "W5", value: Math.max(total - 1, 1) },
    { label: "W6", value: total },
  ]
  const weeklyLoginTrend = [
    { label: "11/20", value: Math.max(activeCount - 2, 1) },
    { label: "11/21", value: Math.max(activeCount - 1, 1) },
    { label: "11/22", value: Math.max(activeCount - 3, 1) },
    { label: "11/23", value: Math.max(activeCount - 2, 1) },
    { label: "11/24", value: activeCount },
    { label: "11/25", value: Math.max(activeCount - 1, 1) },
    { label: "11/26", value: activeCount },
  ]
  const twoFaTrend = [
    { label: "W1", value: Math.max(twoFaRate - 18, 40) },
    { label: "W2", value: Math.max(twoFaRate - 14, 45) },
    { label: "W3", value: Math.max(twoFaRate - 9, 55) },
    { label: "W4", value: Math.max(twoFaRate - 6, 62) },
    { label: "W5", value: Math.max(twoFaRate - 2, 70) },
    { label: "W6", value: twoFaRate },
  ]
  const pendingTrend = [
    { label: "11/20", value: invitedCount + disabledCount + 2 },
    { label: "11/21", value: invitedCount + disabledCount + 1 },
    { label: "11/22", value: invitedCount + disabledCount + 1 },
    { label: "11/23", value: invitedCount + disabledCount },
    { label: "11/24", value: invitedCount + disabledCount + 1 },
    { label: "11/25", value: invitedCount + disabledCount },
    { label: "11/26", value: invitedCount + disabledCount },
  ]

  return (
    <section
      className="settings-summary-grid"
      data-cols="4"
      aria-label={tl("成员概况")}
    >
      <SparklineKpiCard
        featured
        label={tl("成员总数")}
        value={`${total} ${tl("人")}`}
        formatHoverValue={(v) => `${v} ${tl("人")}`}
        badge={`${tl("正常")} ${activeCount}`}
        badgeTone="success"
        note={tl("待激活 {{invited}} · 已禁用 {{disabled}}", {
          invited: invitedCount,
          disabled: disabledCount,
        })}
        data={headcountTrend}
        variant="area"
        color="var(--chart-1)"
      />

      <SparklineKpiCard
        label={tl("7 日活跃登录")}
        value={`${activeCount} ${tl("人")}`}
        formatHoverValue={(v) => `${v} ${tl("人")}`}
        badge="+11.4%"
        badgeTone="info"
        note={tl("近 7 日日均活跃席位")}
        data={weeklyLoginTrend}
        variant="line"
        color="var(--chart-2)"
      />

      <SparklineKpiCard
        label={tl("二次验证覆盖率")}
        value={`${twoFaRate}%`}
        formatHoverValue={(v) => `${v}%`}
        badge={`${twoFaActiveCount}/${activeCount}`}
        badgeTone={twoFaRate >= 80 ? "success" : "warning"}
        note={tl("活跃成员 2FA 合规趋势")}
        data={twoFaTrend}
        variant="area"
        color={
          twoFaRate >= 80 ? "var(--chart-positive)" : "var(--chart-warning)"
        }
      />

      <SparklineKpiCard
        label={tl("待激活与异常账号")}
        value={`${invitedCount + disabledCount} ${tl("人")}`}
        formatHoverValue={(v) => `${v} ${tl("人")}`}
        badge={invitedCount > 0 ? tl("待跟进") : tl("无积压")}
        badgeTone={invitedCount > 0 ? "warning" : "success"}
        note={tl("待激活 {{invited}} · 已禁用 {{disabled}}", {
          invited: invitedCount,
          disabled: disabledCount,
        })}
        data={pendingTrend}
        variant="bar"
        color="var(--chart-3)"
      />
    </section>
  )
}

export function MembersPage() {
  const tl = useUiText()
  const reducedMotion = Boolean(useReducedMotion())
  const mobile = useIsMobile()
  const searchId = useId()
  const store = useWorkspaceStore()

  const [selectedDeptId, setSelectedDeptId] = useState(
    store.departments[0]?.id ?? "dept-root"
  )
  const [query, setQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [inviteOpen, setInviteOpen] = useState(false)
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null)
  const [deletingMember, setDeletingMember] = useState<DemoMember | null>(null)

  const [inviteName, setInviteName] = useState("")
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteDept, setInviteDept] = useState(
    store.departments[1]?.id ?? store.departments[0]?.id ?? "dept-finops"
  )
  const [inviteRole, setInviteRole] = useState("role-analyst")

  const roleMap = useMemo(
    () => new Map(store.roles.map((r) => [r.id, r.name])),
    [store.roles]
  )
  const deptMap = useMemo(
    () => new Map(store.departments.map((d) => [d.id, d])),
    [store.departments]
  )

  const selectedDept =
    deptMap.get(selectedDeptId) ?? store.departments[0] ?? null

  const filtered = useMemo(() => {
    const scopeIds = selectedDept
      ? collectDescendantIds(selectedDept.id, store.departments)
      : null
    const q = query.trim().toLowerCase()
    return store.members.filter((m) => {
      if (scopeIds && !scopeIds.has(m.departmentId)) return false
      if (roleFilter !== "all" && m.roleId !== roleFilter) return false
      if (statusFilter !== "all" && m.status !== statusFilter) return false
      if (!q) return true
      const departmentName = deptMap.get(m.departmentId)?.name ?? ""
      return (
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        departmentName.toLowerCase().includes(q) ||
        tl(departmentName).toLowerCase().includes(q)
      )
    })
  }, [
    deptMap,
    query,
    roleFilter,
    selectedDept,
    statusFilter,
    store.departments,
    store.members,
    tl,
  ])

  const hasFilters =
    query.trim() !== "" || roleFilter !== "all" || statusFilter !== "all"

  const editingMember =
    store.members.find((m) => m.id === editingMemberId) ?? null
  const editingCurrentMember = editingMember?.id === store.session?.memberId
  const editingMemberDept = editingMember
    ? (deptMap.get(editingMember.departmentId) ?? null)
    : null
  const isEditingMemberLeader = Boolean(
    editingMember &&
    editingMemberDept &&
    editingMemberDept.leader === editingMember.name
  )

  const columns = useMemo(
    () =>
      column.columns([
        column.display({ id: "selection" }),
        column.accessor("name", {
          header: tl("成员"),
          cell: ({ row }) => {
            const dept = deptMap.get(row.original.departmentId)
            const isLeader = dept?.leader === row.original.name
            return (
              <>
                <span className="bill-row-id">
                  {tl(row.original.name)}
                  {isLeader && (
                    <span className="dept-leader-tag">{tl("部门负责人")}</span>
                  )}
                </span>
                <span className="bill-row-account">{row.original.email}</span>
              </>
            )
          },
        }),
        column.accessor("departmentId", {
          header: tl("所属部门"),
          cell: ({ getValue }) => tl(deptMap.get(getValue())?.name ?? "—"),
        }),
        column.accessor("roleId", {
          header: tl("角色"),
          cell: ({ getValue }) => (
            <span className="bill-row-pill">
              {tl(roleMap.get(getValue()) ?? "—")}
            </span>
          ),
        }),
        column.accessor("twoFactorEnabled", {
          header: tl("二次验证"),
          cell: ({ getValue }) => (
            <StatusBadge tone={getValue() ? "success" : "warning"}>
              {getValue() ? tl("已开启") : tl("未开启")}
            </StatusBadge>
          ),
        }),
        column.accessor("status", {
          header: tl("状态"),
          cell: ({ getValue }) => {
            const meta = statusTone[getValue()]
            return <StatusBadge tone={meta.tone}>{tl(meta.label)}</StatusBadge>
          },
        }),
        column.accessor("lastLoginAt", {
          header: tl("最近登录"),
          cell: ({ getValue }) => (
            <span className="text-muted-foreground financial-number">
              {getValue()}
            </span>
          ),
        }),
        column.display({
          id: "actions",
          header: tl("操作"),
          cell: ({ row }) => (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="bill-detail-action"
              aria-label={tl("编辑成员 {{name}}", {
                name: tl(row.original.name),
              })}
              title={tl("查看与编辑")}
              onClick={() => setEditingMemberId(row.original.id)}
            >
              <AppIcon icon={SolarEye} size={18} />
            </Button>
          ),
        }),
      ]),
    [deptMap, roleMap, tl]
  )

  const table = useDataTable({
    columns,
    data: filtered,
    getRowId: (row) => row.id,
    initialState: { pagination: { pageIndex: 0, pageSize: 10 } },
  })

  function handleReset() {
    setQuery("")
    setRoleFilter("all")
    setStatusFilter("all")
    table.firstPage()
  }

  function handleInvite(event: FormEvent) {
    event.preventDefault()
    if (!inviteName.trim() || !inviteEmail.trim()) {
      toast.error(tl("请填写成员姓名与邮箱"))
      return
    }
    const added = workspaceActions.addMember({
      name: inviteName.trim(),
      email: inviteEmail.trim(),
      departmentId: inviteDept,
      roleId: inviteRole,
    })
    if (!added) {
      toast.error(tl("请选择可用的部门和角色"))
      return
    }
    toast.success(tl("已保存 {{name}} 的演示邀请", { name: inviteName.trim() }))
    setInviteName("")
    setInviteEmail("")
    setInviteOpen(false)
  }

  function handleDeleteMember(member: DemoMember) {
    const result = workspaceActions.deleteMember(member.id)
    if (result === "in-use") {
      toast.error(tl("请先更换该成员负责的部门的负责人"))
    } else if (result === "blocked") {
      toast.error(tl("无法删除该成员"))
    } else {
      setEditingMemberId(null)
      table.setRowSelection((selection) => {
        const next = { ...selection }
        delete next[member.id]
        return next
      })
      if (table.getRowModel().rows.length === 1) table.firstPage()
      toast.success(tl("已删除成员"))
    }
  }

  return (
    <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
      <div className="dept-split">
        <OrgDepartmentTree
          title={tl("企业员工")}
          storageKey="aries-demo-tree-expanded-members"
          searchToolbarActions={
            <Tooltip>
              <TooltipTrigger asChild>
                <DialogTrigger asChild>
                  <MotionButton
                    type="button"
                    className="dept-tree-quick-btn"
                    aria-label={tl("邀请新成员")}
                    whileHover={reducedMotion ? undefined : { scale: 1.12 }}
                    whileTap={reducedMotion ? undefined : { scale: 0.86 }}
                    transition={{ type: "spring", stiffness: 520, damping: 24 }}
                    onClick={() => {
                      const availableDept =
                        selectedDept && !selectedDept.disabled
                          ? selectedDept
                          : store.departments.find((dept) => !dept.disabled)
                      setInviteDept(availableDept?.id ?? "")
                      setInviteRole((id) =>
                        store.roles.some(
                          (role) => role.id === id && !role.disabled
                        )
                          ? id
                          : (store.roles.find((role) => !role.disabled)?.id ??
                            "")
                      )
                    }}
                  >
                    <AppIcon icon={SolarPlus} size={16} aria-hidden="true" />
                  </MotionButton>
                </DialogTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={6}>
                {tl("邀请新成员")}
              </TooltipContent>
            </Tooltip>
          }
          showExpandToggle
          departments={store.departments}
          members={store.members}
          selectedId={selectedDept?.id ?? ""}
          onSelect={(id) => {
            setSelectedDeptId(id)
            table.firstPage()
          }}
        />

        <FrostCard className="settings-register settings-members-table">
          <div className="bills-toolbar">
            <div className="bills-toolbar-head">
              <span className="bills-toolbar-title">
                {selectedDept ? tl(selectedDept.name) : tl("成员列表")}
              </span>
            </div>
            <div className="bills-toolbar-fields" role="search">
              <div
                className="bills-search data-table-search field-surface"
                data-field-focus="quiet"
              >
                <label className="sr-only" htmlFor={searchId}>
                  {tl("搜索姓名、邮箱或部门")}
                </label>
                <AppIcon icon={SolarSearch} size={16} />
                <Input
                  embedded
                  className="bills-search-input"
                  controlSize="dense"
                  id={searchId}
                  type="search"
                  value={query}
                  onChange={(e) => {
                    table.firstPage()
                    setQuery(e.target.value)
                  }}
                  placeholder={tl("搜索姓名、邮箱或部门")}
                />
              </div>

              <div className="bills-selects">
                <Select
                  value={roleFilter}
                  onValueChange={(value) => {
                    table.firstPage()
                    setRoleFilter(value)
                  }}
                >
                  <SelectTrigger
                    size="dense"
                    aria-label={tl("按角色筛选")}
                    className="data-table-filter"
                    data-active={roleFilter !== "all" || undefined}
                  >
                    <span className="bill-filter-label" aria-hidden="true">
                      {tl("角色")}：
                    </span>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper" align="start">
                    <SelectItem value="all">{tl("全部")}</SelectItem>
                    {store.roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {tl(role.name)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={statusFilter}
                  onValueChange={(value) => {
                    table.firstPage()
                    setStatusFilter(value)
                  }}
                >
                  <SelectTrigger
                    size="dense"
                    aria-label={tl("按状态筛选")}
                    className="data-table-filter"
                    data-active={statusFilter !== "all" || undefined}
                  >
                    <span className="bill-filter-label" aria-hidden="true">
                      {tl("状态：")}
                    </span>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper" align="start">
                    <SelectItem value="all">{tl("全部")}</SelectItem>
                    <SelectItem value="active">{tl("正常")}</SelectItem>
                    <SelectItem value="invited">{tl("待激活")}</SelectItem>
                    <SelectItem value="disabled">{tl("已禁用")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {hasFilters && (
                <Button
                  className="bills-reset"
                  type="button"
                  variant="outline"
                  size="dense"
                  shape="workspace"
                  onClick={handleReset}
                >
                  {tl("清除筛选")}
                </Button>
              )}
            </div>
          </div>

          <DataTable
            table={table}
            caption={tl("成员列表")}
            columnAlign={columnAlign}
            rowHeaderColumn="name"
            selectAllLabel={tl("选择本页所有成员")}
            selectRowLabel={(row) =>
              tl("选择成员 {{name}}", { name: tl(row.name) })
            }
            paginationLabel={tl("成员分页")}
            empty={
              <EmptyState
                icon={SolarUsersGroupRounded}
                title={hasFilters ? tl("没有匹配的成员") : tl("暂无成员")}
              />
            }
          />
        </FrostCard>
      </div>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{tl("邀请新成员")}</DialogTitle>
          <DialogDescription>{tl("演示邀请仅保存在本地。")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleInvite} className="grid gap-3">
          <Field>
            <FieldLabel htmlFor="invite-name">{tl("姓名")}</FieldLabel>
            <Input
              id="invite-name"
              controlSize="dense"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="invite-email">{tl("工作邮箱")}</FieldLabel>
            <Input
              id="invite-email"
              type="email"
              controlSize="dense"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="invite-dept">{tl("所属部门")}</FieldLabel>
            <Select value={inviteDept} onValueChange={setInviteDept}>
              <SelectTrigger id="invite-dept" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                {store.departments.map((d) => (
                  <SelectItem key={d.id} value={d.id} disabled={d.disabled}>
                    {tl(d.name)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="invite-role">{tl("分配角色")}</FieldLabel>
            <Select value={inviteRole} onValueChange={setInviteRole}>
              <SelectTrigger id="invite-role" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                {store.roles.map((r) => (
                  <SelectItem key={r.id} value={r.id} disabled={r.disabled}>
                    {tl(r.name)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setInviteOpen(false)}
            >
              {tl("取消")}
            </Button>
            <Button type="submit">{tl("保存邀请")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>

      <Drawer
        open={editingMember !== null}
        onOpenChange={(open) => {
          if (!open) setEditingMemberId(null)
        }}
        direction={mobile ? "bottom" : "right"}
        noBodyStyles
      >
        <DrawerContent>
          {editingMember && (
            <>
              <DrawerHeader>
                <DrawerTitle>{tl(editingMember.name)}</DrawerTitle>
                <DrawerDescription>{editingMember.email}</DrawerDescription>
              </DrawerHeader>
              <div
                className="bill-drawer-body grid min-h-0 flex-1 content-start gap-4 overflow-y-auto px-4"
                data-vaul-no-drag=""
              >
                <Field>
                  <FieldLabel htmlFor="edit-member-dept">
                    {tl("所属部门")}
                  </FieldLabel>
                  <Select
                    value={editingMember.departmentId}
                    onValueChange={(value) => {
                      workspaceActions.updateMember(editingMember.id, {
                        departmentId: value,
                      })
                      toast.success(tl("已更新成员所属部门"))
                    }}
                  >
                    <SelectTrigger id="edit-member-dept" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {store.departments.map((d) => (
                        <SelectItem
                          key={d.id}
                          value={d.id}
                          disabled={d.disabled}
                        >
                          {tl(d.name)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Item variant="muted" size="sm">
                  <ItemContent>
                    <ItemTitle>{tl("部门身份")}</ItemTitle>
                    {!isEditingMemberLeader && (
                      <ItemDescription>{tl("普通成员")}</ItemDescription>
                    )}
                  </ItemContent>
                  <ItemActions>
                    {isEditingMemberLeader ? (
                      <StatusBadge tone="info">{tl("部门负责人")}</StatusBadge>
                    ) : (
                      editingMemberDept?.parentId && (
                        <Button
                          type="button"
                          size="small"
                          variant="outline"
                          onClick={() => {
                            workspaceActions.updateDepartment(
                              editingMemberDept.id,
                              { leader: editingMember.name }
                            )
                            toast.success(
                              tl("已将 {{name}} 设为部门负责人", {
                                name: tl(editingMember.name),
                              })
                            )
                          }}
                        >
                          {tl("设为负责人")}
                        </Button>
                      )
                    )}
                  </ItemActions>
                </Item>

                <Field>
                  <FieldLabel htmlFor="edit-member-role">
                    {tl("角色")}
                  </FieldLabel>
                  <Select
                    value={editingMember.roleId}
                    onValueChange={(value) => {
                      workspaceActions.updateMember(editingMember.id, {
                        roleId: value,
                      })
                      toast.success(tl("已更新成员角色"))
                    }}
                  >
                    <SelectTrigger id="edit-member-role" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {store.roles.map((r) => (
                        <SelectItem
                          key={r.id}
                          value={r.id}
                          disabled={r.disabled}
                        >
                          {tl(r.name)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel htmlFor="edit-member-status">
                    {tl("账号状态")}
                  </FieldLabel>
                  <Select
                    value={editingMember.status}
                    onValueChange={(value) => {
                      workspaceActions.updateMember(editingMember.id, {
                        status: value as MemberStatus,
                      })
                      toast.success(tl("已更新成员状态"))
                    }}
                  >
                    <SelectTrigger id="edit-member-status" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="active">{tl("正常")}</SelectItem>
                      <SelectItem value="invited">{tl("待激活")}</SelectItem>
                      <SelectItem
                        value="disabled"
                        disabled={editingCurrentMember}
                      >
                        {tl("已禁用")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                <Item variant="muted" size="sm">
                  <ItemContent>
                    <ItemTitle>{tl("二次验证（2FA）")}</ItemTitle>
                    <ItemDescription>
                      {tl("要求该成员登录时校验动态口令")}
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <Switch
                      checked={editingMember.twoFactorEnabled}
                      onCheckedChange={(checked) => {
                        workspaceActions.updateMember(editingMember.id, {
                          twoFactorEnabled: checked,
                        })
                        toast.success(tl("已更新成员二次验证状态"))
                      }}
                      aria-label={tl("二次验证（2FA）")}
                    />
                  </ItemActions>
                </Item>

                <section className="bill-drawer-section">
                  <h3>{tl("最近登录记录")}</h3>
                  <dl className="bill-drawer-rows">
                    <div>
                      <dt>{tl("登录时间")}</dt>
                      <dd className="financial-number">
                        {editingMember.lastLoginAt}
                      </dd>
                    </div>
                    <div>
                      <dt>{tl("来源 IP")}</dt>
                      <dd className="financial-number">
                        {editingMember.lastLoginIp}
                      </dd>
                    </div>
                  </dl>
                </section>
              </div>
              <DrawerFooter>
                {!editingCurrentMember && (
                  <OrganizationLifecycleActions
                    disabled={editingMember.status === "disabled"}
                    onToggle={() => {
                      const disabled = editingMember.status !== "disabled"
                      if (
                        workspaceActions.updateMember(editingMember.id, {
                          status: disabled ? "disabled" : "active",
                        })
                      ) {
                        toast.success(disabled ? tl("已停用") : tl("已启用"))
                      }
                    }}
                    onDelete={() => setDeletingMember(editingMember)}
                  />
                )}
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
      <OrganizationDeleteDialog
        name={deletingMember ? tl(deletingMember.name) : null}
        onClose={() => setDeletingMember(null)}
        onConfirm={() => deletingMember && handleDeleteMember(deletingMember)}
      />
    </Dialog>
  )
}
