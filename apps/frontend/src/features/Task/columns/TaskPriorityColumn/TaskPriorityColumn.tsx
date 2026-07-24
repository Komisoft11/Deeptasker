import { TaskPriority } from '@/features/Task'
import { Task } from '@/entities/Task'

interface Props {
  task: Task
  disabled: boolean
}

export const TaskPriorityColumn = ({ task, disabled }: Props) => {
  return <TaskPriority mode={'minimum'} task={task} disabled={disabled} />
}
