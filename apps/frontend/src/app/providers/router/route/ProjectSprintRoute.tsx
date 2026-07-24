import { RouteObject } from 'react-router'
import { ProjectSprintsPage } from '@/pages/Project/ProjectSprintsPage/ProjectSprintsPage'
import { ProjectSprint } from '@/entities/Sprint/ui'
import { SPRINTS_URL, SPRINT_ID_URL } from '@/shared/config/route.config'

export const ProjectSprintRoute: RouteObject = {
  path: SPRINTS_URL,
  children: [
    {
      index: true,
      element: <ProjectSprintsPage />
    },
    {
      path: SPRINT_ID_URL,
      element: <ProjectSprint />
    }
  ]
}
