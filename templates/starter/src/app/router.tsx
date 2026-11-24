import { useTranslation } from "react-i18next"
import { createBrowserRouter, Navigate } from "react-router"
import { WorkspacePage } from "@aries/shell"

import { StarterShell } from "./shell-adapter"
import { workspaceModules } from "./workspace-modules"

function WorkspaceRoute({ page }: { page: (typeof workspaceModules)[number] }) {
  const { t } = useTranslation()
  return (
    <WorkspacePage
      page={{ id: page.id, title: t(page.titleKey), breadcrumbs: [] }}
      Content={page.Content}
    />
  )
}

export const router = createBrowserRouter([
  {
    element: <StarterShell />,
    children: [
      {
        index: true,
        element: <Navigate to={workspaceModules[0].path} replace />,
      },
      ...workspaceModules.map((page) => ({
        id: page.id,
        path: page.path,
        element: <WorkspaceRoute page={page} />,
      })),
    ],
  },
])
