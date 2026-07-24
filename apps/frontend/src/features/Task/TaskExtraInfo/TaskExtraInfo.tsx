import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import React, { Dispatch, SetStateAction, useState } from 'react'
import { useExecuteTask } from '@/widgets/Task/ExecuteTask/lib/useExecuteTask'
import { TaskExecutorAutocomplete } from '@/features/Task'
import { DeadlineDate } from '@/features/Task/DeadlineDate/DeadlineDate'
import { Task, usePermissionTask, useTasks } from '@/entities/Task'
import {
  Calendar,
  Close,
  Edit,
  PlusCircle,
  Trash
} from '@/shared/assets/images/icons'
import useStopPropagation from '@/shared/lib/hooks/useStopPropagation'
import styles from './TaskExtraInfo.module.scss'


interface Props {
  task: Task
  className?: string
  onPlusClick?: () => void
  showInput?: boolean
  setIsEditTitle: Dispatch<SetStateAction<boolean>>
  isEditTitle: boolean
}

export const TaskExtraInfo = observer(
  ({
    task,
    className,
    onPlusClick,
    showInput,
    setIsEditTitle,
    isEditTitle
  }: Props) => {
    const {
      deleteAsync: { mutateAsync }
    } = useTasks()
    const { handleStopPropagation } = useStopPropagation()
    const { canChangeTaskExecutor, canEditTitleTask } = usePermissionTask(task)
    const [isChooseDate, setIsChooseDate] = useState(false)
    const { isExecuted } = useExecuteTask(task)
    const toggleDatePicker = () => setIsChooseDate((prevState) => !prevState)
    const { canDeleteTask, canCreateSubTasks, canChangeDeadline } =
      usePermissionTask(task)

    const handleDelete = async () => {
      await mutateAsync(task)
    }

    const hasDeadline = task.deadlineDate !== null
    const isDeadlinePickerOpen = isChooseDate

    const shouldShowDeadlineDate = hasDeadline || isDeadlinePickerOpen
    const shouldShowCalendarIcon = !hasDeadline && !isDeadlinePickerOpen

    const isExecutorDisabled = !canChangeTaskExecutor || isExecuted

    const openEdit = (e: React.MouseEvent) => {
      e.stopPropagation()
      setIsEditTitle(true)
    }

    const closeEdit = (e: React.MouseEvent) => {
      e.stopPropagation()
      setIsEditTitle(false)
    }

    return (
      <div
        className={classNames(styles.container, className)}
        onClick={handleStopPropagation}
      >
        {canEditTitleTask &&
          !isExecuted &&
          (isEditTitle ? (
            <div className='iconContainer bg-hover' onClick={closeEdit}>
              <Close className='icon w-4 h-4' />
            </div>
          ) : (
            <div className='iconContainer' onClick={openEdit}>
              <Edit className='icon w-4 h-4' />
            </div>
          ))}

        <TaskExecutorAutocomplete
          task={task}
          classNames={{
            control: () =>
              classNames(styles.control, isExecuted && 'h-10 border-border'),
            option: () => styles.option,
            valueContainer: () => styles.value__container
          }}
          styles={{
            menu: (base) => ({
              ...base,
              width: 'max-content',
              minWidth: '200px'
            })
          }}
          isDisabled={isExecutorDisabled}
        />
        {!isExecuted && (
          <>
            <div className={'max-w-max'}>
              {shouldShowDeadlineDate && (
                <DeadlineDate
                  task={task}
                  disabled={!canChangeDeadline}
                  valueFormat={'DD.MM.YYYY'}
                  classNameInput={'w-max'}
                />
              )}
            </div>

            <div className='flex gap-1 py-1'>
              {shouldShowCalendarIcon && canChangeDeadline && (
                <div onClick={toggleDatePicker} className={'iconContainer'}>
                  <Calendar className='icon w-4 h-4' />
                </div>
              )}

              {canCreateSubTasks && (
                <div
                  className={classNames(
                    'iconContainer',
                    showInput && 'bg-objects'
                  )}
                  onClick={onPlusClick}
                >
                  <PlusCircle className='icon w-4 h-4' />
                </div>
              )}

              {canDeleteTask && (
                <div className={'iconContainer'} onClick={handleDelete}>
                  <Trash className={'w-4 h-4 iconRed'} />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    )
  }
)
