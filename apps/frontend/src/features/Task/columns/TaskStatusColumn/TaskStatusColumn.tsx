import { TaskStatus } from '@/features/Task'
import { Task } from '@/entities/Task'

interface Props {
  task: Task
  className?: string
  disabled?: boolean
}

export const TaskStatusColumn = ({
  task,
  className,
  disabled = false
}: Props) => {
  return <TaskStatus task={task} className={className} disabled={disabled} />
}
