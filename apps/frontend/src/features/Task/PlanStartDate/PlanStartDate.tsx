import classNames from 'classnames'
import dayjs from 'dayjs'
import { observer } from 'mobx-react-lite'
import { FC } from 'react'
import { Task, useTasks } from '@/entities/Task'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { DateRange } from '@/shared/types/time.interface'
import { DatePickerMantine } from '@/shared/ui/DatePickerMantine/DatePickerMantine'

interface Props {
  task: Task
  disabled?: boolean
  className?: string
}

export const PlanStartDate: FC<Props> = observer(
  ({ task, className, disabled = false }) => {
    const { updateAsync } = useTasks()
    const { sprintStore } = useRootStore()

    const handleUpdate = (date: DateRange) => {
      if (
        (!(date instanceof Date) && date !== null) ||
        dayjs(date).isSame(task.planStartDate)
      ) {
        return
      }

      updateAsync.mutate({
        id: task.id,
        dto: { planStartDate: date }
      })
    }

    const sprint = sprintStore.find(task.sprintId)

    const minDate =
      sprint?.dateStart && dayjs(sprint.dateStart).isAfter(new Date())
        ? sprint.dateStart
        : new Date()
    const maxDate = task.deadlineDate ?? sprint?.dateEnd

    return (
      <DatePickerMantine
        onChange={handleUpdate}
        classNamesOverride={{ root: classNames('w-full', className) }}
        key={task.id}
        initialDate={task.planStartDate ?? undefined}
        minDate={minDate}
        maxDate={maxDate}
        disabled={disabled}
      />
    )
  }
)
