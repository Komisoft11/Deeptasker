import { observer } from 'mobx-react-lite'
import { useSearchParams } from 'react-router'
import { Task } from '@/entities/Task'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { ProjectsNavigator } from '@/shared/lib/navigators/projects.navigator'
import { Breadcrumbs } from '@/shared/ui/Breadcrumbs/Breadcrumbs'
import { IBreadcrumb } from '@/shared/ui/Breadcrumbs/type/breadcrumbs.interface'

interface BreadcrumbsTaskProps {
  task: Task
}

export const BreadcrumbsTask = observer(({ task }: BreadcrumbsTaskProps) => {
  const {
    workspaceStore: { activeWorkspace }
  } = useRootStore()

  const [params] = useSearchParams()

  const breadcrumbsTask: IBreadcrumb[] = getBreadcrumbsTask(
    activeWorkspace.id,
    task,
    params
  )

  return <Breadcrumbs breadcrumbs={breadcrumbsTask} />
})

function getBreadcrumbsTask(
  currentWorkspaceId: number,
  task: Task,
  params?: URLSearchParams
): IBreadcrumb[] {
  const breadcrumbs: IBreadcrumb[] = []
  let currentTask = task

  while (currentTask.parentId) {
    const parentTask = currentTask.parent
    if (!parentTask) break

    breadcrumbs.unshift({
      id: parentTask.id,
      title: parentTask.title,
      url: ProjectsNavigator.getOpenTaskUrl({
        currentWorkspaceId,
        projectSlug: parentTask.project.slug,
        externalId: parentTask.externalId,
        params
      })
    })

    currentTask = parentTask
  }

  breadcrumbs.push({
    id: task.id,
    title: task.title,
    url: ProjectsNavigator.getOpenTaskUrl({
      currentWorkspaceId,
      projectSlug: task.project.slug,
      externalId: task.externalId,
      params
    })
  })

  return breadcrumbs
}
