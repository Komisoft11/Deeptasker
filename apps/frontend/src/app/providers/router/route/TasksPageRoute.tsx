import React from 'react'
import { RouteObject } from 'react-router'
import { TasksPage } from '@/pages/Task/TasksPage/TasksPage'
import { KanbanPlanner } from '@/widgets/KanbanPlanner'
import { TaskTable } from '@/widgets/Task'
import { FOLDER_WITH_ID_URL, viewTabs } from '@/shared/config/route.config'

export const TasksPageRoute: RouteObject = {
  Component: TasksPage,
  children: [
    {
      path: viewTabs.TABLE,
      element: <TaskTable />
    },
    {
      path: viewTabs.KANBAN,
      element: <KanbanPlanner />
    }
  ]
}

export const TasksPageWithFolderRoute: RouteObject = {
  path: FOLDER_WITH_ID_URL,
  ...TasksPageRoute
}
