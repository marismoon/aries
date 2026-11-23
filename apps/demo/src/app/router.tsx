import { createBrowserRouter, Navigate } from "react-router"

import { AppShell } from "@/components/layout/AppShell"
import { WorkspacePage } from "@/components/layout/WorkspacePage"
import { useUiText } from "@/lib/i18n/use-ui-text"
import { Skeleton } from "@marismoon/ui/ui/skeleton"
import { workspacePages } from "./workspace-pages"

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
    element: <AppShell />,
    HydrateFallback: LoadingWorkspace,
    children: [
      {
        index: true,
        element: <Navigate to={workspacePages.overview.path} replace />,
      },
      ...Object.values(workspacePages).map((page) => ({
        id: page.id,
        path: page.path,
        lazy: {
          Component: async () => {
            const slots = await page.load()
            return function WorkspaceRoute() {
              return <WorkspacePage page={page} {...slots} />
            }
          },
        },
      })),
    ],
  },
])
