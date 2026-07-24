import { DetailedHTMLProps, HTMLAttributes } from 'react'
import { Task } from '@/entities/Task'


export interface ITaskProxyItem
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  task: Task
}
