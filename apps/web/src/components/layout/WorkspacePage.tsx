import type { ComponentType } from "react"
import { useTranslation } from "react-i18next"
import type { WorkspacePageConfig } from "@/app/workspace-pages"
import { WorkspacePageLayout } from "./MainWorkspace"
import { PageHeader } from "./PageHeader"

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
}: WorkspacePageSlots & { page: WorkspacePageConfig }) {
  const { t } = useTranslation()
  const header = (
    <PageHeader
      title={t(page.titleKey)}
      breadcrumbs={page.breadcrumbs}
      breadcrumbDetail={BreadcrumbDetail && <BreadcrumbDetail />}
      description={
        Subtitle ? <Subtitle /> : page.descriptionKey && t(page.descriptionKey)
      }
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
