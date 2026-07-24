import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import React, { FC } from 'react'
import { Task, usePermissionTask, useTimerTask } from '@/entities/Task'
import { Pause, Start } from '@/shared/assets/images/icons'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import useStopPropagation from '@/shared/lib/hooks/useStopPropagation'
import { Button } from '@/shared/ui/Button/Button'

interface Props {
  task: Task
  className?: string
}

export const TaskTracker: FC<Props> = observer(({ task, className = '' }) => {
  const { taskTimerStore } = useRootStore()
  const { startTimerAsync, stopTimerAsync } = useTimerTask()
  const isCurrentTaskRunning = taskTimerStore.isCurrentTaskRunning(task)
  const { canTrackTask } = usePermissionTask(task)

  const { handleStopPropagation } = useStopPropagation()

  const handleTimerClick = () => {
    if (isCurrentTaskRunning) {
      return stopTimerAsync.mutateAsync(task)
    }

    return startTimerAsync.mutateAsync(task)
  }

  return (
    <Button
      styleButton={'filled'}
      colorButton={'accent'}
      icon={isCurrentTaskRunning ? <Pause /> : <Start />}
      className={classNames(
        canTrackTask && 'p-2 hover:!opacity-100',
        className,
        !canTrackTask && '!opacity-0'
      )}
      data-disabled={!canTrackTask ? 'true' : undefined}
      onClick={async (e) => {
        handleStopPropagation(e)
        await handleTimerClick()
      }}
    />
  )
})
