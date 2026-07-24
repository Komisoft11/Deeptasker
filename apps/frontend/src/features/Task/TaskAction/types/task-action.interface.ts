import { MouseEventHandler } from 'react'
import { Task } from '@/entities/Task'

export interface ITaskAction {
  isHoveredTask: boolean
  onMouseLeave: MouseEventHandler<HTMLDivElement>
  task: Task
  className?: string
}
