import {
  useLayoutEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type MouseEvent,
} from "react"

import { AppIcon, SolarCheck, SolarMinus } from "@marismoon/ui/icons"
import { DataTable } from "@marismoon/ui/shared/DataTable"
import { EmptyState } from "@marismoon/ui/shared/EmptyState"
import { StatusBadge } from "@marismoon/ui/shared/StatusBadge"
import {
  createDataTableColumns,
  useDataTable,
} from "@marismoon/ui/shared/use-data-table"
import { useUiText } from "@/lib/i18n/use-ui-text"
import {
  allPermissionIds,
  permissionGroups,
  type PermissionItemMeta,
} from "@/shared/mocks/workspace-store"
import type { DemoMember, DemoRole } from "@/shared/types/workspace-settings"

interface MatrixPermission extends PermissionItemMeta {
  group: string
}

const column = createDataTableColumns<MatrixPermission>()
const permissions = permissionGroups.flatMap((group) =>
  group.items.map((item) => ({ ...item, group: group.group }))
)

export function PermissionMatrixTable({
  roles,
  members,
  onSelectRole,
}: {
  roles: readonly DemoRole[]
  members: readonly DemoMember[]
  onSelectRole: (id: string, event: MouseEvent<HTMLButtonElement>) => void
}) {
  const tl = useUiText()
  const register = useRef<HTMLDivElement>(null)
  const columns = useMemo(
    () =>
      column.columns([
        column.accessor("label", {
          header: tl("功能域 / 权限项"),
          cell: ({ row }) => (
            <>
              <span
                className="roles-matrix-permission-text"
                title={tl(row.original.label)}
              >
                {tl(row.original.label)}
              </span>
              <span
                className="bill-row-account roles-matrix-permission-text"
                title={tl(row.original.group)}
              >
                {tl(row.original.group)}
              </span>
            </>
          ),
        }),
        column.accessor("sensitive", {
          header: tl("敏感标识"),
          cell: ({ getValue }) =>
            getValue() ? (
              <StatusBadge tone="warning">{tl("高敏")}</StatusBadge>
            ) : null,
        }),
        ...roles.map((role) =>
          column.display({
            id: role.id,
            header: () => (
              <button
                type="button"
                className="roles-matrix-role-btn"
                title={tl(role.name)}
                onClick={(event) => onSelectRole(role.id, event)}
              >
                <span className="roles-matrix-role-name">{tl(role.name)}</span>
                <span className="roles-matrix-role-sub financial-number">
                  {members.filter((member) => member.roleId === role.id).length}{" "}
                  {tl("人")} · {role.permissions.length}/
                  {allPermissionIds.length}
                </span>
              </button>
            ),
            cell: ({ row }) => {
              const granted = role.permissions.includes(row.original.id)
              return (
                <span
                  className={
                    granted ? "roles-matrix-check" : "roles-matrix-none"
                  }
                >
                  <AppIcon
                    icon={granted ? SolarCheck : SolarMinus}
                    size={granted ? 16 : 14}
                    aria-hidden="true"
                  />
                  <span className="sr-only">
                    {tl(granted ? "已授权" : "未授权")}
                  </span>
                </span>
              )
            },
          })
        ),
      ]),
    [members, onSelectRole, roles, tl]
  )
  const table = useDataTable({
    columns,
    data: permissions,
    getRowId: (permission) => permission.id,
    initialState: { pagination: { pageIndex: 0, pageSize: 10 } },
  })
  const { pageIndex, pageSize } = table.state.pagination

  useLayoutEffect(() => {
    const viewport =
      register.current?.querySelector<HTMLDivElement>(".data-table-scroll")
    const element = viewport?.querySelector("table")
    if (!viewport || !element) return

    // Clip scrolling cells at the frozen column's edge, so transparent table
    // surfaces can retain their shared appearance without revealing text below.
    const syncScroll = () => {
      element.style.setProperty(
        "--matrix-scroll-left",
        `${viewport.scrollLeft}px`
      )
    }
    const measureColumns = () => {
      const headers = Array.from(element.tHead?.rows[0]?.cells ?? [])
      const frozen = headers[0]
      if (!frozen) return
      const origin =
        element.getBoundingClientRect().left +
        frozen.getBoundingClientRect().width
      const starts = headers.map(
        (header) => header.getBoundingClientRect().left - origin
      )
      for (const row of Array.from(element.rows)) {
        Array.from(row.cells).forEach((cell, index) => {
          if (index === 0) return
          cell.style.setProperty("--matrix-column-start", `${starts[index]}px`)
        })
      }
      syncScroll()
    }

    measureColumns()
    const observer = new ResizeObserver(measureColumns)
    observer.observe(viewport)
    observer.observe(element)
    viewport.addEventListener("scroll", syncScroll, { passive: true })
    return () => {
      observer.disconnect()
      viewport.removeEventListener("scroll", syncScroll)
    }
  }, [columns, pageIndex, pageSize])

  const columnAlign = Object.fromEntries(
    roles.map((role) => [role.id, "center" as const])
  )
  const minimumWidth = 240 + 96 + roles.length * 168

  return (
    <div
      ref={register}
      className="settings-register roles-matrix-register"
      style={
        {
          "--matrix-min-width": `${minimumWidth}px`,
          "--matrix-label-fraction": 240 / minimumWidth,
          "--matrix-sensitive-fraction": 96 / minimumWidth,
          "--matrix-role-fraction": 168 / minimumWidth,
        } as CSSProperties
      }
    >
      <DataTable
        table={table}
        caption={tl("权限矩阵")}
        columnAlign={{ ...columnAlign, label: "start", sensitive: "center" }}
        rowHeaderColumn="label"
        selectAllLabel={tl("选择本页所有权限项")}
        selectRowLabel={(permission) =>
          tl("选择权限项 {{name}}", { name: tl(permission.label) })
        }
        paginationLabel={tl("权限矩阵分页")}
        empty={<EmptyState title={tl("没有匹配的权限项")} />}
      />
    </div>
  )
}
