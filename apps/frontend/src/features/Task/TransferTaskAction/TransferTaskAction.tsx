import { FC, MouseEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router'
import { TaskAction } from '@/features/Task/TaskAction/TaskAction'
import { ITaskAction } from '@/features/Task/TaskAction/types/task-action.interface'
import { Move } from '@/shared/assets/images/icons'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { ProjectsNavigator } from '@/shared/lib/navigators/projects.navigator'

export const TransferTaskAction: FC<ITaskAction> = ({
  task,
  isHoveredTask,
  onMouseLeave,
  className
}) => {
  const navigate = useNavigate()
  const {
    workspaceStore: { activeWorkspace },
    projectStore: { activeProject }
  } = useRootStore()
  const { t } = useTranslation()
  const [params] = useSearchParams()

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    onMouseLeave(e)
    navigate(
      ProjectsNavigator.getOpenTaskUrl({
        currentWorkspaceId: activeWorkspace.id,
        projectSlug: activeProject.slug,
        externalId: task.externalId,
        params
      })
    )
  }

  return (
    <TaskAction
      onClick={handleClick}
      isHoveredTask={isHoveredTask}
      contentForToolkit={t('task.moveToTask')}
      className={className}
    >
      <Move />
    </TaskAction>
  )
}
