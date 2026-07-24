import { useEscapeKeydown } from '@radix-ui/react-use-escape-keydown'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import React, { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ExecuteTask, SubtaskRowItem } from '@/widgets/Task'
import { AddTaskInput, usePermissionTask } from '@/entities/Task'
import { TaskService } from '@/entities/Task/services/task.service'
import { Close, PlusCircle } from '@/shared/assets/images/icons'
import { StatusCodes } from '@/shared/const/statusCodes'
import { ENTITY, TRANSLATION } from '@/shared/const/translation'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { FooterButton } from '@/shared/ui/FooterButton/FooterButton'
import { ProgressBar } from '@/shared/ui/ProgressBar/ProgressBar'
import styles from './SubtasksTaskItem.module.scss'

interface Props {
  isShowFinishedTasks: boolean
}

export const SubtasksTaskItem = observer(({ isShowFinishedTasks }: Props) => {
  const [toggleAddTask, setToggleAddTask] = useState<boolean>(false)
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null)
  const {
    taskStore: { activeTask }
  } = useRootStore()
  const { t } = useTranslation([ENTITY, TRANSLATION])

  const { canCreateSubTasks } = usePermissionTask(activeTask)

  const executedCountTask = TaskService.getCountExecuteSubtask(activeTask)
  let percentage = Math.round(
    activeTask.subtasks.length > 0
      ? (executedCountTask / activeTask.subtasks.length) * 100
      : 0
  )

  const isComplete = percentage === 100

  const visibleTasks = isShowFinishedTasks
    ? activeTask.subtasks
    : activeTask.subtasks.filter(
        (item) => item.status.code !== StatusCodes.EXECUTED
      )

  useEscapeKeydown(() => {
    setActiveTaskId(null)
    setToggleAddTask(false)
  })

  return (
    <div className={styles.container}>
      {activeTask.subtasks.length > 0 ? (
        <div className={'flex flex-col gap-2'}>
          <p className={'body-12'}>
            {t('task.info.completedSubtasksPercentage', {
              percentage,
              executedCountTask,
              totalSubtasks: activeTask.subtasks.length,
              ns: ENTITY
            })}
          </p>
          <ProgressBar
            className={classNames(isComplete && 'bg-systemGreen')}
            value={executedCountTask}
            max={activeTask.subtasks.length}
          />
        </div>
      ) : (
        <p className={'body-12 w-full secondaryText text-center'}>
          {t('task.info.subtasksPlaceholder', { ns: ENTITY })}
        </p>
      )}

      {visibleTasks.length > 0 && (
        <div className={'flex flex-col'}>
          {visibleTasks.map((subtask) => {
            return (
              <SubtaskRowItem
                setToggleAddTask={setToggleAddTask}
                task={subtask}
                key={subtask.id}
                activeTaskId={activeTaskId}
                setActiveTaskId={setActiveTaskId}
                toggleAddTask={toggleAddTask}
              />
            )
          })}
        </div>
      )}

      {toggleAddTask && (
        <div className={styles.inputContainer}>
          <div className={'w-8 h-10'}></div>
          <ExecuteTask
            task={activeTask}
            circleClassName={'!pointer-events-none border-border !w-4 !h-4'}
            isClickable={false}
          />
          <AddTaskInput
            parent={activeTask}
            autoFocus
            className={styles.inputField}
            containerClassName={'focus-within:!outline-none'}
          />
        </div>
      )}

      {canCreateSubTasks && (
        <FooterButton
          buttonText={
            toggleAddTask
              ? t('cancel', { ns: TRANSLATION })
              : t('task.info.addSubtask', { ns: ENTITY })
          }
          styleButton={'filled'}
          colorButton={'dark'}
          isAbsolute
          onClick={() => {
            if (activeTaskId) {
              setActiveTaskId(null)
            }
            setToggleAddTask(!toggleAddTask)
          }}
          Icon={toggleAddTask ? Close : PlusCircle}
        />
      )}
    </div>
  )
})
