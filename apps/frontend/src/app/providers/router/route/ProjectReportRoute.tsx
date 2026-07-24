import { RouteObject } from 'react-router'
import { CreateProjectReportPage } from '@/pages/Project/CreateProjectReportPage/CreateProjectReportPage'
import { ReportsPage } from '@/pages/ReportsPage/ReportsPage'
import {
  PROJECTS_CREATE_REPORT,
  REPORTS_URL
} from '@/shared/config/route.config'

export const ProjectReportRoute: RouteObject = {
  path: REPORTS_URL,
  children: [
    {
      index: true,
      element: <ReportsPage />
    },
    {
      path: PROJECTS_CREATE_REPORT,
      element: <CreateProjectReportPage />
    }
  ]
}
