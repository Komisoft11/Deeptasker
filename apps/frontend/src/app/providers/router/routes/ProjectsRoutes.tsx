import React from 'react'
import { Navigate, RouteObject } from 'react-router'
import { ProjectSettingsRoute } from '@/app/providers/router/route/ProjectSettingsRoute'
import { ProjectTemplateCreatorPage } from '@/pages/Project/ProjectTemplateCreatorPage/ProjectTemplateCreatorPage'
import {
  NOT_FOUND_URL,
  PROJECTS_TEMPLATE_URL
} from '@/shared/config/route.config'

export const ProjectsRoutes: RouteObject[] = [
  {
    index: true,
    element: <Navigate to={NOT_FOUND_URL} replace />
  },
  {
    path: PROJECTS_TEMPLATE_URL,
    element: <ProjectTemplateCreatorPage />
  },
  ProjectSettingsRoute
]
