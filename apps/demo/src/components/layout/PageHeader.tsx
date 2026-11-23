import { Fragment, type ReactNode } from "react"
import { AppIcon, SolarChevronRight } from "@marismoon/ui/icons"
import type { WorkspacePageConfig } from "@/app/workspace-pages"
import { useUiText } from "@/lib/i18n/use-ui-text"
import { ShellLink } from "./ShellLink"
import { WorkspaceControls } from "./WorkspaceControls"

export function PageHeader({
  title,
  breadcrumbs,
  breadcrumbDetail,
  description,
}: {
  title: string
  breadcrumbs: WorkspacePageConfig["breadcrumbs"]
  breadcrumbDetail?: ReactNode
  description?: ReactNode
}) {
  const tl = useUiText()
  return (
    <header className="page-header">
      <nav className="workspace-breadcrumb" aria-label={tl("面包屑")}>
        {breadcrumbs.map(({ label, path }) => (
          <Fragment key={label}>
            {path ? (
              <ShellLink to={path}>{tl(label)}</ShellLink>
            ) : (
              <span>{tl(label)}</span>
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
