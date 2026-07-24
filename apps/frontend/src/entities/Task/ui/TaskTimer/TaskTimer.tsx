import { observer } from 'mobx-react-lite'
import { FC } from 'react'
import { StartTimerOtherTaskDialog, Task, useTimerTask } from '@/entities/Task'
import { Pause, Start } from '@/shared/assets/images/icons'
import useDialogAndPopover from '@/shared/lib/hooks/useDialogAndPopover'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import styles from './TaskTimer.module.scss'

interface Props {
  task: Task
}

export const TaskTimer: FC<Props> = observer(({ task }) => {
  const { startTimerAsync, stopTimerAsync } = useTimerTask()
  const { open, onOpenChange } = useDialogAndPopover()
  const { taskTimerStore } = useRootStore()

  const handleClickTimer = async () => {
    if (isCurrentTaskRunning) {
      return stopTimerAsync.mutateAsync(task)
    }

    return startTimerAsync.mutateAsync(task)
  }

  const isCurrentTaskRunning = taskTimerStore.isCurrentTaskRunning(task)
  const isShowTimer = !!task.activeDate || !!task.userSecondsTracked

  return (
    <>
      <div
        className={isShowTimer ? styles.container : 'cursor-pointer'}
        onClick={handleClickTimer}
      >
        {isCurrentTaskRunning ? (
          <Pause className={'w-3 h-3'} />
        ) : (
          <Start className={'w-3 h-3'} />
        )}
        {isShowTimer && (
          <p className={'body-12 text-activeText'}>
            {taskTimerStore.getTimerStingByTask(task)}
          </p>
        )}
      </div>
      <StartTimerOtherTaskDialog
        visibility={open}
        changeVisible={onOpenChange}
        task={task}
      />
    </>
  )
})
