import { FilterName } from '@/entities/TaskFilter'
import { DateRange } from '@/shared/types/time.interface'

export interface IBooleanFilters {
  isOverdue?: boolean
}

export interface IDateFilters {
  creation?: DateRange
  finish?: DateRange
  deadline?: DateRange
}

export interface IIdFilters {
  assigner?: number[]
  executor?: number[]
  status?: number[]
  priority?: number[]
  tags?: number[]
  folderId?: number[]
  sprintId?: number[]
}

export interface IFilters extends IDateFilters, IIdFilters, IBooleanFilters {}

export type FilterKeys = keyof IFilters
export type DateFilterKeys = keyof IDateFilters
export type UnifiedFilterKeys = keyof IIdFilters
export type BooleanFilterKeys = keyof IBooleanFilters

export const dateFilterKeys: DateFilterKeys[] = [
  'creation',
  'finish',
  'deadline'
]

export const idFilterKeys: UnifiedFilterKeys[] = [
  'assigner',
  'executor',
  'status',
  'priority',
  'tags',
  'folderId',
  'sprintId'
]

export const booleanFilterKeys: BooleanFilterKeys[] = ['isOverdue']

export const filterMap: Record<FilterKeys, FilterName> = {
  creation: 'CREATION_DATE_FILTER',
  finish: 'FINISH_DATE_FILTER',
  deadline: 'DEADLINE_DATE_FILTER',
  assigner: 'ASSIGNER_FILTER',
  executor: 'EXECUTOR_FILTER',
  status: 'STATUS_FILTER',
  priority: 'PRIORITY_FILTER',
  isOverdue: 'IS_OVERDUE_FILTER',
  tags: 'TAGS_FILTER',
  folderId: 'FOLDER_FILTER',
  sprintId: 'SPRINT_FILTER'
}

export const propertyDateMap: Record<
  DateFilterKeys,
  'dateCreated' | 'dateFinished' | 'deadlineDate'
> = {
  creation: 'dateCreated',
  finish: 'dateFinished',
  deadline: 'deadlineDate'
}

export type TaskPriority = 'none' | 'low' | 'medium' | 'high'

export const arrayOfPriorities: TaskPriority[] = [
  'none',
  'low',
  'medium',
  'high'
]
