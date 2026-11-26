import {
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type ReactNode,
} from "react"
import { useReducedMotion } from "motion/react"
import { button as MotionButton, span as MotionSpan } from "motion/react-m"
import { toast } from "sonner"

import { NavHighlight, SidebarNavItem } from "@marismoon/shell"
import {
  AppIcon,
  SolarArrowDown,
  SolarArrowRight,
  SolarArrowUp,
  SolarBuildings2,
  SolarChevronDown,
  SolarCog,
  SolarEllipsis,
  SolarEye,
  SolarEyeClosed,
  SolarFolder,
  SolarPen,
  SolarPlus,
  SolarSearch,
} from "@marismoon/ui/icons"
import { Button } from "@marismoon/ui/ui/button"
import {
  Dialog,
  DialogContent,
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@marismoon/ui/ui/tooltip"
import { useUiText } from "@/lib/i18n/use-ui-text"
import { workspaceActions } from "@/shared/mocks/workspace-store"
import type {
  DemoDepartment,
  DemoMember,
} from "@/shared/types/workspace-settings"
import { usePersistedExpandedIds } from "./use-persisted-expanded-ids"
import {
  MAX_TREE_VISUAL_DEPTH,
  TREE_ROLL_EASE,
  useTreeRollWindow,
  type RolledTreeBranch,
} from "./use-tree-roll-window"

export function getDeptDepth(
  dept: DemoDepartment,
  all: readonly DemoDepartment[]
): number {
  if (!dept.parentId) return 0
  const parent = all.find((d) => d.id === dept.parentId)
  return parent ? 1 + getDeptDepth(parent, all) : 0
}

export function collectDescendantIds(
  rootId: string,
  all: readonly DemoDepartment[]
): Set<string> {
  const result = new Set<string>([rootId])
  const queue = [rootId]
  while (queue.length > 0) {
    const current = queue.shift()
    for (const d of all) {
      if (d.parentId === current && !result.has(d.id)) {
        result.add(d.id)
        queue.push(d.id)
      }
    }
  }
  return result
}

interface OrgDepartmentTreeProps {
  title?: string
  /** Optional localStorage key to persist expanded/collapsed tree state. */
  storageKey?: string
  headerAction?: ReactNode
  /** Optional icon-only action buttons rendered directly below the search box. */
  searchToolbarActions?: ReactNode
  /** Show icon-only expand/collapse toggle below the search box. */
  showExpandToggle?: boolean
  departments: readonly DemoDepartment[]
  members: readonly DemoMember[]
  selectedId: string
  onSelect: (id: string) => void
  editable?: boolean
  onCreateChild?: (parentDept: DemoDepartment) => void
  onEdit?: (dept: DemoDepartment) => void
  onRename?: (dept: DemoDepartment) => void
}

function TreeNode({
  dept,
  visualDepth,
  rolledBranch,
  rollSeq,
  rollL1Id,
  lastRollDirection,
  reducedMotion,
  siblingIndex,
  siblingCount,
  allDepartments,
  members,
  selectedId,
  expandedIds,
  treeFilter,
  editable,
  draggingId,
  dropTargetId,
  onToggleExpand,
  onSelect,
  onCreateChild,
  onEdit,
  onRename,
  onMove,
  onDragStartNode,
  onDragOverNode,
  onDragLeaveNode,
  onDropNode,
  onDragEndNode,
}: {
  dept: DemoDepartment
  visualDepth: number
  rolledBranch: RolledTreeBranch | null
  rollSeq: number
  rollL1Id: string | null
  lastRollDirection: 1 | -1
  reducedMotion: boolean
  siblingIndex: number
  siblingCount: number
  allDepartments: readonly DemoDepartment[]
  members: readonly DemoMember[]
  selectedId: string
  expandedIds: ReadonlySet<string>
  treeFilter: string
  editable: boolean
  draggingId: string | null
  dropTargetId: string | null
  onToggleExpand: (
    id: string,
    visualDepth: number,
    hasChildren: boolean
  ) => void
  onSelect: (id: string, visualDepth: number, hasChildren: boolean) => void
  onCreateChild?: (parentDept: DemoDepartment) => void
  onEdit?: (dept: DemoDepartment) => void
  onRename?: (dept: DemoDepartment) => void
  onMove: (deptId: string) => void
  onDragStartNode: (id: string) => void
  onDragOverNode: (id: string) => void
  onDragLeaveNode: (id: string) => void
  onDropNode: (targetId: string) => void
  onDragEndNode: () => void
}) {
  const tl = useUiText()
  const panelId = useId()
  const rootRowRef = useRef<HTMLDivElement>(null)
  const descendantsRef = useRef<HTMLDivElement>(null)
  const openingMoveDialog = useRef(false)
  const isRoot = dept.parentId === null
  const directChildren = allDepartments.filter((d) => d.parentId === dept.id)
  const hasChildren = directChildren.length > 0
  const isRolledL1 =
    !treeFilter && visualDepth === 1 && rolledBranch?.l1Id === dept.id
  const rolledSlot2 = isRolledL1
    ? allDepartments.find((d) => d.id === rolledBranch.slot2Id)
    : undefined
  const visibleChildren = rolledSlot2 ? [rolledSlot2] : directChildren
  const canRenderChildren =
    hasChildren && (treeFilter !== "" || visualDepth < MAX_TREE_VISUAL_DEPTH)
  const expanded =
    canRenderChildren &&
    (treeFilter !== "" || isRolledL1 || expandedIds.has(dept.id))
  const descendantIds = collectDescendantIds(dept.id, allDepartments)
  const memberCount = members.filter((m) =>
    descendantIds.has(m.departmentId)
  ).length

  if (treeFilter && !isRoot) {
    const q = treeFilter.toLowerCase()
    const selfMatches =
      dept.name.toLowerCase().includes(q) ||
      tl(dept.name).toLowerCase().includes(q) ||
      dept.costCenter.toLowerCase().includes(q)
    const descendantMatches = allDepartments.some(
      (d) =>
        d.id !== dept.id &&
        descendantIds.has(d.id) &&
        (d.name.toLowerCase().includes(q) ||
          tl(d.name).toLowerCase().includes(q) ||
          d.costCenter.toLowerCase().includes(q))
    )
    if (!selfMatches && !descendantMatches) return null
  }

  const canDrag = editable && dept.parentId !== null
  const canMoveUp = dept.parentId !== null && siblingIndex > 0
  const canMoveDown = dept.parentId !== null && siblingIndex < siblingCount - 1

  function handleDragStart(event: DragEvent) {
    if (!canDrag) return
    event.dataTransfer.effectAllowed = "move"
    event.dataTransfer.setData("text/plain", dept.id)
    onDragStartNode(dept.id)
  }

  function handleDragOver(event: DragEvent) {
    if (!editable || !draggingId || draggingId === dept.id) return
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
    onDragOverNode(dept.id)
  }

  function handleDrop(event: DragEvent) {
    if (!editable) return
    event.preventDefault()
    onDropNode(dept.id)
  }

  return (
    <li className={isRoot ? "dept-tree-root" : undefined}>
      <div
        ref={isRoot ? rootRowRef : undefined}
        className="dept-tree-row"
        data-dragging={draggingId === dept.id || undefined}
        data-drop-target={
          dropTargetId === dept.id && draggingId !== dept.id
            ? "true"
            : undefined
        }
        draggable={canDrag}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={() => onDragLeaveNode(dept.id)}
        onDrop={handleDrop}
        onDragEnd={onDragEndNode}
      >
        {isRoot && <NavHighlight containerRef={rootRowRef} />}
        <SidebarNavItem
          className={
            isRoot
              ? hasChildren
                ? "workspace-nav-parent"
                : undefined
              : "nav-tree-item nav-tree-leaf"
          }
          aria-current={dept.id === selectedId || undefined}
          onClick={() => onSelect(dept.id, visualDepth, hasChildren)}
        >
          <AppIcon
            icon={dept.parentId ? SolarFolder : SolarBuildings2}
            size={16}
            stateful
          />
          {visualDepth >= 2 && rollSeq > 0 ? (
            <MotionSpan
              key={`${dept.id}-${rollSeq}`}
              className="dept-tree-name"
              title={tl(dept.name)}
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
              {tl(dept.name)}
            </MotionSpan>
          ) : (
            <span className="dept-tree-name" title={tl(dept.name)}>
              {tl(dept.name)}
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
            aria-label={tl("展开或收起 {{name}}", { name: tl(dept.name) })}
            onClick={() => onToggleExpand(dept.id, visualDepth, hasChildren)}
          >
            <AppIcon icon={SolarChevronDown} size={14} aria-hidden="true" />
          </button>
        )}

        {editable && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="dept-tree-more"
                data-department-id={dept.id}
                aria-label={tl("更多部门操作 {{name}}", {
                  name: tl(dept.name),
                })}
                title={tl("更多操作")}
              >
                <AppIcon icon={SolarEllipsis} size={15} aria-hidden="true" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={4}
              onCloseAutoFocus={(event) => {
                if (!openingMoveDialog.current) return
                event.preventDefault()
                openingMoveDialog.current = false
              }}
            >
              <DropdownMenuItem
                disabled={dept.disabled}
                onSelect={() => onCreateChild?.(dept)}
              >
                <AppIcon icon={SolarPlus} size={14} aria-hidden="true" />
                {tl("创建子部门")}
              </DropdownMenuItem>
              {!isRoot && (
                <>
                  <DropdownMenuItem onSelect={() => onEdit?.(dept)}>
                    <AppIcon icon={SolarCog} size={14} aria-hidden="true" />
                    {tl("编辑部门")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => onRename?.(dept)}>
                    <AppIcon icon={SolarPen} size={14} aria-hidden="true" />
                    {tl("修改部门名称")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => {
                      openingMoveDialog.current = true
                      onMove(dept.id)
                    }}
                  >
                    <AppIcon
                      icon={SolarArrowRight}
                      size={14}
                      aria-hidden="true"
                    />
                    {tl("移动到…")}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    disabled={!canMoveUp}
                    onSelect={() => {
                      workspaceActions.reorderDepartment(dept.id, "up")
                      toast.success(tl("已上移部门顺序"))
                    }}
                  >
                    <AppIcon icon={SolarArrowUp} size={14} aria-hidden="true" />
                    {tl("上移")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={!canMoveDown}
                    onSelect={() => {
                      workspaceActions.reorderDepartment(dept.id, "down")
                      toast.success(tl("已下移部门顺序"))
                    }}
                  >
                    <AppIcon
                      icon={SolarArrowDown}
                      size={14}
                      aria-hidden="true"
                    />
                    {tl("下移")}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {canRenderChildren && (
        <div
          id={panelId}
          className="nav-tree-panel"
          data-expanded={expanded ? "true" : "false"}
          inert={!expanded || undefined}
        >
          <div
            ref={isRoot ? descendantsRef : undefined}
            className={
              isRoot
                ? "nav-tree-panel-inner workspace-directory dept-tree-descendants"
                : "nav-tree-panel-inner"
            }
            role={isRoot ? "group" : undefined}
            aria-label={isRoot ? tl("下级部门") : undefined}
            tabIndex={isRoot && expanded ? 0 : undefined}
          >
            {isRoot && <NavHighlight containerRef={descendantsRef} />}
            <ul className="nav-tree-children">
              {visibleChildren.map((child, index) => (
                <TreeNode
                  key={child.id}
                  dept={child}
                  visualDepth={visualDepth + 1}
                  rolledBranch={rolledBranch}
                  rollSeq={
                    visualDepth === 1
                      ? rollL1Id === dept.id
                        ? rollSeq
                        : 0
                      : rollSeq
                  }
                  rollL1Id={rollL1Id}
                  lastRollDirection={lastRollDirection}
                  reducedMotion={reducedMotion}
                  siblingIndex={index}
                  siblingCount={visibleChildren.length}
                  allDepartments={allDepartments}
                  members={members}
                  selectedId={selectedId}
                  expandedIds={expandedIds}
                  treeFilter={treeFilter}
                  editable={editable}
                  draggingId={draggingId}
                  dropTargetId={dropTargetId}
                  onToggleExpand={onToggleExpand}
                  onSelect={onSelect}
                  onCreateChild={onCreateChild}
                  onEdit={onEdit}
                  onRename={onRename}
                  onMove={onMove}
                  onDragStartNode={onDragStartNode}
                  onDragOverNode={onDragOverNode}
                  onDragLeaveNode={onDragLeaveNode}
                  onDropNode={onDropNode}
                  onDragEndNode={onDragEndNode}
                />
              ))}
            </ul>
          </div>
        </div>
      )}
    </li>
  )
}

export function OrgDepartmentTree({
  title,
  storageKey,
  headerAction,
  searchToolbarActions,
  showExpandToggle = false,
  departments,
  members,
  selectedId,
  onSelect,
  editable = false,
  onCreateChild,
  onEdit,
  onRename,
}: OrgDepartmentTreeProps) {
  const tl = useUiText()
  const reducedMotion = Boolean(useReducedMotion())
  const treeTitle = title ?? tl("组织架构")
  const searchId = useId()
  const moveTargetId = useId()
  const search = useRef<HTMLInputElement>(null)
  const tree = useRef<HTMLUListElement>(null)
  const moveSourceId = useRef<string | null>(null)

  const [expandedIds, setExpandedIds] = usePersistedExpandedIds(
    storageKey,
    departments.map((d) => d.id)
  )
  const [query, setQuery] = useState("")
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dropTargetId, setDropTargetId] = useState<string | null>(null)
  const [move, setMove] = useState<{ deptId: string; parentId: string } | null>(
    null
  )
  const deptMap = useMemo(
    () => new Map(departments.map((d) => [d.id, d])),
    [departments]
  )

  const ensureExpanded = useCallback(
    (ids: readonly string[]) => {
      setExpandedIds((prev) => new Set([...prev, ...ids]))
    },
    [setExpandedIds]
  )

  const {
    rolledBranch,
    rollMeta,
    rollDownToSlot2,
    resetRoll,
    handleTreeNodeSelect,
  } = useTreeRollWindow({
    nodeMap: deptMap,
    selectedId,
    onEnsureExpanded: ensureExpanded,
  })

  const roots = departments.filter((d) => !d.parentId)
  const movingDept = departments.find((dept) => dept.id === move?.deptId)
  const excluded =
    movingDept && collectDescendantIds(movingDept.id, departments)
  const destinations = excluded
    ? departments.filter(
        (dept) =>
          !dept.disabled &&
          dept.id !== movingDept?.parentId &&
          !excluded.has(dept.id)
      )
    : []
  const selectedDestination = destinations.find(
    (dept) => dept.id === move?.parentId
  )

  function handleSelectNode(
    id: string,
    visualDepth: number,
    hasChildren: boolean
  ) {
    onSelect(id)
    handleTreeNodeSelect(id, visualDepth, hasChildren)
  }

  function toggleExpand(id: string, visualDepth: number, hasChildren: boolean) {
    if (visualDepth === MAX_TREE_VISUAL_DEPTH && hasChildren) {
      rollDownToSlot2(id)
      return
    }
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function moveNode(deptId: string, targetId: string) {
    if (!workspaceActions.moveDepartment(deptId, targetId)) return false
    setExpandedIds((prev) => {
      const next = new Set(prev)
      let parent = departments.find((dept) => dept.id === targetId)
      while (parent) {
        next.add(parent.id)
        const parentId = parent.parentId
        parent = departments.find((dept) => dept.id === parentId)
      }
      return next
    })
    toast.success(tl("已调整部门层级归属"))
    return true
  }

  function handleDropNode(targetId: string) {
    if (!draggingId) return
    if (deptMap.get(targetId)?.disabled) {
      toast.error(tl("请选择可用的上级部门"))
    } else if (!moveNode(draggingId, targetId) && draggingId !== targetId) {
      toast.error(tl("不能将部门移入自身或下级子部门"))
    }
    setDraggingId(null)
    setDropTargetId(null)
  }

  return (
    <div
      className="workspace-nav workspace-nav-surface dept-tree-card"
      role="region"
      aria-label={treeTitle}
    >
      <div className="workspace-nav-heading">
        <strong>{treeTitle}</strong>
        {headerAction}
      </div>

      <div className="dept-tree-search field-surface" data-field-focus="quiet">
        <label className="sr-only" htmlFor={searchId}>
          {tl("搜索部门名称或成本中心")}
        </label>
        <AppIcon icon={SolarSearch} size={16} />
        <Input
          embedded
          ref={search}
          className="bills-search-input"
          controlSize="dense"
          id={searchId}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={tl("搜索部门名称或成本中心")}
        />
      </div>

      {(searchToolbarActions || showExpandToggle) &&
        (() => {
          const subParentIds = departments
            .filter(
              (d) =>
                d.parentId !== null &&
                departments.some((child) => child.parentId === d.id)
            )
            .map((d) => d.id)
          const isTreeExpanded =
            subParentIds.length > 0
              ? subParentIds.some((id) => expandedIds.has(id))
              : roots.some((r) => expandedIds.has(r.id))
          const toggleLabel = isTreeExpanded
            ? tl("收起目录树")
            : tl("展开目录树")
          return (
            <div className="dept-tree-quick-actions">
              {searchToolbarActions}
              {showExpandToggle && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <MotionButton
                      type="button"
                      className="dept-tree-quick-btn"
                      aria-label={toggleLabel}
                      aria-pressed={isTreeExpanded}
                      whileHover={reducedMotion ? undefined : { scale: 1.12 }}
                      whileTap={reducedMotion ? undefined : { scale: 0.86 }}
                      transition={{
                        type: "spring",
                        stiffness: 520,
                        damping: 24,
                      }}
                      onClick={() => {
                        if (isTreeExpanded) {
                          resetRoll()
                          setExpandedIds(new Set(roots.map((r) => r.id)))
                        } else {
                          setExpandedIds(new Set(departments.map((d) => d.id)))
                        }
                      }}
                    >
                      <MotionSpan
                        key={isTreeExpanded ? "open" : "closed"}
                        className="inline-grid place-items-center"
                        initial={
                          reducedMotion ? false : { opacity: 0.4, scale: 0.78 }
                        }
                        animate={{ opacity: 1, scale: 1 }}
                        transition={
                          reducedMotion
                            ? { duration: 0 }
                            : { type: "spring", stiffness: 500, damping: 26 }
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
              )}
            </div>
          )
        })()}

      <ul ref={tree} className="workspace-nav-list">
        {roots.map((root, index) => (
          <TreeNode
            key={root.id}
            dept={root}
            visualDepth={0}
            rolledBranch={rolledBranch}
            rollSeq={rollMeta.seq}
            rollL1Id={rollMeta.l1Id}
            lastRollDirection={rollMeta.direction}
            reducedMotion={reducedMotion}
            siblingIndex={index}
            siblingCount={roots.length}
            allDepartments={departments}
            members={members}
            selectedId={selectedId}
            expandedIds={expandedIds}
            treeFilter={query.trim()}
            editable={editable}
            draggingId={draggingId}
            dropTargetId={dropTargetId}
            onToggleExpand={toggleExpand}
            onSelect={handleSelectNode}
            onCreateChild={onCreateChild}
            onEdit={onEdit}
            onRename={onRename}
            onMove={(deptId) => {
              moveSourceId.current = deptId
              setMove({ deptId, parentId: "" })
            }}
            onDragStartNode={setDraggingId}
            onDragOverNode={setDropTargetId}
            onDragLeaveNode={(id) =>
              setDropTargetId((curr) => (curr === id ? null : curr))
            }
            onDropNode={handleDropNode}
            onDragEndNode={() => {
              setDraggingId(null)
              setDropTargetId(null)
            }}
          />
        ))}
      </ul>

      <Dialog
        open={Boolean(movingDept)}
        onOpenChange={(open) => {
          if (!open) setMove(null)
        }}
      >
        <DialogContent
          aria-describedby={undefined}
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            const sourceId = moveSourceId.current
            const trigger = sourceId
              ? tree.current?.querySelector<HTMLButtonElement>(
                  `[data-department-id="${CSS.escape(sourceId)}"]`
                )
              : null
            const focusTarget =
              trigger && !trigger.closest("[inert]") ? trigger : search.current
            focusTarget?.focus()
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {tl("移动「{{name}}」", { name: tl(movingDept?.name ?? "") })}
            </DialogTitle>
          </DialogHeader>
          <form
            className="grid gap-3"
            onSubmit={(event) => {
              event.preventDefault()
              if (!move || !selectedDestination) return
              if (moveNode(move.deptId, selectedDestination.id)) setMove(null)
              else toast.error(tl("无法移动部门，请重新选择上级部门。"))
            }}
          >
            {destinations.length > 0 ? (
              <Field>
                <FieldLabel htmlFor={moveTargetId}>
                  {tl("目标上级部门")}
                </FieldLabel>
                <Select
                  value={selectedDestination?.id ?? ""}
                  onValueChange={(parentId) =>
                    setMove((current) => current && { ...current, parentId })
                  }
                >
                  <SelectTrigger id={moveTargetId} className="w-full">
                    <SelectValue placeholder={tl("选择上级部门")} />
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={true}>
                    {destinations.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {tl(dept.name)} · {dept.costCenter}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            ) : (
              <p role="status">{tl("暂无可选上级部门")}</p>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setMove(null)}
              >
                {tl("取消")}
              </Button>
              <Button type="submit" disabled={!selectedDestination}>
                {tl("确认移动")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
