import { Fragment, useContext, type ReactNode } from "react"
import { AppIcon, SolarChevronRight } from "@marismoon/ui/icons"
import { ShellLink } from "./ShellLink"
import { WorkspaceControls } from "./WorkspaceControls"
import { useShellLabels } from "./types/labels"
import { HeaderExtraContext } from "./context/header-extra"

export interface Breadcrumb {
  id: string
  label: string
  path?: string
}

export function PageHeader({
  title,
  breadcrumbs,
  breadcrumbDetail,
  description,
}: {
  title: string
  breadcrumbs: readonly Breadcrumb[]
  breadcrumbDetail?: ReactNode
  description?: ReactNode
}) {
  const labels = useShellLabels()
  const headerExtra = useContext(HeaderExtraContext)
  return (
    <header className="page-header">
      <nav className="workspace-breadcrumb" aria-label={labels.breadcrumb}>
        {breadcrumbs.map(({ id, label, path }) => (
          <Fragment key={id}>
            {path ? (
              <ShellLink to={path}>{label}</ShellLink>
            ) : (
              <span>{label}</span>
            )}
            <AppIcon icon={SolarChevronRight} size={11} />
          </Fragment>
        ))}
        <span aria-current="page">{title}</span>
        {breadcrumbDetail}
      </nav>
      <div className="page-header-content">
        <div className="page-header-title-row">
          <h1>{title}</h1>
          <div className="page-header-actions">
            {headerExtra}
            <WorkspaceControls />
          </div>
        </div>
        {description && (
          <div className="page-header-description">{description}</div>
        )}
      </div>
    </header>
  )
}
