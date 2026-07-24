import classNames from 'classnames'
import React, { Dispatch, SetStateAction } from 'react'
import { useTranslation } from 'react-i18next'
import { usePermissionProject } from '@/entities/Project'
import { Task, usePermissionTask, useTasks } from '@/entities/Task'
import { PlusCircle, Trash, VerticalDots } from '@/shared/assets/images/icons'
import { StatusCodes } from '@/shared/const/statusCodes'
import { DropdownMenu } from '@/shared/ui/DropdownMenu/DropdownMenu'
import styles from './TaskActionsColumn.module.scss'


interface Props {
  task: Task
  setCurrentTaskId?: Dispatch<SetStateAction<number | null>>
  disabled?: boolean
}

export const TaskActionsColumn = ({
  task,
  setCurrentTaskId,
  disabled = false
}: Props) => {
  const { deleteAsync } = useTasks()
  const { t } = useTranslation()

  const {
    permissions: { createTasks }
  } = usePermissionProject()

  const { canDeleteTask, canCreateSubTasks } = usePermissionTask(task)

  const handleAddSubtaskToTask = () => {
    canCreateSubTasks && setCurrentTaskId?.(task.id)
  }
  const handleDeleteTask = async () => {
    await deleteAsync.mutateAsync(task)
  }

  const isActionsDisabled = Boolean(task.project.dateArchived) || disabled
  const isShowDropdown = canDeleteTask || canCreateSubTasks
  const isTriggerDisabled = isActionsDisabled || !isShowDropdown
  const isExecuted = task.status.code === StatusCodes.EXECUTED

  return isExecuted ? (
    canDeleteTask && (
      <div
        className={classNames('iconContainer mx-auto my-0')}
        onClick={async (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
          e.stopPropagation()
          await deleteAsync.mutateAsync(task)
        }}
      >
        <Trash className={'iconRed w-4 h-4'} />
      </div>
    )
  ) : (
    <DropdownMenu>
      <DropdownMenu.Trigger
        className={classNames(
          'hover:bg-hover h-8 w-8 flex items-center justify-center',
          isActionsDisabled && 'disabled'
        )}
        disabled={isTriggerDisabled}
      >
        <VerticalDots className={'icon w-4 h-4'} />
      </DropdownMenu.Trigger>
      {isShowDropdown && (
        <DropdownMenu.Content data-no-dnd className={styles.menu} align={'end'}>
          {canCreateSubTasks && (
            <DropdownMenu.Item
              className={classNames(styles.item, !createTasks && 'disabled-70')}
              onClick={handleAddSubtaskToTask}
            >
              <PlusCircle className={'h-5 w-5 icon'} />
              <p className={'body-14-20'}>{t('task.info.addSubtask')}</p>
            </DropdownMenu.Item>
          )}

          {canDeleteTask && (
            <DropdownMenu.Item
              className={classNames(
                styles.item,
                styles.delete,
                !canDeleteTask && 'disabled-70'
              )}
              onClick={handleDeleteTask}
            >
              <Trash className={'h-5 w-5 icon'} />
              <p className={'body-14-20'}>{t('task.delete')}</p>
            </DropdownMenu.Item>
          )}
        </DropdownMenu.Content>
      )}
    </DropdownMenu>
  )
}
