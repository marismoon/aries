import { useTranslation } from "react-i18next"
import { createBrowserRouter, Navigate } from "react-router"

import { WorkspacePage } from "@marismoon/shell"
import { useUiText } from "@/lib/i18n/use-ui-text"
import { Skeleton } from "@marismoon/ui/ui/skeleton"
import { DemoShell } from "./shell-adapter"
import { workspacePages, type WorkspacePageConfig } from "./workspace-pages"

function LoadingWorkspace() {
  const tl = useUiText()
  return (
    <div
      className="grid min-h-svh place-items-center"
      role="status"
      aria-label={tl("正在载入工作区")}
    >
      <Skeleton className="h-12 w-32" />
    </div>
  )
}

export const router = createBrowserRouter([
  {
    element: <DemoShell />,
    HydrateFallback: LoadingWorkspace,
    children: [
      {
        index: true,
        element: <Navigate to={workspacePages.overview.path} replace />,
      },
      ...Object.values(workspacePages).map((page: WorkspacePageConfig) => ({
        id: page.id,
        path: page.path,
        lazy: {
          Component: async () => {
            const slots = await page.load()
            return function WorkspaceRoute() {
              const { t } = useTranslation()
              const tl = useUiText()
              return (
                <WorkspacePage
                  page={{
                    id: page.id,
                    title: t(page.titleKey),
                    description: page.descriptionKey && t(page.descriptionKey),
                    breadcrumbs: page.breadcrumbs.map(({ label, path }) => ({
                      id: label,
                      label: tl(label),
                      path,
                    })),
                  }}
                  {...slots}
                />
              )
            }
          },
        },
      })),
    ],
  },
])
