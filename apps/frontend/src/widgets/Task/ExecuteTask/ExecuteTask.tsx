import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import React, { useEffect, useState } from 'react'
import { useExecuteTask } from '@/widgets/Task/ExecuteTask/lib/useExecuteTask'
import { Task, usePermissionTask } from '@/entities/Task'
import { Check } from '@/shared/assets/images/icons'
import useStopPropagation from '@/shared/lib/hooks/useStopPropagation'
import styles from './ExecuteTask.module.scss'


interface ICheckTaskProps {
  task: Task
  circleClassName?: string
  isForSubtask?: boolean
  isClickable?: boolean
  containerClassName?: string
}

export const ExecuteTask = observer(
  ({
    circleClassName,
    task,
    isForSubtask = false,
    isClickable: isClickable = true,
    containerClassName
  }: ICheckTaskProps) => {
    const [_, setIsTracking] = useState<boolean>(false)
    const [hover, setHover] = useState<boolean>(false)
    const { isExecuted, handleFinishTask } = useExecuteTask(task)

    const { handleStopPropagation } = useStopPropagation()
    const isHoverAndNotExecute = hover && !isExecuted
    const isAutoExecution = !!task.finishedByTaskId && isExecuted
    const isNotAutoExecution = !task.finishedByTaskId && isExecuted

    useEffect(() => {
      setIsTracking(!!task.activeDate)
    }, [task.activeDate])

    const { canExecuteTask } = usePermissionTask(task)

    const handleClick = async (e: React.MouseEvent<HTMLDivElement>) => {
      await handleFinishTask(e)
    }

    const handleExecuteClick = async (e: React.MouseEvent<HTMLDivElement>) => {
      handleStopPropagation(e)

      if (!isClickable || !canExecuteTask) return

      await handleClick(e)
    }

    return (
      <div
        className={classNames(
          'h-fit p-1 pl-2',
          !canExecuteTask && 'disabled-70',
          task.hasChildren && !isForSubtask && 'border-l border-border',
          containerClassName
        )}
        onClick={handleExecuteClick}
      >
        <div
          data-no-dnd={true}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          className={classNames(
            styles.circle,
            isHoverAndNotExecute && styles.hover,
            isAutoExecution && styles.isAuto,
            isNotAutoExecution && styles.isNotAuto,
            isExecuted && styles.executed,
            !canExecuteTask && 'pointer-events-none',
            circleClassName
          )}
        >
          {isExecuted ? <Check /> : null}
        </div>
      </div>
    )
  }
)
