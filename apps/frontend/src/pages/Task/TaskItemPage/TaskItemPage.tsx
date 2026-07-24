import { observer } from 'mobx-react-lite'
import { useNavigate, useSearchParams } from 'react-router'
import { BodyTaskItem, SidebarTaskItem } from '@/widgets/Task/TaskItem'
import { BreadcrumbsTask } from '@/features/Task'
import { usePermissionTask, useTasks } from '@/entities/Task'
import { Trash } from '@/shared/assets/images/icons'
import { useCurrentView } from '@/shared/lib/hooks/useCurrentView'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { ProjectsNavigator } from '@/shared/lib/navigators/projects.navigator'
import { Button } from '@/shared/ui/Button/Button'
import { Header } from '@/shared/ui/Header/Header'
import styles from './TaskItemPage.module.scss'

export const TaskItemPage = observer(() => {
  const {
    workspaceStore: { activeWorkspace },
    taskStore: { activeTask }
  } = useRootStore()

  const navigate = useNavigate()
  const {
    deleteAsync: { mutateAsync }
  } = useTasks()
  const [params] = useSearchParams()

  const { canDeleteTask } = usePermissionTask(activeTask)

  const { view } = useCurrentView()

  const handleDeleteTask = () => {
    mutateAsync(activeTask).then(() =>
      navigate(
        ProjectsNavigator.getExistProjectUrl({
          currentWorkspaceId: activeWorkspace.id,
          projectSlug: activeTask.project.slug,
          params
        })
      )
    )
  }

  const urlBack = !activeTask.parent
    ? ProjectsNavigator.getExistProjectUrl({
        currentWorkspaceId: activeWorkspace.id,
        projectSlug: activeTask.project.slug,
        view: view,
        params
      })
    : ProjectsNavigator.getOpenTaskUrl({
        currentWorkspaceId: activeWorkspace.id,
        projectSlug: activeTask.project.slug,
        externalId: activeTask.parent.externalId,
        folderId: activeTask.folderId ?? undefined,
        params
      })

  return (
    <div className={styles.container}>
      <Header
        title={<BreadcrumbsTask task={activeTask} />}
        navigateUrlToBack={urlBack}
        withBreadcrumbs={true}
      >
        {canDeleteTask && (
          <Button
            styleButton={'outline'}
            colorButton={'red'}
            icon={<Trash />}
            className={'px-4 max-h-10 max-w-[52px]'}
            onClick={handleDeleteTask}
          />
        )}
      </Header>
      <div className={'flex flex-1 justify-between w-full h-[calc(100%-73px)]'}>
        <BodyTaskItem />
        <SidebarTaskItem />
      </div>
    </div>
  )
})
