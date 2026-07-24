import { observer } from 'mobx-react-lite'
import React from 'react'
import { Navigate, RouteObject, useParams } from 'react-router'
import { WorkspacePage } from '@/pages/Workspace/WorkspacePage/WorkspacePage'
import { WorkspaceAdmins } from '@/widgets/Workspace'
import { WorkspaceSettings } from '@/features/Workspace'
import {
  RouterParams,
  WORKSPACES_ID_URL,
  optionWorkspaceTabs
} from '@/shared/config/route.config'

const WorkspacePageComponent = observer(() => {
  const { workspaceId } = useParams<RouterParams>()

  const workspaceIdNum = Number(workspaceId)

  if (isNaN(workspaceIdNum)) {
    throw new Error('Workspace id is not a number')
  }

  return <WorkspacePage workspaceId={workspaceIdNum} />
})

export const WorkspaceSettingsRoute: RouteObject = {
  path: WORKSPACES_ID_URL,
  Component: WorkspacePageComponent,
  children: [
    {
      index: true,
      element: <Navigate to={optionWorkspaceTabs.SETTINGS} replace />
    },
    { path: optionWorkspaceTabs.SETTINGS, element: <WorkspaceSettings /> },
    { path: optionWorkspaceTabs.ADMINS, element: <WorkspaceAdmins /> }
  ]
}
