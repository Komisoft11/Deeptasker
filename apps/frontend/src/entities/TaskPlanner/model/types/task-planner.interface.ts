import { UniqueIdentifier } from '@dnd-kit/core'
import { Task } from '@/entities/Task'

export type ModeDragger = 'left' | 'right' | null

export type TasksByStatus = Record<UniqueIdentifier, UniqueIdentifier[]>

export type OnlyIdentifierTasksByStatus = Record<
  UniqueIdentifier,
  UniqueIdentifier[]
>

export interface InitialDataResize {
  modeDragger: ModeDragger
  startWidth: number
  startLeft: number
}

export interface ClientRect {
  width: number
  height: number
  top: number
  left: number
  monthStartIndex: number
  monthEndIndex: number
}

export interface ITaskPlanner
  extends Pick<
    Task,
    'id' | 'title' | 'priorityPlanner' | 'executor' | 'status'
  > {
  dateStart: Date
  dateEnd: Date
  ganttRect: ClientRect
}

export type PriorityNumber1To6 = 1 | 2 | 3 | 4 | 5 | 6
