import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import React, { FC, ReactNode } from 'react'
import { TaskExecutorAutocomplete } from '@/features/Task'
import { DeadlineDate } from '@/features/Task/DeadlineDate/DeadlineDate'
import { CircleProgress } from '@/features/TaskKanban/CircleProgress/CircleProgress'
import { UserAvatar } from '@/features/User'
import { Task, usePermissionTask } from '@/entities/Task'
import { CardSize } from '@/entities/TaskPlanner'
import {
  Comment,
  File,
  TaskFinished,
  UserPlus
} from '@/shared/assets/images/icons'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { Popover } from '@/shared/ui/Popover/Popover'
import styles from './TaskFooter.module.scss'


interface Props {
  task: Task
}

export const TaskFooter: FC<Props> = observer(({ task }) => {
  const {
    taskPlanerStore: { cardSize }
  } = useRootStore()

  const isCardMediumOrLarge =
    cardSize === CardSize.medium || cardSize === CardSize.large

  const { canChangeTaskExecutor } = usePermissionTask(task)

  const getCompletedSubtasksLength = (subtasks: Task[]) => {
    return subtasks.filter((subtask) => subtask.dateFinished).length
  }

  const hasComments = (task.commentsCount ?? 0) > 0
  const hasFiles = (task.filesCount ?? 0) > 0
  const hasSubtasks = task.subtasks?.length > 0
  const completedSubtasks = getCompletedSubtasksLength(task.subtasks ?? [])
  const allSubtasksDone =
    hasSubtasks && completedSubtasks === task.subtasks.length
  const isDisabled = !canChangeTaskExecutor || task.dateFinished

  return (
    <div
      className={classNames(
        'flex justify-between w-full items-center',
        task.subtasks.length > 0 &&
          isCardMediumOrLarge &&
          'pb-3 border-b border-hover'
      )}
    >
      <div className={'flex gap-1'}>
        {isCardMediumOrLarge ? (
          <>
            {hasComments && (
              <TaskMeta
                icon={<Comment className='icon w-4 h-4' />}
                count={task.commentsCount}
              />
            )}

            {hasFiles && (
              <TaskMeta
                icon={<File className='icon w-4 h-4' />}
                count={task.filesCount}
              />
            )}
          </>
        ) : (
          !task.dateFinished && (
            <DeadlineDate
              task={task}
              rootClassName={'w-max'}
              classNameWrapper={'rounded bg-hover hover:bg-hoverOnHover'}
              valueFormat={'DD.MM'}
            />
          )
        )}

        {hasSubtasks && (
          <div className='flex bg-hover rounded p-2 items-center gap-1'>
            {allSubtasksDone ? (
              <TaskFinished className={'w-4 h-4'} />
            ) : (
              <CircleProgress
                completed={completedSubtasks}
                total={task.subtasks.length}
              />
            )}
            <p className='body-14-16'>
              {completedSubtasks}/{task.subtasks.length}
            </p>
          </div>
        )}
      </div>

      <Popover>
        <Popover.Trigger
          className={classNames(
            task.executor
              ? 'p-0'
              : 'flex bg-hover rounded p-2 hover:bg-hoverOnHover',
            isDisabled && styles.disabled,
            task.executor && 'border-none'
          )}
          data-ignore-click='true'
        >
          {task.executor ? (
            <UserAvatar user={task.executor} data-ignore-click />
          ) : (
            <div>
              <UserPlus className={'icon w-4 h-4'} />
            </div>
          )}
        </Popover.Trigger>
        <Popover.Content
          align={'center'}
          data-ignore-click='true'
          className={'w-[300px]'}
        >
          <TaskExecutorAutocomplete task={task} />
        </Popover.Content>
      </Popover>
    </div>
  )
})

const TaskMeta: FC<{ icon: ReactNode; count: number }> = ({ icon, count }) =>
  count > 0 ? (
    <div className='flex bg-hover rounded p-2 items-center gap-1'>
      {icon}
      <p className='body-14-16'>{count}</p>
    </div>
  ) : null