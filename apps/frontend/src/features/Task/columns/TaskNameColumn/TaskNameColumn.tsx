import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import { ExecuteTask } from '@/widgets/Task'
import { useExecuteTask } from '@/widgets/Task/ExecuteTask/lib/useExecuteTask'
import { MovePopover } from '@/features/Task/columns/TaskNameColumn/ui/MovePopover/MovePopover'
import { Task, usePermissionTask } from '@/entities/Task'
import { useTaskFolderContext } from '@/entities/Task/context/TaskFolderContext'
import { TaskTracker } from '@/entities/Task/ui/TaskTracker/TaskTracker'
import { StatusCodes } from '@/shared/const/statusCodes'
import { ENTITY } from '@/shared/const/translation'
import { LocalStorageHelper } from '@/shared/lib/helpers/local-storage.helper'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { ProjectsNavigator } from '@/shared/lib/navigators/projects.navigator'
import { ButtonCollapse } from '@/shared/ui/Button/ButtonCollapse/ButtonCollapse'
import styles from './TaskNameColumn.module.scss'

interface Props {
  task: Task
}

export const TaskNameColumn = observer(({ task }: Props) => {
  const navigate = useNavigate()
  const {
    workspaceStore: { activeWorkspace },
    taskStore
  } = useRootStore()
  const { folderId } = useParams()
  const { canOpenTask, canExecuteTask, canMoveTask } = usePermissionTask(task)
  const { isExecuted } = useExecuteTask(task)

  const [params] = useSearchParams()
  const { t } = useTranslation(ENTITY)
  const { flattenedItems } = useTaskFolderContext()

  const isCurrentTaskTracking = taskStore.trackingTask?.id === task.id

  const isShowFinished = LocalStorageHelper.getIsShowFinishedTasks()

  const handleCollapsed = () => {
    taskStore.changeCollapse(task)
  }

  const handleOpenTask = () => {
    navigate(
      ProjectsNavigator.getOpenTaskUrl({
        currentWorkspaceId: activeWorkspace.id,
        projectSlug: task.project.slug,
        externalId: task.externalId,
        folderId,
        params
      })
    )
  }

  const visibleTasks = isShowFinished
    ? flattenedItems
    : flattenedItems.filter((item) => item.status.code !== StatusCodes.EXECUTED)

  const isSomeTaskChildren = visibleTasks.some((task) => task.hasChildren)

  const completedCount = task.subtasks.filter(
    (s) => s.status.code === StatusCodes.EXECUTED
  ).length

  const isShowId = LocalStorageHelper.getIsShowId()

  return (
    <div
      className={classNames(
        styles.body,
        'items-center',
        !canOpenTask && styles.disabled
      )}
      onClick={() => canOpenTask && handleOpenTask()}
    >
      <div className={'flex items-center'}>
        {isSomeTaskChildren && (
          <ButtonCollapse
            data-no-dnd={true}
            onClick={handleCollapsed}
            className={classNames(
              styles.collapse,
              !task.hasChildren && 'opacity-0'
            )}
            isDefaultCollapsed={task.isCollapsed}
          />
        )}
        <ExecuteTask
          task={task}
          circleClassName={!canExecuteTask ? 'border-accent60' : ''}
        />
      </div>
      <div className={styles.titleContainer}>
        <p className={'body-14-16'}>
          {isShowId && (
            <span className='secondaryText shrink-0'>#{task.externalId}</span>
          )}

          <span
            className={classNames(
              styles.title,
              isExecuted && 'line-through opacity-50'
            )}
          >
            {task.title}
          </span>
        </p>

        {task.hasChildren && (
          <p
            className={classNames(
              'body-10 secondaryText',
              isExecuted && 'opacity-50'
            )}
          >
            {t('task.subtasksCount', { count: task.subtasks.length })}

            {completedCount > 0 && (
              <span className={'pl-1'}>
                ({t('task.subtasksCompleted', { count: completedCount })})
              </span>
            )}
          </p>
        )}
      </div>
      <div className={'flex gap-1'}>
        {!isExecuted && (
          <TaskTracker
            task={task}
            className={classNames(
              'timeTracker',
              styles.timeTracker,
              isCurrentTaskTracking ? 'opacity-100' : 'opacity-0'
            )}
          />
        )}

        {canMoveTask && <MovePopover task={task} />}
      </div>
    </div>
  )
})
