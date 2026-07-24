import React from 'react'
import { Navigate, createBrowserRouter } from 'react-router'
import { LegalRoute } from '@/app/providers/router/route/LegalRoute'
import { WorkspaceSettingsRoute } from '@/app/providers/router/route/WorkspaceSettingsRoute'
import { AuthRoutes } from '@/app/providers/router/routes/AuthRoutes'
import { AuthenticatedRoutesWithoutLayout } from '@/app/providers/router/routes/AuthenticatedRoutesWithoutLayout'
import { ProjectSlugRoutes } from '@/app/providers/router/routes/ProjectSlugRoutes'
import { ProjectsRoutes } from '@/app/providers/router/routes/ProjectsRoutes'
import { SettingsRoutes } from '@/app/providers/router/routes/SettingsRoutes'
import { NotFoundPage } from '@/pages/Errors/NotFoundPage/NotFoundPage'
import { ServerError } from '@/pages/Errors/ServerError/ServerError'
import { InitializationPage } from '@/pages/InitializationPage/InitializationPage'
import { NotificationsPage } from '@/pages/NotificationsPage/NotificationsPage'
import { TestPage } from '@/pages/TestPage/TestPage'
import AuthPage from '@/pages/User/AuthPage/AuthPage'
import { ProfilePage } from '@/pages/User/ProfilePage/ProfilePage'
import { WorkspaceGridPage } from '@/pages/Workspace/WorkspaceGridPage/WorkspaceGridPage'
import {
  AUTH_URL,
  INIT_URL,
  NOTIFICATIONS_URL,
  NOT_FOUND_URL,
  PROFILE_URL,
  PROJECTS_URL,
  PROJECTS_WITH_SLUG_ID_URL,
  SERVER_ERROR_URL,
  SETTINGS_URL,
  SPACE_WITH_ID_URL,
  WORKSPACES_URL
} from '@/shared/config/route.config'
import { AuthenticatedRoutes } from './routes/AuthenticatedRoutes'

const router = createBrowserRouter([
  {
    element: <AuthenticatedRoutes />,
    children: [
      {
        id: 'SPACE ROUTES',
        path: SPACE_WITH_ID_URL,
        children: [
          {
            index: true,
            element: <></>
          },
          {
            id: 'WORKSPACES ROUTES',
            path: WORKSPACES_URL,
            children: [
              { index: true, element: <WorkspaceGridPage /> },
              WorkspaceSettingsRoute
            ]
          },
          {
            id: 'PROJECTS ROUTES',
            path: PROJECTS_URL,
            children: ProjectsRoutes
          },
          {
            id: 'PROJECT SLUG ROUTES',
            path: PROJECTS_WITH_SLUG_ID_URL,
            children: ProjectSlugRoutes
          }
        ]
      },
      {
        id: 'PROFILE ROUTES',
        path: PROFILE_URL,
        element: <ProfilePage />
      },
      {
        id: 'NOTIFICATIONS ROUTE',
        path: NOTIFICATIONS_URL,
        element: <NotificationsPage />
      },
      {
        id: 'SETTINGS',
        path: SETTINGS_URL,
        children: SettingsRoutes
      }
    ]
  },
  {
    element: <AuthenticatedRoutesWithoutLayout />,
    children: [
      { path: '/', element: <Navigate to={INIT_URL} replace /> },
      { path: INIT_URL, element: <InitializationPage /> },
      { path: '/test', element: <TestPage /> }
    ]
  },
  LegalRoute,
  { path: AUTH_URL, element: <AuthPage />, children: AuthRoutes },
  { path: NOT_FOUND_URL, element: <NotFoundPage /> },
  { path: SERVER_ERROR_URL, element: <ServerError /> },
  { path: '*', element: <Navigate replace to={NOT_FOUND_URL} /> }
])

export default router
