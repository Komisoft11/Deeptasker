import { Navigate, RouteObject } from 'react-router'
import { ProjectReportRoute } from '@/app/providers/router/route/ProjectReportRoute'
import { ProjectSprintRoute } from '@/app/providers/router/route/ProjectSprintRoute'
import {
  TaskItemPageRoute,
  TaskItemPageWithFolderRoute
} from '@/app/providers/router/route/TaskItemPageRoute'
import {
  TasksPageRoute,
  TasksPageWithFolderRoute
} from '@/app/providers/router/route/TasksPageRoute'
import { NOT_FOUND_URL } from '@/shared/config/route.config'

export const ProjectSlugRoutes: RouteObject[] = [
  TasksPageRoute,
  TasksPageWithFolderRoute,
  TaskItemPageRoute,
  TaskItemPageWithFolderRoute,
  ProjectSprintRoute,
  ProjectReportRoute,
  {
    index: true,
    element: <Navigate replace to={NOT_FOUND_URL} />
  }
]
