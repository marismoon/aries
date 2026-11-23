import type { ComponentType } from "react"
import { WorkspacePageLayout } from "../MainWorkspace"
import { PageHeader, type Breadcrumb } from "../PageHeader"

export interface WorkspacePageSlots {
  Content: ComponentType
  Subtitle?: ComponentType
  BreadcrumbDetail?: ComponentType
  Summary?: ComponentType
}

export function WorkspacePage({
  page,
  Content,
  Subtitle,
  BreadcrumbDetail,
  Summary,
}: WorkspacePageSlots & {
  page: {
    id: string
    title: string
    description?: string
    breadcrumbs: readonly Breadcrumb[]
  }
}) {
  const header = (
    <PageHeader
      title={page.title}
      breadcrumbs={page.breadcrumbs}
      breadcrumbDetail={BreadcrumbDetail && <BreadcrumbDetail />}
      description={Subtitle ? <Subtitle /> : page.description}
    />
  )

  return (
    <WorkspacePageLayout
      className={`workspace-page ${page.id}-page`}
      header={header}
      summary={Summary && <Summary />}
    >
      <Content />
    </WorkspacePageLayout>
  )
}
