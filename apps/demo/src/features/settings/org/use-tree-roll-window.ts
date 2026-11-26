import { useCallback, useMemo, useState } from "react"

export const MAX_TREE_VISUAL_DEPTH = 3
export const TREE_ROLL_EASE = [0.22, 1, 0.36, 1] as const

export interface TreeRollNode {
  id: string
  parentId: string | null
}

export interface RolledTreeBranch {
  l1Id: string
  slot2Id: string
  direction: 1 | -1
}

export interface TreeRollMeta {
  seq: number
  l1Id: string | null
  direction: 1 | -1
}

export function getTreeNodeDepth<T extends TreeRollNode>(
  nodeId: string,
  nodeMap: ReadonlyMap<string, T>
): number {
  let depth = 0
  const visited = new Set<string>()
  let current = nodeMap.get(nodeId)
  while (current?.parentId && !visited.has(current.id)) {
    visited.add(current.id)
    const parent = nodeMap.get(current.parentId)
    if (!parent) break
    depth += 1
    current = parent
  }
  return depth
}

export function findTreeL1Ancestor<T extends TreeRollNode>(
  nodeId: string,
  nodeMap: ReadonlyMap<string, T>
): T | null {
  const chain: T[] = []
  const visited = new Set<string>()
  let current = nodeMap.get(nodeId)
  while (current && !visited.has(current.id)) {
    visited.add(current.id)
    chain.unshift(current)
    current = current.parentId ? nodeMap.get(current.parentId) : undefined
  }
  return chain[1] ?? null
}

/**
 * Shared 3-level local rolling window state machine for sidebar directory trees
 * (MembersPage, DepartmentsPage via OrgDepartmentTree, and RolesPage).
 *
 * - Keeps at most 3 visual levels below root without mutating tree styles.
 * - Clicking a level-3 node with children rolls it into slot 2 (downward).
 * - Clicking the rolled node at slot 2 (or its level-1 ancestor) rolls back up
 *   one level (reverse direction) until the normal level-2 children return.
 * - Auto-validates against deleted or moved nodes and avoids nested setState
 *   calls inside React state updaters.
 */
export function useTreeRollWindow<T extends TreeRollNode>({
  nodeMap,
  selectedId,
  onEnsureExpanded,
}: {
  nodeMap: ReadonlyMap<string, T>
  selectedId: string
  onEnsureExpanded: (ids: readonly string[]) => void
}) {
  const [rawRolledBranch, setRawRolledBranch] =
    useState<RolledTreeBranch | null>(null)
  const [rollMeta, setRollMeta] = useState<TreeRollMeta>({
    seq: 0,
    l1Id: null,
    direction: 1,
  })

  // Validate that the rolled slot2 node still exists under the same L1 branch
  // and is still deeper than a direct child of L1 (guards against drag/move/delete).
  const rolledBranch = useMemo<RolledTreeBranch | null>(() => {
    if (!rawRolledBranch) return null
    const slot2 = nodeMap.get(rawRolledBranch.slot2Id)
    if (!slot2) return null
    const l1 = findTreeL1Ancestor(slot2.id, nodeMap)
    if (!l1 || l1.id !== rawRolledBranch.l1Id) return null
    if (slot2.id === l1.id || slot2.parentId === l1.id) return null
    return rawRolledBranch
  }, [nodeMap, rawRolledBranch])

  const bumpRollMeta = useCallback((l1Id: string | null, direction: 1 | -1) => {
    setRollMeta((prev) => ({ seq: prev.seq + 1, l1Id, direction }))
  }, [])

  const rollDownToSlot2 = useCallback(
    (nodeId: string) => {
      const l1 = findTreeL1Ancestor(nodeId, nodeMap)
      if (!l1 || l1.id === nodeId) return
      bumpRollMeta(l1.id, 1)
      setRawRolledBranch({ l1Id: l1.id, slot2Id: nodeId, direction: 1 })
      onEnsureExpanded([l1.id, nodeId])
    },
    [bumpRollMeta, nodeMap, onEnsureExpanded]
  )

  const rollUpBranch = useCallback(
    (l1Id: string) => {
      if (!rolledBranch || rolledBranch.l1Id !== l1Id) {
        if (rolledBranch) {
          bumpRollMeta(rolledBranch.l1Id, -1)
          setRawRolledBranch(null)
        }
        return
      }
      bumpRollMeta(l1Id, -1)
      const slot2 = nodeMap.get(rolledBranch.slot2Id)
      const parentOfSlot2 = slot2?.parentId
        ? nodeMap.get(slot2.parentId)
        : undefined
      if (
        parentOfSlot2 &&
        parentOfSlot2.id !== l1Id &&
        parentOfSlot2.parentId !== l1Id
      ) {
        onEnsureExpanded([l1Id, parentOfSlot2.id])
        setRawRolledBranch({
          l1Id,
          slot2Id: parentOfSlot2.id,
          direction: -1,
        })
      } else {
        setRawRolledBranch(null)
      }
    },
    [bumpRollMeta, nodeMap, onEnsureExpanded, rolledBranch]
  )

  const resetRoll = useCallback(() => {
    if (!rolledBranch) return
    bumpRollMeta(rolledBranch.l1Id, -1)
    setRawRolledBranch(null)
  }, [bumpRollMeta, rolledBranch])

  // Sync external selection of a deep node (e.g. after creating a 4th+ level
  // item or jumping from the permission matrix) without overriding user clicks.
  const [previousSelectedId, setPreviousSelectedId] = useState(selectedId)
  if (previousSelectedId !== selectedId) {
    setPreviousSelectedId(selectedId)
    const target = nodeMap.get(selectedId)
    if (
      target?.parentId &&
      getTreeNodeDepth(target.id, nodeMap) > MAX_TREE_VISUAL_DEPTH
    ) {
      const l1 = findTreeL1Ancestor(target.parentId, nodeMap)
      const coversTarget =
        rolledBranch?.l1Id === l1?.id &&
        (rolledBranch?.slot2Id === target.id ||
          rolledBranch?.slot2Id === target.parentId)
      if (l1 && !coversTarget) {
        bumpRollMeta(l1.id, 1)
        setRawRolledBranch({
          l1Id: l1.id,
          slot2Id: target.parentId,
          direction: 1,
        })
        onEnsureExpanded([l1.id, target.parentId])
      }
    }
  }

  const handleTreeNodeSelect = useCallback(
    (id: string, visualDepth?: number, hasChildren?: boolean) => {
      if (visualDepth === MAX_TREE_VISUAL_DEPTH && hasChildren) {
        rollDownToSlot2(id)
      } else if (visualDepth === 2 && rolledBranch?.slot2Id === id) {
        rollUpBranch(rolledBranch.l1Id)
      } else if (visualDepth === 1 && rolledBranch) {
        if (rolledBranch.l1Id === id) {
          rollUpBranch(id)
        } else {
          resetRoll()
        }
      } else if (visualDepth === 0 && rolledBranch) {
        resetRoll()
      }
    },
    [resetRoll, rollDownToSlot2, rollUpBranch, rolledBranch]
  )

  return {
    rolledBranch,
    rollMeta,
    rollDownToSlot2,
    rollUpBranch,
    resetRoll,
    handleTreeNodeSelect,
  }
}
