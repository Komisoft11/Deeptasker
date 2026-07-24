import classNames from 'classnames'
import dayjs from 'dayjs'
import { observer } from 'mobx-react-lite'
import { Task, usePermissionTask, useTasks } from '@/entities/Task'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { DateTimePickerMantine } from '@/shared/ui/DateTimePickerMantine/DateTimePickerMantine'

interface Props {
  task: Task
  rootClassName?: string
  classNameWrapper?: string
  valueFormat?: string
  classNameInput?: string
  disabled?: boolean
}

export const DeadlineDate = observer(
  ({
    task,
    rootClassName,
    classNameWrapper,
    valueFormat,
    classNameInput,
    disabled
  }: Props) => {
    const { sprintStore, taskStore } = useRootStore()
    const { updateAsync } = useTasks()
    const { canChangeDeadline } = usePermissionTask(task)

    const handleUpdate = (date: string | null) => {
      const { deadlineDate: currentDeadline } = taskStore.get(task.id)

      if (date === currentDeadline || dayjs(date).isSame(currentDeadline)) {
        return
      }

      updateAsync.mutate({
        id: task.id,
        dto: {
          deadlineDate: date != null ? new Date(date) : null
        }
      })
    }

    const isOverdue =
      task.dateFinished === null &&
      task.deadlineDate &&
      dayjs(task?.deadlineDate).isBefore(new Date())

    const sprint = sprintStore.find(task.sprintId)

    const minDate =
      sprint?.dateStart && dayjs(sprint.dateStart).isAfter(new Date())
        ? sprint.dateStart
        : new Date()
    const maxDate = sprint?.dateEnd ?? task.parent?.deadlineDate ?? undefined

    const key = `deadline-${task.id}-${
      task.deadlineDate ? new Date(task.deadlineDate) : 'null'
    }`

    return (
      <DateTimePickerMantine
        key={key}
        onSubmitValue={handleUpdate}
        classNamesOverride={{
          root: classNames(
            rootClassName,
            'rounded-lg',
            isOverdue && 'border border-systemRed'
          ),
          wrapper: classNameWrapper,
          input: classNames(classNameInput, 'body-14-16')
        }}
        initialDate={
          task.deadlineDate !== null
            ? dayjs(task.deadlineDate).format('YYYY-MM-DD HH:mm')
            : null
        }
        onClear={() => handleUpdate(null)}
        minDate={minDate}
        maxDate={maxDate}
        disabled={!canChangeDeadline || disabled}
        valueFormat={valueFormat}
      />
    )
  }
)
