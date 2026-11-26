import {
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react"
import { AnimatePresence, useReducedMotion } from "motion/react"
import {
  button as MotionButton,
  create as createMotionComponent,
  div as MotionDiv,
  span as MotionSpan,
} from "motion/react-m"
import { toast } from "sonner"

import { NavHighlight, SidebarNavItem } from "@marismoon/shell"
import {
  AppIcon,
  SolarChevronDown,
  SolarCog,
  SolarCopy,
  SolarEllipsis,
  SolarEye,
  SolarEyeClosed,
  SolarFolder,
  SolarLayoutGrid,
  SolarList,
  SolarPen,
  SolarPlus,
  SolarSearch,
  SolarShieldAlert,
  SolarTrashBinTrash,
  SolarUser,
  SolarUsersGroupRounded,
  SolarVerifiedCheck,
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
import { Checkbox } from "@marismoon/ui/ui/checkbox"
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
} from "@marismoon/ui/ui/combobox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@marismoon/ui/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@marismoon/ui/ui/dropdown-menu"
import { Field, FieldLabel } from "@marismoon/ui/ui/field"
import { Input } from "@marismoon/ui/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@marismoon/ui/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@marismoon/ui/ui/tabs"
import { Textarea } from "@marismoon/ui/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@marismoon/ui/ui/tooltip"
import { useUiText } from "@/lib/i18n/use-ui-text"
import {
  allPermissionIds,
  permissionGroups,
  sensitivePermissionIds,
  useWorkspaceStore,
  workspaceActions,
} from "@/shared/mocks/workspace-store"
import type {
  DemoMember,
  DemoRole,
  MemberStatus,
} from "@/shared/types/workspace-settings"
import {
  SummaryMiniBars,
  SummaryRingGauge,
  SummarySegmentedBar,
} from "../SettingsSummaryVisuals"

import { matchesMemberSearch, MemberSearchResults } from "./MemberSearchResults"
import {
  OrganizationDeleteDialog,
  OrganizationLifecycleActions,
} from "./OrganizationLifecycle"
import { PermissionMatrixTable } from "./PermissionMatrixTable"
import { usePersistedExpandedIds } from "./use-persisted-expanded-ids"
import {
  MAX_TREE_VISUAL_DEPTH,
  TREE_ROLL_EASE,
  useTreeRollWindow,
  type RolledTreeBranch,
} from "./use-tree-roll-window"

import "../../bills/components/bills-controls.css"
import "../../bills/components/bills-table.css"
import "../basic-info/basic-info.css"
import "../settings-table.css"
import "./departments-tree.css"
import "./roles-workbench.css"

const memberColumn = createDataTableColumns<DemoMember>()
const memberColumnAlign = { actions: "end" } as const
const MotionFrostCard = createMotionComponent(FrostCard)
const ROLE_VIEW_EASE = [0.23, 1, 0.32, 1] as const

type RoleView = "workbench" | "matrix"

const roleViewVariants = {
  enter: (direction: 1 | -1) => ({
    opacity: 0,
    x: direction > 0 ? 28 : -28,
    scale: 0.985,
  }),
  center: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.24,
      ease: ROLE_VIEW_EASE,
    },
  },
  exit: (direction: 1 | -1) => ({
    opacity: 0,
    x: direction > 0 ? -20 : 20,
    scale: 0.99,
    transition: {
      duration: 0.16,
      ease: ROLE_VIEW_EASE,
    },
  }),
}

const statusTone: Record<
  MemberStatus,
  { label: string; tone: "success" | "info" | "neutral" }
> = {
  active: { label: "正常", tone: "success" },
  invited: { label: "待激活", tone: "info" },
  disabled: { label: "已禁用", tone: "neutral" },
}

function collectRoleDescendantIds(
  rootId: string,
  all: readonly DemoRole[]
): Set<string> {
  const result = new Set<string>([rootId])
  const queue = [rootId]
  while (queue.length > 0) {
    const current = queue.shift()
    for (const r of all) {
      if (r.parentId === current && !result.has(r.id)) {
        result.add(r.id)
        queue.push(r.id)
      }
    }
  }
  return result
}

export function RolesSummary() {
  const tl = useUiText()
  const store = useWorkspaceStore()

  const totalRoles = store.roles.length
  const builtinCount = store.roles.filter((r) => r.builtin).length
  const customCount = totalRoles - builtinCount

  const roleDist = store.roles.slice(0, 4).map((role) => ({
    label: tl(role.name),
    value: store.members.filter((m) => m.roleId === role.id).length,
  }))
  const maxMembers = Math.max(...roleDist.map((item) => item.value), 1)

  const privilegedRoleIds = new Set(
    store.roles
      .filter((r) => r.permissions.some((p) => sensitivePermissionIds.has(p)))
      .map((r) => r.id)
  )
  const privilegedMembers = store.members.filter((m) =>
    privilegedRoleIds.has(m.roleId)
  ).length
  const totalMembers = store.members.length
  const privilegedRate =
    totalMembers > 0 ? Math.round((privilegedMembers / totalMembers) * 100) : 0

  return (
    <section className="settings-summary-grid" aria-label={tl("角色权限概况")}>
      <FrostCard className="settings-summary-card hero-surface">
        <div className="settings-summary-meta">
          <div className="settings-summary-label">{tl("角色总数")}</div>
          <div className="settings-summary-value financial-number">
            {totalRoles} {tl("个")}
          </div>
        </div>
        <SummarySegmentedBar
          total={totalRoles}
          items={[
            { label: tl("预置角色"), count: builtinCount, tone: "info" },
            { label: tl("自定义角色"), count: customCount, tone: "success" },
          ]}
        />
      </FrostCard>

      <FrostCard className="settings-summary-card">
        <div className="settings-summary-label">{tl("成员角色分布")}</div>
        <SummaryMiniBars
          items={roleDist.map((item) => ({
            label: item.label,
            value: item.value,
            max: maxMembers,
          }))}
        />
      </FrostCard>

      <FrostCard className="settings-summary-card">
        <div className="settings-summary-top">
          <div className="settings-summary-meta">
            <div className="settings-summary-label">{tl("高敏权限覆盖")}</div>
            <div className="settings-summary-value financial-number">
              {privilegedMembers} / {totalMembers}
            </div>
            <p className="settings-summary-note">
              {tl("{{roles}} 个角色含高敏权限", {
                roles: privilegedRoleIds.size,
              })}
            </p>
          </div>
          <SummaryRingGauge
            percent={privilegedRate}
            tone={privilegedRate > 35 ? "warning" : "info"}
            label={tl("高敏权限覆盖")}
          />
        </div>
      </FrostCard>
    </section>
  )
}

