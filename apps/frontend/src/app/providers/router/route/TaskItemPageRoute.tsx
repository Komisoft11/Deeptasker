import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { Navigate, RouteObject, useLoaderData } from 'react-router'
import { TaskItemPage } from '@/pages/Task/TaskItemPage/TaskItemPage'
import { TaskItemSkeleton } from '@/widgets/Task/TaskItem'
import { ExtendedTaskResponse, TaskService } from '@/entities/Task'
import {
  FOLDER_WITH_ID_URL,
  NOT_FOUND_URL,
  RouterParams,
  TASKS_ID_URL
} from '@/shared/config/route.config'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'

async function loadTask({
  spaceId,
  taskId,
  slugId
}: RouterParams): Promise<ExtendedTaskResponse> {
  if (!spaceId || !taskId || !slugId) {
    throw new Error('Missing required parameter')
  }

  const workspaceId = Number(spaceId)

  if (isNaN(workspaceId)) {
    throw new Error('WorkspaceId must be a number')
  }

  return TaskService.getExtendedTaskDTOByExternalId(workspaceId, slugId, taskId)
}

const RouteElement = observer(() => {
  const dto: ExtendedTaskResponse = useLoaderData()
  const { taskStore, sidebarStore, projectStore } = useRootStore()

  useEffect(() => {
    if (taskStore.loading || projectStore.loading) return

    taskStore.activeTask = taskStore.get(dto.id)
    taskStore.updateFullTask(dto.id, dto)
    sidebarStore.closeRightSidebar()
  }, [
    dto,
    taskStore,
    taskStore.safeActiveTask?.id,
    taskStore.loading,
    projectStore.loading
  ])

  return taskStore.safeActiveTask?.id ? <TaskItemPage /> : <TaskItemSkeleton />
})

export const TaskItemPageRoute: RouteObject = {
  path: TASKS_ID_URL,
  element: <RouteElement />,
  errorElement: <Navigate to={NOT_FOUND_URL} replace />,
  loader: ({ params }) => loadTask(params)
}

export const TaskItemPageWithFolderRoute = {
  ...TaskItemPageRoute,
  path: FOLDER_WITH_ID_URL + '/' + TASKS_ID_URL
}
