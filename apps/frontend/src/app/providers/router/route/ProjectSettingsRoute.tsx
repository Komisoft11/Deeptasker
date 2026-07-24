import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { Navigate, RouteObject, useLoaderData } from 'react-router'
import { ProjectPage } from '@/pages/Project/ProjectPage/ProjectPage'
import {
  ProjectMembersTab,
  ProjectSettingsTab,
  ProjectTagsTab
} from '@/widgets/Project/ProjectDialogTabs'
import { IProjectDto, ProjectService } from '@/entities/Project'
import {
  NOT_FOUND_URL,
  PROJECTS_ID_URL,
  RouterParams,
  optionProjectTabs
} from '@/shared/config/route.config'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'


async function load({ projectId, spaceId }: RouterParams) {
  const projectIdNum = Number(projectId)
  const workspaceIdNum = Number(spaceId)

  if (isNaN(projectIdNum)) {
    throw new Error(`can not get this projectId: ${projectId}`)
  }

  if (isNaN(workspaceIdNum)) {
    throw new Error(`can not get this wsId: ${spaceId}`)
  }

  return ProjectService.getProject(projectIdNum, workspaceIdNum)
}

const ProjectSettingsElement = observer(() => {
  const { projectStore } = useRootStore()
  const data = useLoaderData<IProjectDto>()

  const project = projectStore.get(data.id)

  useEffect(() => {
    projectStore.update(data)
  }, [])

  return <ProjectPage project={project} />
})

export const ProjectSettingsRoute: RouteObject = {
  path: PROJECTS_ID_URL,
  loader: ({ params }) => load(params),
  Component: ProjectSettingsElement,
  errorElement: <Navigate to={NOT_FOUND_URL} replace />,
  children: [
    {
      index: true,
      element: <Navigate to={optionProjectTabs.PEOPLE} replace />
    },
    {
      path: optionProjectTabs.GENERAL,
      element: <ProjectSettingsTab />
    },
    {
      path: optionProjectTabs.PEOPLE,
      element: <ProjectMembersTab />
    },
    { path: optionProjectTabs.TAGS, element: <ProjectTagsTab /> }
  ]
}