function RoleTreeNode({
  role,
  visualDepth,
  rolledBranch,
  rollSeq,
  rollL1Id,
  lastRollDirection,
  reducedMotion,
  allRoles,
  members,
  selectedId,
  expandedIds,
  treeFilter,
  onToggleExpand,
  onSelect,
  onCreateChild,
  onDuplicate,
  onEdit,
  onDelete,
}: {
  role: DemoRole
  visualDepth: number
  rolledBranch: RolledTreeBranch | null
  rollSeq: number
  rollL1Id: string | null
  lastRollDirection: 1 | -1
  reducedMotion: boolean
  allRoles: readonly DemoRole[]
  members: readonly DemoMember[]
  selectedId: string
  expandedIds: ReadonlySet<string>
  treeFilter: string
  onToggleExpand: (
    id: string,
    visualDepth: number,
    hasChildren: boolean
  ) => void
  onSelect: (id: string, visualDepth: number, hasChildren: boolean) => void
  onCreateChild: (parent: DemoRole) => void
  onDuplicate: (role: DemoRole) => void
  onEdit: (role: DemoRole) => void
  onDelete: (role: DemoRole) => void
}) {
  const tl = useUiText()
  const panelId = useId()
  const isProtectedAdmin = role.id === "role-admin"
  const directChildren = allRoles.filter((r) => r.parentId === role.id)
  const hasChildren = directChildren.length > 0
  const isRolledL1 =
    !treeFilter && visualDepth === 1 && rolledBranch?.l1Id === role.id
  const rolledSlot2 = isRolledL1
    ? allRoles.find((r) => r.id === rolledBranch.slot2Id)
    : undefined
  const visibleChildren = rolledSlot2 ? [rolledSlot2] : directChildren
  const canRenderChildren =
    hasChildren && (treeFilter !== "" || visualDepth < MAX_TREE_VISUAL_DEPTH)
  const expanded =
    canRenderChildren &&
    (treeFilter !== "" || isRolledL1 || expandedIds.has(role.id))
  const descendantIds = collectRoleDescendantIds(role.id, allRoles)
  const memberCount = members.filter((m) => m.roleId === role.id).length

  if (treeFilter) {
    const q = treeFilter.toLowerCase()
    const selfMatches =
      role.name.toLowerCase().includes(q) ||
      tl(role.name).toLowerCase().includes(q) ||
      role.description.toLowerCase().includes(q) ||
      tl(role.description).toLowerCase().includes(q)
    const descendantMatches = allRoles.some(
      (r) =>
        r.id !== role.id &&
        descendantIds.has(r.id) &&
        (r.name.toLowerCase().includes(q) ||
          tl(r.name).toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          tl(r.description).toLowerCase().includes(q))
    )
    if (!selfMatches && !descendantMatches) return null
  }

  return (
    <li>
      <div className="dept-tree-row">
        <SidebarNavItem
          className={
            isProtectedAdmin
              ? hasChildren
                ? "workspace-nav-parent"
                : undefined
              : visualDepth === 0
                ? "nav-tree-item"
                : "nav-tree-item nav-tree-leaf"
          }
          aria-current={role.id === selectedId || undefined}
          onClick={() => onSelect(role.id, visualDepth, hasChildren)}
        >
          <AppIcon
            icon={
              hasChildren
                ? SolarFolder
                : role.builtin
                  ? SolarVerifiedCheck
                  : SolarUser
            }
            size={16}
            stateful
          />
          {visualDepth >= 2 && rollSeq > 0 ? (
            <MotionSpan
              key={`${role.id}-${rollSeq}`}
              className="dept-tree-name"
              title={tl(role.name)}
              initial={
                reducedMotion
                  ? false
                  : { opacity: 0, y: lastRollDirection > 0 ? 8 : -8 }
              }
              animate={{ opacity: 1, y: 0 }}
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : { duration: 0.18, ease: TREE_ROLL_EASE }
              }
            >
              {tl(role.name)}
            </MotionSpan>
          ) : (
            <span className="dept-tree-name" title={tl(role.name)}>
              {tl(role.name)}
            </span>
          )}
          <span className="workspace-nav-count financial-number">
            {memberCount}
          </span>
        </SidebarNavItem>

        {hasChildren && (
          <button
            type="button"
            className="dept-tree-toggle"
            aria-expanded={expanded}
            aria-controls={canRenderChildren ? panelId : undefined}
            aria-label={tl("展开或收起 {{name}}", { name: tl(role.name) })}
            onClick={() => onToggleExpand(role.id, visualDepth, hasChildren)}
          >
            <AppIcon icon={SolarChevronDown} size={14} aria-hidden="true" />
          </button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="dept-tree-more"
              aria-label={tl("更多角色操作 {{name}}", { name: tl(role.name) })}
              title={tl("更多操作")}
            >
              <AppIcon icon={SolarEllipsis} size={15} aria-hidden="true" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={4}>
            <DropdownMenuItem onSelect={() => onCreateChild(role)}>
              <AppIcon icon={SolarPlus} size={14} aria-hidden="true" />
              {tl("创建子角色")}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onDuplicate(role)}>
              <AppIcon icon={SolarCopy} size={14} aria-hidden="true" />
              {tl("复制为新角色")}
            </DropdownMenuItem>
            {!isProtectedAdmin && (
              <DropdownMenuItem onSelect={() => onEdit(role)}>
                <AppIcon icon={SolarPen} size={14} aria-hidden="true" />
                {tl("编辑名称与说明")}
              </DropdownMenuItem>
            )}
            {!role.builtin && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => onDelete(role)}
                >
                  <AppIcon
                    icon={SolarTrashBinTrash}
                    size={14}
                    aria-hidden="true"
                  />
                  {tl("删除角色")}
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {canRenderChildren && (
        <div
          id={panelId}
          className="nav-tree-panel"
          data-expanded={expanded ? "true" : "false"}
          inert={!expanded || undefined}
        >
          <div className="nav-tree-panel-inner">
            <ul className="nav-tree-children">
              {visibleChildren.map((child) => (
                <RoleTreeNode
                  key={child.id}
                  role={child}
                  visualDepth={visualDepth + 1}
                  rolledBranch={rolledBranch}
                  rollSeq={
                    visualDepth === 1
                      ? rollL1Id === role.id
                        ? rollSeq
                        : 0
                      : rollSeq
                  }
                  rollL1Id={rollL1Id}
                  lastRollDirection={lastRollDirection}
                  reducedMotion={reducedMotion}
                  allRoles={allRoles}
                  members={members}
                  selectedId={selectedId}
                  expandedIds={expandedIds}
                  treeFilter={treeFilter}
                  onToggleExpand={onToggleExpand}
                  onSelect={onSelect}
                  onCreateChild={onCreateChild}
                  onDuplicate={onDuplicate}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </ul>
          </div>
        </div>
      )}
    </li>
  )
}

export function RolesPage() {
  const tl = useUiText()
  const store = useWorkspaceStore()
  const reducedMotion = Boolean(useReducedMotion())
  const roleSearchId = useId()
  const memberSearchId = useId()
  const permSearchId = useId()
  const roleTreeRef = useRef<HTMLDivElement>(null)

  const [viewMode, setViewMode] = useState<RoleView>("workbench")
  const viewDirection: 1 | -1 = viewMode === "matrix" ? 1 : -1
  const [selectedId, setSelectedId] = useState(
    store.roles[0]?.id ?? "role-admin"
  )
  const [roleQuery, setRoleQuery] = useState("")
  const [expandedRoleIds, setExpandedRoleIds] = usePersistedExpandedIds(
    "aries-demo-tree-expanded-roles",
    store.roles.map((r) => r.id)
  )
  const [detailTab, setDetailTab] = useState<"permissions" | "members">(
    "permissions"
  )

  // Members table filter state
  const [memberQuery, setMemberQuery] = useState("")
  const [memberStatusFilter, setMemberStatusFilter] = useState("all")

  // File Tree Permission Picker Dialog
  const [permDialogOpen, setPermDialogOpen] = useState(false)
  const [permDraft, setPermDraft] = useState<string[]>([])
  const [permQuery, setPermQuery] = useState("")
  const [expandedPermGroups, setExpandedPermGroups] = useState<Set<string>>(
    () => new Set(permissionGroups.map((g) => g.group))
  )

  // Create role dialog
  const [createOpen, setCreateOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [newDesc, setNewDesc] = useState("")
  const [newParentId, setNewParentId] = useState<string>("role-admin")

  // Edit role meta dialog
  const [editingRole, setEditingRole] = useState<DemoRole | null>(null)
  const [deletingRole, setDeletingRole] = useState<DemoRole | null>(null)
  const [editName, setEditName] = useState("")
  const [editDesc, setEditDesc] = useState("")

  // Assign member dialog
  const [assignOpen, setAssignOpen] = useState(false)
  const [membersToAssign, setMembersToAssign] = useState<DemoMember[]>([])

  const roleMap = useMemo(
    () => new Map(store.roles.map((r) => [r.id, r])),
    [store.roles]
  )
  const deptNameById = useMemo(
    () => new Map(store.departments.map((d) => [d.id, d.name])),
    [store.departments]
  )

  const selectedRole = roleMap.get(selectedId) ?? store.roles[0]
  const parentRole = selectedRole?.parentId
    ? (roleMap.get(selectedRole.parentId) ?? null)
    : null
  const parentPermSet = useMemo(
    () => new Set(parentRole?.permissions ?? []),
    [parentRole]
  )
  const isProtectedAdmin = selectedRole?.id === "role-admin"
  const canDisableSelectedRole =
    !isProtectedAdmin &&
    !store.members.some(
      (member) =>
        member.id === store.session?.memberId &&
        member.roleId === selectedRole?.id
    )

  const rootRoles = useMemo(
    () => store.roles.filter((r) => !r.parentId || !roleMap.has(r.parentId)),
    [roleMap, store.roles]
  )

  const roleMembers = useMemo(() => {
    if (!selectedRole) return []
    return store.members.filter((m) => m.roleId === selectedRole.id)
  }, [selectedRole, store.members])

  const filteredRoleMembers = useMemo(() => {
    const q = memberQuery.trim().toLowerCase()
    return roleMembers.filter((m) => {
      if (memberStatusFilter !== "all" && m.status !== memberStatusFilter) {
        return false
      }
      if (!q) return true
      const deptName = deptNameById.get(m.departmentId) ?? ""
      return (
        m.name.toLowerCase().includes(q) ||
        tl(m.name).toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        deptName.toLowerCase().includes(q) ||
        tl(deptName).toLowerCase().includes(q)
      )
    })
  }, [deptNameById, memberQuery, memberStatusFilter, roleMembers, tl])

  const assignableMembers = useMemo(() => {
    if (!selectedRole || selectedRole.disabled) return []
    return store.members.filter((m) => m.roleId !== selectedRole.id)
  }, [selectedRole, store.members])

  const hasMemberFilters =
    memberQuery.trim() !== "" || memberStatusFilter !== "all"

  const grantedGroups = useMemo(() => {
    const granted = new Set(selectedRole?.permissions ?? [])
    return permissionGroups
      .map((group) => ({
        ...group,
        grantedItems: group.items.filter((item) => granted.has(item.id)),
      }))
      .filter((group) => group.grantedItems.length > 0)
  }, [selectedRole])

  const permDialogDiff = useMemo(() => {
    const savedSet = new Set(selectedRole?.permissions ?? [])
    const draftSet = new Set(permDraft)
    let added = 0
    let removed = 0
    for (const id of draftSet) {
      if (!savedSet.has(id)) added += 1
    }
    for (const id of savedSet) {
      if (!draftSet.has(id)) removed += 1
    }
    return { added, removed, dirty: added > 0 || removed > 0 }
  }, [permDraft, selectedRole])

  const filteredPermGroups = useMemo(() => {
    const q = permQuery.trim().toLowerCase()
    if (!q) return permissionGroups
    return permissionGroups
      .map((group) => {
        const groupMatches =
          group.group.toLowerCase().includes(q) ||
          tl(group.group).toLowerCase().includes(q)
        const items = groupMatches
          ? group.items
          : group.items.filter(
              (item) =>
                item.label.toLowerCase().includes(q) ||
                tl(item.label).toLowerCase().includes(q) ||
                item.description.toLowerCase().includes(q) ||
                tl(item.description).toLowerCase().includes(q)
            )
        return { ...group, items }
      })
      .filter((group) => group.items.length > 0)
  }, [permQuery, tl])

  const memberColumns = useMemo(
    () =>
      memberColumn.columns([
        memberColumn.display({ id: "selection" }),
        memberColumn.accessor("name", {
          header: tl("成员"),
          cell: ({ row }) => (
            <>
              <span className="bill-row-id">{tl(row.original.name)}</span>
              <span className="bill-row-account">{row.original.email}</span>
            </>
          ),
        }),
        memberColumn.accessor("departmentId", {
          header: tl("所属部门"),
          cell: ({ getValue }) => tl(deptNameById.get(getValue()) ?? "—"),
        }),
        memberColumn.accessor("twoFactorEnabled", {
          header: tl("二次验证"),
          cell: ({ getValue }) => (
            <StatusBadge tone={getValue() ? "success" : "warning"}>
              {getValue() ? tl("已开启") : tl("未开启")}
            </StatusBadge>
          ),
        }),
        memberColumn.accessor("status", {
          header: tl("状态"),
          cell: ({ getValue }) => {
            const meta = statusTone[getValue()]
            return <StatusBadge tone={meta.tone}>{tl(meta.label)}</StatusBadge>
          },
        }),
        memberColumn.accessor("lastLoginAt", {
          header: tl("最近登录"),
          cell: ({ getValue }) => (
            <span className="text-muted-foreground financial-number">
              {getValue()}
            </span>
          ),
        }),
        memberColumn.display({
          id: "actions",
          header: tl("操作"),
          cell: ({ row }) => (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="bill-detail-action"
                  aria-label={tl("调整 {{name}} 的角色", {
                    name: tl(row.original.name),
                  })}
                  title={tl("调整角色")}
                >
                  <AppIcon icon={SolarPen} size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {store.roles.map((r) => (
                  <DropdownMenuItem
                    key={r.id}
                    disabled={r.disabled || r.id === row.original.roleId}
                    onSelect={() => {
                      workspaceActions.updateMember(row.original.id, {
                        roleId: r.id,
                      })
                      toast.success(tl("已更新成员角色"))
                    }}
                  >
                    {tl(r.name)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ),
        }),
      ]),
    [deptNameById, store.roles, tl]
  )

  const membersTable = useDataTable({
    columns: memberColumns,
    data: filteredRoleMembers,
    getRowId: (row) => row.id,
    initialState: { pagination: { pageIndex: 0, pageSize: 10 } },
  })

  const ensureExpanded = useCallback(
    (ids: readonly string[]) => {
      setExpandedRoleIds((prev) => new Set([...prev, ...ids]))
    },
    [setExpandedRoleIds]
  )

  const {
    rolledBranch,
    rollMeta,
    rollDownToSlot2,
    resetRoll,
    handleTreeNodeSelect,
  } = useTreeRollWindow({
    nodeMap: roleMap,
    selectedId: selectedRole?.id ?? "",
    onEnsureExpanded: ensureExpanded,
  })

  const selectRole = useCallback(
    (id: string, visualDepth?: number, hasChildren?: boolean) => {
      setSelectedId(id)
      setMemberQuery("")
      setMemberStatusFilter("all")
      membersTable.firstPage()
      handleTreeNodeSelect(id, visualDepth, hasChildren)
    },
    [handleTreeNodeSelect, membersTable]
  )

  function toggleRoleExpand(
    id: string,
    visualDepth: number,
    hasChildren: boolean
  ) {
    if (visualDepth === MAX_TREE_VISUAL_DEPTH && hasChildren) {
      rollDownToSlot2(id)
      return
    }
    setExpandedRoleIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function openCreateDialog(parent?: DemoRole | null) {
    setNewParentId(parent ? parent.id : (selectedRole?.id ?? "none"))
    setNewName("")
    setNewDesc("")
    setCreateOpen(true)
  }

  function handleCreateRole(event: FormEvent) {
    event.preventDefault()
    if (!newName.trim()) {
      toast.error(tl("请填写角色名称"))
      return
    }
    const parent = newParentId !== "none" ? roleMap.get(newParentId) : undefined
    const id = workspaceActions.addRole({
      name: newName.trim(),
      description: newDesc.trim() || tl("自定义业务角色"),
      parentId: parent?.id ?? null,
    })
    if (parent) {
      setExpandedRoleIds((prev) => new Set([...prev, parent.id, id]))
    }
    selectRole(id)
    setViewMode("workbench")
    setDetailTab("permissions")
    setCreateOpen(false)
    toast.success(
      parent
        ? tl("已创建子角色，默认继承「{{parent}}」的权限", {
            parent: tl(parent.name),
          })
        : tl("已新建角色")
    )
  }

  function openEditRoleDialog(role: DemoRole) {
    setEditingRole(role)
    setEditName(role.name)
    setEditDesc(role.description)
  }

  function handleSaveRoleMeta(event: FormEvent) {
    event.preventDefault()
    if (!editingRole || !editName.trim()) {
      toast.error(tl("请填写角色名称"))
      return
    }
    workspaceActions.updateRoleMeta(editingRole.id, {
      name: editName.trim(),
      description: editDesc.trim(),
    })
    setEditingRole(null)
    toast.success(tl("已更新角色信息"))
  }

  function handleDuplicateRole(role: DemoRole) {
    const copyName = `${tl(role.name)} (${tl("副本")})`
    const id = workspaceActions.duplicateRole(role.id, copyName)
    if (id) {
      if (role.parentId) {
        setExpandedRoleIds((prev) => new Set([...prev, role.parentId!]))
      }
      selectRole(id)
      setViewMode("workbench")
      toast.success(tl("已复制为新角色「{{name}}」", { name: copyName }))
    }
  }

  function requestDeleteRole(role: DemoRole) {
    if (role.builtin) {
      toast.error(tl("预置角色不可删除"))
      return
    }
    const hasChildren = store.roles.some((r) => r.parentId === role.id)
    if (hasChildren) {
      toast.error(tl("该角色下仍有子角色，请先删除子角色"))
      return
    }
    const count = store.members.filter((m) => m.roleId === role.id).length
    if (count > 0) {
      toast.error(
        tl("该角色下仍有 {{count}} 位成员，请先调整成员角色后再删除", { count })
      )
      return
    }
    setDeletingRole(role)
  }

  function handleDeleteRole(role: DemoRole) {
    const removed = workspaceActions.deleteRole(role.id)
    if (removed) {
      if (selectedId === role.id) {
        selectRole(store.roles[0]?.id ?? "role-admin")
      }
      toast.success(tl("已删除角色「{{name}}」", { name: tl(role.name) }))
    } else {
      toast.error(tl("无法删除该角色"))
    }
  }

  function openPermDialog() {
    if (!selectedRole || isProtectedAdmin) return
    setPermDraft([...selectedRole.permissions])
    setPermQuery("")
    setExpandedPermGroups(new Set(permissionGroups.map((g) => g.group)))
    setPermDialogOpen(true)
  }

  function toggleDraftPerm(permId: string) {
    setPermDraft((prev) =>
      prev.includes(permId)
        ? prev.filter((id) => id !== permId)
        : [...prev, permId]
    )
  }

  function toggleDraftGroup(groupItemIds: readonly string[], enable: boolean) {
    setPermDraft((prev) => {
      const next = new Set(prev)
      for (const id of groupItemIds) {
        if (enable) next.add(id)
        else next.delete(id)
      }
      return [...next]
    })
  }

  function togglePermGroupExpand(groupName: string) {
    setExpandedPermGroups((prev) => {
      const next = new Set(prev)
      if (next.has(groupName)) next.delete(groupName)
      else next.add(groupName)
      return next
    })
  }

  function handleConfirmPermissions() {
    if (!selectedRole || isProtectedAdmin) return
    workspaceActions.updateRolePermissions(selectedRole.id, permDraft)
    setPermDialogOpen(false)
    toast.success(
      tl("已保存「{{name}}」的权限配置", { name: tl(selectedRole.name) })
    )
  }

  function handleAssignMember(event: FormEvent) {
    event.preventDefault()
    if (!selectedRole || membersToAssign.length === 0) return
    const count = workspaceActions.assignMembersToRole(
      membersToAssign.map((member) => member.id),
      selectedRole.id
    )
    if (count === 0) {
      toast.error(tl("没有可分配的成员"))
      return
    }
    setAssignOpen(false)
    setMembersToAssign([])
    toast.success(
      tl("已将 {{count}} 位成员分配至「{{role}}」", {
        count,
        role: tl(selectedRole.name),
      })
    )
  }

  const selectedParentForCreate =
    newParentId !== "none" ? roleMap.get(newParentId) : null

  return (
    <>
      <AnimatePresence mode="wait" initial={false} custom={viewDirection}>
        {viewMode === "matrix" ? (
          <MotionFrostCard
            key="matrix"
            className="basic-card roles-matrix-card"
            custom={viewDirection}
            variants={reducedMotion ? undefined : roleViewVariants}
            initial={reducedMotion ? false : "enter"}
            animate={reducedMotion ? undefined : "center"}
            exit={reducedMotion ? undefined : "exit"}
          >
            <header className="basic-card-header">
              <span className="basic-card-icon">
                <AppIcon icon={SolarLayoutGrid} size={16} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <h2>{tl("权限矩阵")}</h2>
                <p>
                  {tl(
                    "横向对比所有角色的权限边界，点击角色表头可进入详情配置。"
                  )}
                </p>
              </div>
              <div className="basic-card-actions">
                <Button
                  type="button"
                  size="small"
                  variant="outline"
                  onClick={() => setViewMode("workbench")}
                >
                  <AppIcon
                    icon={SolarList}
                    data-icon="inline-start"
                    aria-hidden
                  />
                  {tl("返回")}
                </Button>
              </div>
            </header>

            <PermissionMatrixTable
              roles={store.roles}
              members={store.members}
              onSelectRole={(id) => {
                selectRole(id)
                setViewMode("workbench")
              }}
            />
          </MotionFrostCard>
        ) : (
          <MotionDiv
            key="workbench"
            className="dept-split"
            custom={viewDirection}
            variants={reducedMotion ? undefined : roleViewVariants}
            initial={reducedMotion ? false : "enter"}
            animate={reducedMotion ? undefined : "center"}
            exit={reducedMotion ? undefined : "exit"}
          >
            <div
              className="workspace-nav workspace-nav-surface dept-tree-card"
              role="region"
              aria-label={tl("角色目录")}
            >
              <div className="workspace-nav-heading">
                <strong>{tl("角色目录")}</strong>
              </div>

              <div
                className="dept-tree-search field-surface"
                data-field-focus="quiet"
              >
                <label className="sr-only" htmlFor={roleSearchId}>
                  {tl("搜索角色名称或职责")}
                </label>
                <AppIcon icon={SolarSearch} size={16} />
                <Input
                  embedded
                  id={roleSearchId}
                  type="search"
                  controlSize="dense"
                  className="bills-search-input"
                  value={roleQuery}
                  onChange={(e) => setRoleQuery(e.target.value)}
                  placeholder={tl("搜索角色名称或职责")}
                />
              </div>

              {(() => {
                const parentRoleIds = store.roles
                  .filter((r) =>
                    store.roles.some((child) => child.parentId === r.id)
                  )
                  .map((r) => r.id)
                const isTreeExpanded = parentRoleIds.some((id) =>
                  expandedRoleIds.has(id)
                )
                const toggleLabel = isTreeExpanded
                  ? tl("收起目录树")
                  : tl("展开目录树")
                return (
                  <div className="dept-tree-quick-actions">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <MotionButton
                          type="button"
                          className="dept-tree-quick-btn"
                          aria-label={tl("新建自定义角色")}
                          whileHover={
                            reducedMotion ? undefined : { scale: 1.12 }
                          }
                          whileTap={reducedMotion ? undefined : { scale: 0.86 }}
                          transition={{
                            type: "spring",
                            stiffness: 520,
                            damping: 24,
                          }}
                          onClick={() => openCreateDialog(selectedRole)}
                        >
                          <AppIcon
                            icon={SolarPlus}
                            size={16}
                            aria-hidden="true"
                          />
                        </MotionButton>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" sideOffset={6}>
                        {tl("新建自定义角色")}
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <MotionButton
                          type="button"
                          className="dept-tree-quick-btn"
                          aria-label={toggleLabel}
                          aria-pressed={isTreeExpanded}
                          whileHover={
                            reducedMotion ? undefined : { scale: 1.12 }
                          }
                          whileTap={reducedMotion ? undefined : { scale: 0.86 }}
                          transition={{
                            type: "spring",
                            stiffness: 520,
                            damping: 24,
                          }}
                          onClick={() => {
                            if (isTreeExpanded) {
                              resetRoll()
                              setExpandedRoleIds(new Set())
                            } else {
                              setExpandedRoleIds(
                                new Set(store.roles.map((r) => r.id))
                              )
                            }
                          }}
                        >
                          <MotionSpan
                            key={isTreeExpanded ? "open" : "closed"}
                            className="inline-grid place-items-center"
                            initial={
                              reducedMotion
                                ? false
                                : { opacity: 0.4, scale: 0.78 }
                            }
                            animate={{ opacity: 1, scale: 1 }}
                            transition={
                              reducedMotion
                                ? { duration: 0 }
                                : {
                                    type: "spring",
                                    stiffness: 500,
                                    damping: 26,
                                  }
                            }
                          >
                            <AppIcon
                              icon={isTreeExpanded ? SolarEye : SolarEyeClosed}
                              size={16}
                              aria-hidden="true"
                            />
                          </MotionSpan>
                        </MotionButton>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" sideOffset={6}>
                        {toggleLabel}
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <MotionButton
                          type="button"
                          className="dept-tree-quick-btn"
                          aria-label={tl("权限矩阵")}
                          whileHover={
                            reducedMotion ? undefined : { scale: 1.12 }
                          }
                          whileTap={reducedMotion ? undefined : { scale: 0.86 }}
                          transition={{
                            type: "spring",
                            stiffness: 520,
                            damping: 24,
                          }}
                          onClick={() => setViewMode("matrix")}
                        >
                          <AppIcon
                            icon={SolarLayoutGrid}
                            size={16}
                            aria-hidden="true"
                          />
                        </MotionButton>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" sideOffset={6}>
                        {tl("权限矩阵")}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                )
              })()}

              <div ref={roleTreeRef} className="workspace-directory">
                <NavHighlight containerRef={roleTreeRef} />
                <ul className="workspace-nav-list roles-directory-roots">
                  {rootRoles.map((root) => (
                    <RoleTreeNode
                      key={root.id}
                      role={root}
                      visualDepth={0}
                      rolledBranch={rolledBranch}
                      rollSeq={rollMeta.seq}
                      rollL1Id={rollMeta.l1Id}
                      lastRollDirection={rollMeta.direction}
                      reducedMotion={reducedMotion}
                      allRoles={store.roles}
                      members={store.members}
                      selectedId={selectedRole?.id ?? ""}
                      expandedIds={expandedRoleIds}
                      treeFilter={roleQuery.trim()}
                      onToggleExpand={toggleRoleExpand}
                      onSelect={selectRole}
                      onCreateChild={(parent) => openCreateDialog(parent)}
                      onDuplicate={handleDuplicateRole}
                      onEdit={openEditRoleDialog}
                      onDelete={requestDeleteRole}
                    />
                  ))}
                </ul>
              </div>
            </div>

            {selectedRole && (
              <FrostCard className="basic-card roles-detail-card">
                <header className="basic-card-header">
                  <span className="basic-card-icon">
                    <AppIcon
                      icon={SolarVerifiedCheck}
                      size={16}
                      aria-hidden="true"
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="roles-detail-title-row">
                      <h2>{tl(selectedRole.name)}</h2>
                      <StatusBadge
                        tone={selectedRole.builtin ? "neutral" : "info"}
                      >
                        {selectedRole.builtin
                          ? tl("预置角色")
                          : tl("自定义角色")}
                      </StatusBadge>
                      {selectedRole.disabled && (
                        <StatusBadge tone="neutral">{tl("已停用")}</StatusBadge>
                      )}
                    </div>
                    <p>{tl(selectedRole.description)}</p>
                  </div>
                  {(canDisableSelectedRole || !selectedRole.builtin) && (
                    <div className="basic-card-actions">
                      <OrganizationLifecycleActions
                        disabled={Boolean(selectedRole.disabled)}
                        onToggle={
                          canDisableSelectedRole
                            ? () => {
                                const disabled = !selectedRole.disabled
                                if (
                                  workspaceActions.setRoleDisabled(
                                    selectedRole.id,
                                    disabled
                                  )
                                ) {
                                  toast.success(
                                    disabled ? tl("已停用") : tl("已启用")
                                  )
                                }
                              }
                            : undefined
                        }
                        onDelete={
                          selectedRole.builtin
                            ? undefined
                            : () => requestDeleteRole(selectedRole)
                        }
                      />
                    </div>
                  )}
                </header>

                <Tabs
                  value={detailTab}
                  onValueChange={(v) =>
                    setDetailTab(v as "permissions" | "members")
                  }
                  className="roles-detail-tabs"
                >
                  <div className="roles-tabs-bar">
                    <TabsList>
                      <TabsTrigger value="permissions">
                        <AppIcon
                          icon={SolarVerifiedCheck}
                          size={15}
                          data-icon="inline-start"
                          aria-hidden="true"
                        />
                        {tl("权限配置")}
                      </TabsTrigger>
                      <TabsTrigger value="members">
                        <AppIcon
                          icon={SolarUsersGroupRounded}
                          size={15}
                          data-icon="inline-start"
                          aria-hidden="true"
                        />
                        {tl("关联成员")}
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent
                    value="permissions"
                    className="roles-tab-panel"
                    hidden={detailTab !== "permissions"}
                  >
                    <div className="roles-perm-bar">
                      <div className="roles-inherit-meta">
                        {parentRole ? (
                          <>
                            <span>{tl("上级角色")}：</span>
                            <strong>{tl(parentRole.name)}</strong>
                            <span>· {tl("子角色默认继承父角色权限")}</span>
                          </>
                        ) : (
                          <span>{tl("根级角色 · 拥有组织顶级权限基线")}</span>
                        )}
                      </div>
                      <Button
                        type="button"
                        size="small"
                        variant={isProtectedAdmin ? "outline" : "default"}
                        disabled={isProtectedAdmin}
                        onClick={openPermDialog}
                      >
                        <AppIcon
                          icon={SolarCog}
                          data-icon="inline-start"
                          aria-hidden
                        />
                        {isProtectedAdmin ? tl("系统保护") : tl("配置权限")}
                      </Button>
                    </div>

                    <div className="roles-detail-scroll">
                      {isProtectedAdmin && (
                        <div className="roles-protected-note" role="status">
                          <AppIcon
                            icon={SolarShieldAlert}
                            size={16}
                            aria-hidden="true"
                          />
                          <span>
                            {tl(
                              "「超级管理员」为系统内置保护角色，始终保留全部权限，避免误操作导致工作区锁死。如需精细拆分权限，可点击右上角「子角色」创建继承子角色。"
                            )}
                          </span>
                        </div>
                      )}

                      {grantedGroups.length === 0 ? (
                        <EmptyState
                          icon={SolarVerifiedCheck}
                          title={tl("该角色暂未配置权限")}
                          action={
                            !isProtectedAdmin ? (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={openPermDialog}
                              >
                                <AppIcon
                                  icon={SolarCog}
                                  data-icon="inline-start"
                                  aria-hidden
                                />
                                {tl("配置权限")}
                              </Button>
                            ) : null
                          }
                        />
                      ) : (
                        grantedGroups.map((group) => (
                          <section key={group.group} className="roles-section">
                            <header className="roles-section-head">
                              <div className="roles-section-title">
                                <h3>{tl(group.group)}</h3>
                                <p>{tl(group.description)}</p>
                              </div>
                              <span className="roles-section-count financial-number">
                                {group.grantedItems.length} /{" "}
                                {group.items.length}
                              </span>
                            </header>

                            <div className="basic-rows">
                              {group.grantedItems.map((item) => {
                                const inherited =
                                  parentRole !== null &&
                                  parentPermSet.has(item.id)
                                return (
                                  <div key={item.id} className="basic-row">
                                    <div className="basic-row-text">
                                      <span className="roles-perm-label-row">
                                        <b>{tl(item.label)}</b>
                                        {item.sensitive && (
                                          <StatusBadge tone="warning">
                                            {tl("高敏")}
                                          </StatusBadge>
                                        )}
                                        {inherited && (
                                          <span className="roles-perm-tag">
                                            {tl("继承自上级")}
                                          </span>
                                        )}
                                      </span>
                                      <small>{tl(item.description)}</small>
                                    </div>
                                    <div className="basic-row-control">
                                      <StatusBadge tone="success">
                                        {tl("已授权")}
                                      </StatusBadge>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </section>
                        ))
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent
                    value="members"
                    className="roles-tab-panel"
                    hidden={detailTab !== "members"}
                  >
                    <div className="settings-register roles-members-table-wrap">
                      <div className="bills-toolbar">
                        <div className="bills-toolbar-fields" role="search">
                          <div
                            className="bills-search field-surface"
                            data-field-focus="quiet"
                          >
                            <label className="sr-only" htmlFor={memberSearchId}>
                              {tl("搜索成员姓名、邮箱或部门")}
                            </label>
                            <AppIcon icon={SolarSearch} size={16} />
                            <Input
                              embedded
                              id={memberSearchId}
                              type="search"
                              controlSize="dense"
                              className="bills-search-input"
                              value={memberQuery}
                              onChange={(e) => {
                                membersTable.firstPage()
                                setMemberQuery(e.target.value)
                              }}
                              placeholder={tl("搜索成员姓名、邮箱或部门")}
                            />
                          </div>

                          <div className="bills-selects">
                            <Select
                              value={memberStatusFilter}
                              onValueChange={(value) => {
                                membersTable.firstPage()
                                setMemberStatusFilter(value)
                              }}
                            >
                              <SelectTrigger
                                size="dense"
                                aria-label={tl("按状态筛选")}
                                className="data-table-filter"
                                data-active={
                                  memberStatusFilter !== "all" || undefined
                                }
                              >
                                <span
                                  className="bill-filter-label"
                                  aria-hidden="true"
                                >
                                  {tl("状态：")}
                                </span>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent position="popper" align="start">
                                <SelectItem value="all">
                                  {tl("全部")}
                                </SelectItem>
                                <SelectItem value="active">
                                  {tl("正常")}
                                </SelectItem>
                                <SelectItem value="invited">
                                  {tl("待激活")}
                                </SelectItem>
                                <SelectItem value="disabled">
                                  {tl("已禁用")}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {hasMemberFilters && (
                            <Button
                              className="bills-reset"
                              type="button"
                              variant="outline"
                              size="dense"
                              shape="workspace"
                              onClick={() => {
                                setMemberQuery("")
                                setMemberStatusFilter("all")
                                membersTable.firstPage()
                              }}
                            >
                              {tl("清除筛选")}
                            </Button>
                          )}

                          <Button
                            type="button"
                            size="small"
                            className="settings-toolbar-action"
                            disabled={assignableMembers.length === 0}
                            onClick={() => {
                              setMembersToAssign([])
                              setAssignOpen(true)
                            }}
                          >
                            <AppIcon
                              icon={SolarPlus}
                              data-icon="inline-start"
                              aria-hidden
                            />
                            {tl("添加")}
                          </Button>
                        </div>
                      </div>

                      <DataTable
                        table={membersTable}
                        caption={tl("关联成员")}
                        columnAlign={memberColumnAlign}
                        rowHeaderColumn="name"
                        selectAllLabel={tl("选择本页所有成员")}
                        selectRowLabel={(row) =>
                          tl("选择成员 {{name}}", { name: tl(row.name) })
                        }
                        paginationLabel={tl("成员分页")}
                        empty={
                          <EmptyState
                            icon={SolarUsersGroupRounded}
                            title={
                              hasMemberFilters
                                ? tl("没有匹配的成员")
                                : tl("该角色暂未分配成员")
                            }
                          />
                        }
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </FrostCard>
            )}
          </MotionDiv>
        )}
      </AnimatePresence>

      {/* File Tree Permission Picker Modal Card */}
      <Dialog open={permDialogOpen} onOpenChange={setPermDialogOpen}>
        <DialogContent className="roles-perm-dialog sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {tl("配置「{{name}}」权限", {
                name: tl(selectedRole?.name ?? ""),
              })}
            </DialogTitle>
            <DialogDescription>
              {tl("按功能目录树勾选所需权限，确认保存后生效并同步展示。")}
            </DialogDescription>
          </DialogHeader>

          <div className="roles-perm-dialog-tools">
            <div
              className="dept-tree-search roles-perm-dialog-search field-surface"
              data-field-focus="quiet"
            >
              <label className="sr-only" htmlFor={permSearchId}>
                {tl("搜索权限名称或说明")}
              </label>
              <AppIcon icon={SolarSearch} size={16} />
              <Input
                embedded
                id={permSearchId}
                type="search"
                controlSize="dense"
                className="bills-search-input"
                value={permQuery}
                onChange={(e) => setPermQuery(e.target.value)}
                placeholder={tl("搜索权限名称或说明")}
              />
            </div>
            {parentRole && (
              <Button
                type="button"
                size="small"
                variant="outline"
                onClick={() => setPermDraft([...parentRole.permissions])}
              >
                {tl("恢复继承上级权限")}
              </Button>
            )}
          </div>

          <div className="roles-perm-tree-scroll">
            {filteredPermGroups.length === 0 ? (
              <EmptyState
                icon={SolarVerifiedCheck}
                title={tl("没有匹配的权限项")}
              />
            ) : (
              <ul className="roles-perm-tree">
                {filteredPermGroups.map((group) => {
                  const itemIds = group.items.map((item) => item.id)
                  const checkedCount = itemIds.filter((id) =>
                    permDraft.includes(id)
                  ).length
                  const allChecked =
                    itemIds.length > 0 && checkedCount === itemIds.length
                  const someChecked = checkedCount > 0 && !allChecked
                  const expanded =
                    permQuery.trim() !== "" ||
                    expandedPermGroups.has(group.group)
                  const groupCheckboxId = `tree-group-${group.group}`

                  return (
                    <li key={group.group}>
                      <div className="roles-perm-tree-folder">
                        <button
                          type="button"
                          className="roles-perm-tree-toggle"
                          aria-expanded={expanded}
                          aria-label={tl("展开或收起 {{name}}", {
                            name: tl(group.group),
                          })}
                          onClick={() => togglePermGroupExpand(group.group)}
                        >
                          <AppIcon
                            icon={SolarChevronDown}
                            size={14}
                            aria-hidden="true"
                          />
                        </button>
                        <Checkbox
                          id={groupCheckboxId}
                          checked={
                            allChecked
                              ? true
                              : someChecked
                                ? "indeterminate"
                                : false
                          }
                          onCheckedChange={(state) =>
                            toggleDraftGroup(itemIds, state === true)
                          }
                        />
                        <label
                          htmlFor={groupCheckboxId}
                          className="roles-perm-tree-folder-label"
                        >
                          <AppIcon
                            icon={SolarFolder}
                            size={15}
                            aria-hidden="true"
                          />
                          <span className="truncate">{tl(group.group)}</span>
                        </label>
                        <span className="roles-section-count financial-number">
                          {checkedCount} / {itemIds.length}
                        </span>
                      </div>

                      <div
                        className="nav-tree-panel"
                        data-expanded={expanded ? "true" : "false"}
                        inert={!expanded || undefined}
                      >
                        <div className="nav-tree-panel-inner">
                          <ul className="nav-tree-children">
                            {group.items.map((item) => {
                              const checked = permDraft.includes(item.id)
                              const inherited =
                                parentRole !== null &&
                                parentPermSet.has(item.id)
                              const leafId = `tree-perm-${item.id}`
                              return (
                                <li key={item.id}>
                                  <div className="roles-perm-tree-leaf">
                                    <Checkbox
                                      id={leafId}
                                      checked={checked}
                                      onCheckedChange={() =>
                                        toggleDraftPerm(item.id)
                                      }
                                    />
                                    <label
                                      htmlFor={leafId}
                                      className="roles-perm-tree-leaf-text"
                                    >
                                      <span className="roles-perm-label-row">
                                        <b>{tl(item.label)}</b>
                                        {item.sensitive && (
                                          <StatusBadge tone="warning">
                                            {tl("高敏")}
                                          </StatusBadge>
                                        )}
                                        {inherited && (
                                          <span className="roles-perm-tag">
                                            {tl("继承自上级")}
                                          </span>
                                        )}
                                      </span>
                                      <small>{tl(item.description)}</small>
                                    </label>
                                  </div>
                                </li>
                              )
                            })}
                          </ul>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          <DialogFooter className="roles-perm-dialog-footer">
            <div className="roles-perm-dialog-summary">
              <span>
                {tl("已选")}{" "}
                <strong className="financial-number">
                  {permDraft.length} / {allPermissionIds.length}
                </strong>
              </span>
              {permDialogDiff.dirty && (
                <span className="financial-number">
                  {permDialogDiff.added > 0 && (
                    <span className="roles-delta-add">
                      +{permDialogDiff.added}
                    </span>
                  )}{" "}
                  {permDialogDiff.removed > 0 && (
                    <span className="roles-delta-remove">
                      -{permDialogDiff.removed}
                    </span>
                  )}
                </span>
              )}
              <span>
                ·{" "}
                {tl("保存后将影响 {{count}} 位成员", {
                  count: roleMembers.length,
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPermDialogOpen(false)}
              >
                {tl("取消")}
              </Button>
              <Button type="button" onClick={handleConfirmPermissions}>
                {tl("确认保存")}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create custom role / sub-role dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{tl("新建自定义角色")}</DialogTitle>
            <DialogDescription>
              {selectedParentForCreate
                ? tl(
                    "将挂靠在「{{parent}}」下，默认继承其 {{count}} 项权限。",
                    {
                      parent: tl(selectedParentForCreate.name),
                      count: selectedParentForCreate.permissions.length,
                    }
                  )
                : tl("创建顶级自定义角色，默认从最小权限起步。")}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateRole} className="grid gap-3">
            <Field>
              <FieldLabel htmlFor="role-parent">{tl("上级角色")}</FieldLabel>
              <Select value={newParentId} onValueChange={setNewParentId}>
                <SelectTrigger id="role-parent" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="none">{tl("无（顶级角色）")}</SelectItem>
                  {store.roles.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {tl(r.name)}（{r.permissions.length} {tl("项权限")}）
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="role-name">{tl("角色名称")}</FieldLabel>
              <Input
                id="role-name"
                controlSize="dense"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={tl("例如：审计专员")}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="role-desc">{tl("职责说明")}</FieldLabel>
              <Textarea
                id="role-desc"
                rows={2}
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder={tl("描述该角色适用的业务范围")}
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
              <Button type="submit">{tl("创建角色")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit role name & description dialog */}
      <Dialog
        open={editingRole !== null}
        onOpenChange={(open) => {
          if (!open) setEditingRole(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{tl("编辑名称与说明")}</DialogTitle>
            <DialogDescription>
              {tl("更新后的角色信息将实时同步至成员管理与操作审计日志。")}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveRoleMeta} className="grid gap-3">
            <Field>
              <FieldLabel htmlFor="edit-role-name">{tl("角色名称")}</FieldLabel>
              <Input
                id="edit-role-name"
                controlSize="dense"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="edit-role-desc">{tl("职责说明")}</FieldLabel>
              <Textarea
                id="edit-role-desc"
                rows={2}
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
              />
            </Field>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingRole(null)}
              >
                {tl("取消")}
              </Button>
              <Button type="submit">{tl("保存变更")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <OrganizationDeleteDialog
        name={deletingRole ? tl(deletingRole.name) : null}
        onClose={() => setDeletingRole(null)}
        onConfirm={() => deletingRole && handleDeleteRole(deletingRole)}
      />

      {/* Assign member to current role dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{tl("添加成员到此角色")}</DialogTitle>
            <DialogDescription>
              {tl("所选成员将切换为「{{role}}」并立即继承对应权限。", {
                role: tl(selectedRole?.name ?? ""),
              })}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAssignMember} className="grid gap-3">
            <Field>
              <FieldLabel htmlFor="assign-member-select">
                {tl("选择成员")}
              </FieldLabel>
              <Combobox
                multiple
                inline
                open
                items={assignableMembers}
                value={membersToAssign}
                onValueChange={setMembersToAssign}
                itemToStringLabel={(member) => tl(member.name)}
                isItemEqualToValue={(member, selected) =>
                  member.id === selected.id
                }
                filter={matchesMemberSearch}
              >
                <ComboboxChips className="max-h-28 overflow-y-auto pointer-coarse:min-h-(--control-size-dense)">
                  {membersToAssign.map((member) => (
                    <ComboboxChip key={member.id}>
                      {tl(member.name)}
                    </ComboboxChip>
                  ))}
                  <ComboboxChipsInput
                    id="assign-member-select"
                    placeholder={tl("搜索姓名或邮箱")}
                  />
                </ComboboxChips>
                <MemberSearchResults />
              </Combobox>
            </Field>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAssignOpen(false)}
              >
                {tl("取消")}
              </Button>
              <Button type="submit" disabled={membersToAssign.length === 0}>
                {tl("确认分配")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
