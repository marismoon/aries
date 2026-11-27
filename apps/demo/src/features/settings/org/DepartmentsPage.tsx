import {
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react"
import { useReducedMotion } from "motion/react"
import { button as MotionButton } from "motion/react-m"
import { toast } from "sonner"

import { useIsMobile } from "@marismoon/ui/hooks/use-mobile"
import {
  AppIcon,
  SolarBuildings2,
  SolarPen,
  SolarPlus,
  SolarSearch,
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
import { Combobox, ComboboxInput } from "@marismoon/ui/ui/combobox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { InputGroupAddon } from "@marismoon/ui/ui/input-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@marismoon/ui/ui/select"
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
import type { DemoDepartment } from "@/shared/types/workspace-settings"
import { SparklineKpiCard } from "../SettingsSummaryVisuals"
import { matchesMemberSearch, MemberSearchResults } from "./MemberSearchResults"
import {
  OrganizationDeleteDialog,
  OrganizationLifecycleActions,
} from "./OrganizationLifecycle"
import {
  collectDescendantIds,
  getDeptDepth,
  OrgDepartmentTree,
} from "./OrgDepartmentTree"

import "../../bills/components/bill-drawer.css"
import "../../bills/components/bills-controls.css"
import "../../bills/components/bills-table.css"
import "../settings-table.css"
import "./departments-tree.css"

interface SubDeptRow extends DemoDepartment {
  memberCount: number
  childDeptCount: number
}

const column = createDataTableColumns<SubDeptRow>()
const columnAlign = {
  memberCount: "end",
  monthlyBudgetWan: "end",
  actions: "end",
} as const

export function DepartmentsSummary() {
  const tl = useUiText()
  const store = useWorkspaceStore()

  const totalDepts = store.departments.length
  const rootCount = store.departments.filter((d) => !d.parentId).length
  const level1Count = store.departments.filter(
    (d) => getDeptDepth(d, store.departments) === 1
  ).length
  const subCount = totalDepts - rootCount - level1Count

  const subDepts = store.departments.filter((d) => d.parentId !== null)
  const totalBudget = subDepts.reduce((sum, d) => sum + d.monthlyBudgetWan, 0)
  const deptHeadcountBars = subDepts.slice(0, 6).map((dept) => {
    const ids = collectDescendantIds(dept.id, store.departments)
    return {
      label: tl(dept.name),
      value: store.members.filter((m) => ids.has(m.departmentId)).length,
    }
  })

  const budgetTrend = [
    { label: "6月", value: Math.round(totalBudget * 0.86) },
    { label: "7月", value: Math.round(totalBudget * 0.9) },
    { label: "8月", value: Math.round(totalBudget * 0.93) },
    { label: "9月", value: Math.round(totalBudget * 0.96) },
    { label: "10月", value: Math.round(totalBudget * 0.98) },
    { label: "11月", value: totalBudget },
  ]

  const totalMembers = store.members.length
  const assignedMembers = store.members.filter((m) =>
    subDepts.some((d) => d.id === m.departmentId)
  ).length
  const coverageRate =
    totalMembers > 0 ? Math.round((assignedMembers / totalMembers) * 100) : 100
  const coverageTrend = [
    { label: "W1", value: Math.max(coverageRate - 8, 70) },
    { label: "W2", value: Math.max(coverageRate - 6, 75) },
    { label: "W3", value: Math.max(coverageRate - 4, 82) },
    { label: "W4", value: Math.max(coverageRate - 2, 88) },
    { label: "W5", value: Math.max(coverageRate - 1, 92) },
    { label: "W6", value: coverageRate },
  ]

  return (
    <section
      className="settings-summary-grid"
      data-cols="3"
      aria-label={tl("部门架构概况")}
    >
      <SparklineKpiCard
        featured
        label={tl("组织节点与层级")}
        value={`${totalDepts} ${tl("个")}`}
        formatHoverValue={(v) => `${v} ${tl("人")}`}
        badge={`${tl("一级部门")} ${level1Count}`}
        badgeTone="info"
        note={tl("二级及以下 {{sub}} 个（柱状为各部门编制人数）", {
          sub: subCount,
        })}
        data={deptHeadcountBars}
        variant="bar"
        color="var(--chart-1)"
      />

      <SparklineKpiCard
        label={tl("月度云预算池")}
        value={`¥${totalBudget} ${tl("万")}`}
        formatHoverValue={(v) => `¥${v} ${tl("万")}`}
        badge={`${subDepts.length} ${tl("个成本中心")}`}
        badgeTone="success"
        note={tl("近 6 月部门月度预算总额走势")}
        data={budgetTrend}
        variant="area"
        color="var(--chart-2)"
      />

      <SparklineKpiCard
        label={tl("成员归属覆盖")}
        value={`${coverageRate}%`}
        formatHoverValue={(v) => `${v}%`}
        badge={`${assignedMembers}/${totalMembers}`}
        badgeTone="success"
        note={tl("已分配至业务部门与对应成本中心")}
        data={coverageTrend}
        variant="line"
        color="var(--chart-positive)"
      />
    </section>
  )
}

export function DepartmentsPage() {
  const tl = useUiText()
  const reducedMotion = Boolean(useReducedMotion())
  const mobile = useIsMobile()
  const subSearchId = useId()
  const subSearch = useRef<HTMLInputElement>(null)
  const store = useWorkspaceStore()

  const [selectedId, setSelectedId] = useState(
    store.departments[0]?.id ?? "dept-root"
  )
  const [subQuery, setSubQuery] = useState("")

  // Create sub-department dialog
  const [createParent, setCreateParent] = useState<DemoDepartment | null>(null)
  const [newName, setNewName] = useState("")
  const [newLeaderId, setNewLeaderId] = useState("")
  const [leaderQuery, setLeaderQuery] = useState("")
  const newLeader = store.members.find((member) => member.id === newLeaderId)
  const showLeaderResults = !newLeader && leaderQuery.trim() !== ""
  const [newCostCenter, setNewCostCenter] = useState("CC-401")
  const [newBudget, setNewBudget] = useState("50")

  // Rename dialog
  const [renamingDept, setRenamingDept] = useState<DemoDepartment | null>(null)
  const [renameDraft, setRenameDraft] = useState("")

  // Edit department drawer
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null)
  const [deletingDept, setDeletingDept] = useState<DemoDepartment | null>(null)
  const [editLeader, setEditLeader] = useState("")
  const [editCostCenter, setEditCostCenter] = useState("")
  const [editBudget, setEditBudget] = useState("")

  const selected =
    store.departments.find((d) => d.id === selectedId) ?? store.departments[0]
  const editingDept =
    store.departments.find((d) => d.id === editingDeptId) ?? null

  const selectedMemberCount = useMemo(() => {
    if (!selected) return 0
    const ids = collectDescendantIds(selected.id, store.departments)
    return store.members.filter((m) => ids.has(m.departmentId)).length
  }, [selected, store.departments, store.members])

  const subDepartmentRows = useMemo<SubDeptRow[]>(() => {
    if (!selected) return []
    const q = subQuery.trim().toLowerCase()
    return store.departments
      .filter((d) => d.parentId === selected.id)
      .map((dept) => {
        const descendants = collectDescendantIds(dept.id, store.departments)
        return {
          ...dept,
          memberCount: store.members.filter((m) =>
            descendants.has(m.departmentId)
          ).length,
          childDeptCount: store.departments.filter(
            (c) => c.parentId === dept.id
          ).length,
        }
      })
      .filter((row) => {
        if (!q) return true
        return (
          row.name.toLowerCase().includes(q) ||
          tl(row.name).toLowerCase().includes(q) ||
          row.costCenter.toLowerCase().includes(q) ||
          row.leader.toLowerCase().includes(q)
        )
      })
  }, [selected, store.departments, store.members, subQuery, tl])

  const openCreateDialog = useCallback(
    (parent: DemoDepartment) => {
      setCreateParent(parent)
      setNewName("")
      setNewLeaderId("")
      setLeaderQuery("")
      setNewCostCenter("CC-401")
      setNewBudget("50")
    },
    [setNewCostCenter, setNewBudget]
  )

  function openRenameDialog(dept: DemoDepartment) {
    setRenamingDept(dept)
    setRenameDraft(dept.name)
  }

  function openEditDrawer(dept: DemoDepartment) {
    setEditingDeptId(dept.id)
    setEditLeader(dept.leader)
    setEditCostCenter(dept.costCenter)
    setEditBudget(String(dept.monthlyBudgetWan))
  }

  const columns = useMemo(
    () =>
      column.columns([
        column.display({ id: "selection" }),
        column.accessor("name", {
          header: tl("部门名称"),
          cell: ({ row }) => (
            <>
              <button
                type="button"
                className="bill-row-id text-left hover:underline"
                onClick={() => setSelectedId(row.original.id)}
              >
                {tl(row.original.name)}
              </button>
              {row.original.disabled && (
                <StatusBadge tone="neutral" className="ms-2">
                  {tl("已停用")}
                </StatusBadge>
              )}
              <span className="bill-row-account">
                {tl("{{count}} 个下级部门", {
                  count: row.original.childDeptCount,
                })}
              </span>
            </>
          ),
        }),
        column.accessor("costCenter", {
          header: tl("成本中心编码"),
          cell: ({ getValue }) => (
            <span className="bill-row-pill financial-number">{getValue()}</span>
          ),
        }),
        column.accessor("leader", {
          header: tl("部门负责人"),
          cell: ({ getValue }) => tl(getValue()),
        }),
        column.accessor("memberCount", {
          header: tl("部门人数"),
          cell: ({ getValue }) => (
            <span className="financial-number">
              {getValue()} {tl("人")}
            </span>
          ),
        }),
        column.accessor("monthlyBudgetWan", {
          header: tl("月度预算（万元）"),
          cell: ({ getValue }) => (
            <span className="font-semibold financial-number">
              ¥{getValue()} {tl("万")}
            </span>
          ),
        }),
        column.display({
          id: "actions",
          header: tl("操作"),
          cell: ({ row }) => (
            <div className="inline-flex items-center justify-end gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="bill-detail-action"
                aria-label={tl("创建子部门")}
                title={tl("创建子部门")}
                disabled={row.original.disabled}
                onClick={() => openCreateDialog(row.original)}
              >
                <AppIcon icon={SolarPlus} size={16} />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="bill-detail-action"
                aria-label={tl("编辑部门")}
                title={tl("编辑部门")}
                onClick={() => openEditDrawer(row.original)}
              >
                <AppIcon icon={SolarPen} size={16} />
              </Button>
            </div>
          ),
        }),
      ]),
    [openCreateDialog, tl]
  )

  const table = useDataTable({
    columns,
    data: subDepartmentRows,
    getRowId: (row) => row.id,
    initialState: { pagination: { pageIndex: 0, pageSize: 10 } },
  })

  function handleSaveDept(event: FormEvent) {
    event.preventDefault()
    if (!editingDept) return
    workspaceActions.updateDepartment(editingDept.id, {
      leader: editLeader.trim() || editingDept.leader,
      costCenter: editCostCenter.trim() || editingDept.costCenter,
      monthlyBudgetWan: Number(editBudget) || editingDept.monthlyBudgetWan,
    })
    setEditingDeptId(null)
    toast.success(tl("已保存部门信息"))
  }

  function handleDeleteDepartment(department: DemoDepartment) {
    const result = workspaceActions.deleteDepartment(department.id)
    if (result === "in-use") {
      toast.error(tl("请先迁移该部门的成员和下级部门"))
    } else if (result === "blocked") {
      toast.error(tl("无法删除该部门"))
    } else {
      if (selectedId === department.id)
        setSelectedId(department.parentId ?? "dept-root")
      setEditingDeptId(null)
      table.setRowSelection((selection) => {
        const next = { ...selection }
        delete next[department.id]
        return next
      })
      if (table.getRowModel().rows.length === 1) table.firstPage()
      toast.success(tl("已删除部门"))
    }
  }

  function handleCreateDept(event: FormEvent) {
    event.preventDefault()
    if (!newName.trim() || !createParent) {
      toast.error(tl("请填写部门名称"))
      return
    }
    if (!newLeader) return
    const id = workspaceActions.addDepartment({
      name: newName.trim(),
      parentId: createParent.id,
      leader: newLeader.name,
      costCenter: newCostCenter.trim() || "CC-999",
      monthlyBudgetWan: Number(newBudget) || 30,
    })
    if (!id) {
      toast.error(tl("请选择可用的上级部门"))
      return
    }
    setSelectedId(id)
    setCreateParent(null)
    toast.success(tl("已新增子部门"))
  }

  function handleRenameDept(event: FormEvent) {
    event.preventDefault()
    if (!renamingDept || !renameDraft.trim()) {
      toast.error(tl("请填写部门名称"))
      return
    }
    workspaceActions.renameDepartment(renamingDept.id, renameDraft.trim())
    setRenamingDept(null)
    toast.success(tl("已修改部门名称"))
  }

  return (
    <>
      <div className="dept-split">
        <OrgDepartmentTree
          storageKey="aries-demo-tree-expanded-departments"
          searchToolbarActions={
            <Tooltip>
              <TooltipTrigger asChild>
                <MotionButton
                  type="button"
                  className="dept-tree-quick-btn"
                  aria-label={tl("新增子部门")}
                  disabled={!selected || selected.disabled}
                  whileHover={reducedMotion ? undefined : { scale: 1.12 }}
                  whileTap={reducedMotion ? undefined : { scale: 0.86 }}
                  transition={{ type: "spring", stiffness: 520, damping: 24 }}
                  onClick={() => {
                    if (selected) openCreateDialog(selected)
                  }}
                >
                  <AppIcon icon={SolarPlus} size={16} aria-hidden="true" />
                </MotionButton>
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={6}>
                {tl("新增子部门")}
              </TooltipContent>
            </Tooltip>
          }
          showExpandToggle
          departments={store.departments}
          members={store.members}
          selectedId={selected?.id ?? ""}
          editable
          onSelect={(id) => {
            setSelectedId(id)
            table.firstPage()
          }}
          onCreateChild={openCreateDialog}
          onEdit={openEditDrawer}
          onRename={openRenameDialog}
        />

        <FrostCard className="settings-register settings-subdepts-table">
          <div className="bills-toolbar">
            <div className="bills-toolbar-head">
              <span className="bills-toolbar-title">
                {tl(selected?.name ?? "组织架构")} · {tl("下级部门")}
              </span>
              {selected?.disabled && (
                <StatusBadge tone="neutral">{tl("已停用")}</StatusBadge>
              )}
            </div>

            {selected && (
              <div className="dept-meta-bar">
                <span>
                  {tl("部门负责人")}：<strong>{tl(selected.leader)}</strong>
                </span>
                <span>
                  {tl("成本中心编码")}：
                  <strong className="financial-number">
                    {selected.costCenter}
                  </strong>
                </span>
                <span>
                  {tl("月度预算（万元）")}：
                  <strong className="financial-number">
                    ¥{selected.monthlyBudgetWan} {tl("万")}
                  </strong>
                </span>
                <span>
                  {tl("部门人数")}：
                  <strong className="financial-number">
                    {selectedMemberCount} {tl("人")}
                  </strong>
                </span>
              </div>
            )}

            <div className="bills-toolbar-fields" role="search">
              <div
                className="bills-search data-table-search field-surface"
                data-field-focus="quiet"
              >
                <label className="sr-only" htmlFor={subSearchId}>
                  {tl("搜索下级部门、成本中心或负责人")}
                </label>
                <AppIcon icon={SolarSearch} size={16} />
                <Input
                  embedded
                  ref={subSearch}
                  className="bills-search-input"
                  controlSize="dense"
                  id={subSearchId}
                  type="search"
                  value={subQuery}
                  onChange={(e) => {
                    table.firstPage()
                    setSubQuery(e.target.value)
                  }}
                  placeholder={tl("搜索下级部门、成本中心或负责人")}
                />
              </div>
            </div>
          </div>

          <DataTable
            table={table}
            caption={tl("下级部门")}
            columnAlign={columnAlign}
            rowHeaderColumn="name"
            selectAllLabel={tl("选择本页所有部门")}
            selectRowLabel={(row) =>
              tl("选择部门 {{name}}", { name: tl(row.name) })
            }
            paginationLabel={tl("下级部门")}
            scrollHint={tl("横向滚动查看成本中心与月度预算")}
            empty={
              <EmptyState
                icon={SolarBuildings2}
                title={
                  subQuery.trim()
                    ? tl("没有匹配的下级部门")
                    : tl("暂无下级部门")
                }
                action={
                  subQuery.trim() ? (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSubQuery("")
                        subSearch.current?.focus()
                      }}
                    >
                      {tl("清除搜索")}
                    </Button>
                  ) : selected ? (
                    <Button
                      variant="outline"
                      disabled={selected.disabled}
                      onClick={() => openCreateDialog(selected)}
                    >
                      <AppIcon
                        icon={SolarPlus}
                        data-icon="inline-start"
                        aria-hidden
                      />
                      {tl("新增子部门")}
                    </Button>
                  ) : null
                }
              />
            }
          />
        </FrostCard>
      </div>

      <Drawer
        open={editingDept !== null}
        onOpenChange={(open) => {
          if (!open) setEditingDeptId(null)
        }}
        direction={mobile ? "bottom" : "right"}
        noBodyStyles
      >
        <DrawerContent>
          {editingDept && (
            <>
              <DrawerHeader>
                <DrawerTitle>{tl(editingDept.name)}</DrawerTitle>
                {editingDept.disabled && (
                  <StatusBadge tone="neutral" className="w-fit">
                    {tl("已停用")}
                  </StatusBadge>
                )}
                <DrawerDescription>
                  {tl("维护部门负责人、成本中心编码与月度云资源预算上限")}
                </DrawerDescription>
              </DrawerHeader>
              <form
                id="dept-edit-form"
                onSubmit={handleSaveDept}
                className="bill-drawer-body grid min-h-0 flex-1 content-start gap-4 overflow-y-auto px-4"
                data-vaul-no-drag=""
              >
                <Field>
                  <FieldLabel htmlFor="dept-leader">
                    {tl("部门负责人")}
                  </FieldLabel>
                  <Select value={editLeader} onValueChange={setEditLeader}>
                    <SelectTrigger id="dept-leader" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {store.members.map((m) => (
                        <SelectItem key={m.id} value={m.name}>
                          {tl(m.name)}（{m.email}）
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="dept-cc">
                    {tl("成本中心编码")}
                  </FieldLabel>
                  <Input
                    id="dept-cc"
                    controlSize="dense"
                    className="financial-number"
                    value={editCostCenter}
                    onChange={(e) => setEditCostCenter(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="dept-budget">
                    {tl("月度预算（万元）")}
                  </FieldLabel>
                  <Input
                    id="dept-budget"
                    type="number"
                    min={1}
                    controlSize="dense"
                    className="financial-number"
                    value={editBudget}
                    onChange={(e) => setEditBudget(e.target.value)}
                  />
                </Field>
              </form>
              <DrawerFooter>
                {editingDept.parentId && (
                  <OrganizationLifecycleActions
                    disabled={Boolean(editingDept.disabled)}
                    onToggle={() => {
                      const disabled = !editingDept.disabled
                      if (
                        workspaceActions.setDepartmentDisabled(
                          editingDept.id,
                          disabled
                        )
                      ) {
                        toast.success(disabled ? tl("已停用") : tl("已启用"))
                      }
                    }}
                    onDelete={() => setDeletingDept(editingDept)}
                  />
                )}
                <Button type="submit" form="dept-edit-form">
                  {tl("保存")}
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
      <OrganizationDeleteDialog
        name={deletingDept ? tl(deletingDept.name) : null}
        onClose={() => setDeletingDept(null)}
        onConfirm={() => deletingDept && handleDeleteDepartment(deletingDept)}
      />

      <Dialog
        open={createParent !== null}
        onOpenChange={(open) => {
          if (!open) setCreateParent(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{tl("新增子部门")}</DialogTitle>
            <DialogDescription>
              {tl("将挂靠在当前选中部门「{{parent}}」下。", {
                parent: tl(createParent?.name ?? ""),
              })}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateDept} className="grid gap-3">
            <Field>
              <FieldLabel htmlFor="new-dept-name">{tl("部门名称")}</FieldLabel>
              <Input
                id="new-dept-name"
                controlSize="dense"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={tl("例如：数据智能组")}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="new-dept-leader">
                {tl("部门负责人")}
              </FieldLabel>
              <Combobox
                items={store.members}
                inline={showLeaderResults}
                open={showLeaderResults}
                autoHighlight
                value={newLeader ?? null}
                inputValue={newLeader ? tl(newLeader.name) : leaderQuery}
                onInputValueChange={(value, details) => {
                  if (details.reason !== "input-change") return
                  setNewLeaderId("")
                  setLeaderQuery(value)
                }}
                onValueChange={(member) => {
                  setNewLeaderId(member?.id ?? "")
                  setLeaderQuery("")
                }}
                itemToStringLabel={(member) => tl(member.name)}
                filter={matchesMemberSearch}
              >
                <ComboboxInput
                  id="new-dept-leader"
                  placeholder={tl("搜索姓名或邮箱")}
                  showTrigger={false}
                  aria-required="true"
                >
                  <InputGroupAddon align="inline-start">
                    <AppIcon icon={SolarSearch} size={16} />
                  </InputGroupAddon>
                </ComboboxInput>
                {showLeaderResults && <MemberSearchResults />}
              </Combobox>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="new-dept-cc">
                  {tl("成本中心编码")}
                </FieldLabel>
                <Input
                  id="new-dept-cc"
                  controlSize="dense"
                  className="financial-number"
                  value={newCostCenter}
                  onChange={(e) => setNewCostCenter(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="new-dept-budget">
                  {tl("月度预算（万元）")}
                </FieldLabel>
                <Input
                  id="new-dept-budget"
                  type="number"
                  min={1}
                  controlSize="dense"
                  className="financial-number"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                />
              </Field>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateParent(null)}
              >
                {tl("取消")}
              </Button>
              <Button type="submit" disabled={!newLeader}>
                {tl("创建部门")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={renamingDept !== null}
        onOpenChange={(open) => {
          if (!open) setRenamingDept(null)
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{tl("修改部门名称")}</DialogTitle>
            <DialogDescription>
              {tl("修改后将实时同步至成员管理与操作审计日志。")}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRenameDept} className="grid gap-3">
            <Field>
              <FieldLabel htmlFor="rename-dept-input">
                {tl("部门名称")}
              </FieldLabel>
              <Input
                id="rename-dept-input"
                controlSize="dense"
                value={renameDraft}
                onChange={(e) => setRenameDraft(e.target.value)}
              />
            </Field>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setRenamingDept(null)}
              >
                {tl("取消")}
              </Button>
              <Button type="submit">{tl("保存变更")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
