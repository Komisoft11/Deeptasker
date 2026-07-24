// UI
export { TaskFilterContent } from './ui/TaskFilter/TaskFilterContent'
export { TaskTimer } from './ui/TaskTimer/TaskTimer'
export { StartTimerOtherTaskDialog } from './ui/StartTimerOtherTaskDialog/StartTimerOtherTaskDialog'
export { NotFoundTasks } from './ui/NotFoundTasks/NotFoundTasks'
export { LinkTaskDialog } from './ui/LinkTaskDialog/LinkTaskDialog'
export { AddTaskInput } from './ui/AddTaskInput/AddTaskInput'
export { ProjectPopover } from './ui/ProjectChip/ProjectPopover'
export { TaskContent } from './ui/TaskContent/TaskContent'
export { TaskListSkeleton } from './ui/TaskListSkeleton/TaskListSkeleton'
export { TaskAuthorInfo } from './ui/TaskAuthorInfo/TaskAuthorInfo'
export { ExternalId } from './ui/ExternalId/ExternalId'

// STORE
export { TaskStore } from './model/task.store'
export { TaskTimerStore } from './model/task-timer.store'

export { Task } from './model/task'

// SERVICES
export { TaskService } from './services/task.service'
// Hooks
export { usePermissionTask } from './model/PermissionTask'
export * from './lib/hooks'

// COMPONENTS
export { TaskReturner } from './model/TaskReturner'
export { TaskStatusChanger } from './components/task-status/TaskStatusChanger'

// CONST
export {
  dateFilterKeys,
  idFilterKeys,
  booleanFilterKeys,
  filterMap,
  propertyDateMap,
  arrayOfPriorities
} from '@/entities/Task/const/filters'

export { TaskRoles } from '@/entities/Task/const/roles'

// TYPES
export type {
  IBooleanFilters,
  IDateFilters,
  IIdFilters,
  IFilters,
  DateFilterKeys,
  UnifiedFilterKeys,
  BooleanFilterKeys,
  TaskPriority
} from '@/entities/Task/const/filters'

export type { TagStyledProps, IContent } from './model/types/task.interface'

// RESPONSE TYPES
export type {
  MoveTasksToNewStatusResponse,
  TaskResponse,
  ExtendedTaskResponse,
  TrackingTaskResponse,
  ReassignUserResponse,
  StartTaskResponse,
  StopTaskResponse,
  FinishTaskResponse
} from './model/types/task-response.interface'

// REQUEST TYPES
export type {
  MoveTasksToNewStatusRequest,
  TaskCreateRequest,
  TaskUpdateFieldsRequest,
  MoveTaskRequest,
  BindTaskRequest,
  AutoCompleteRequest,
  TaskChangeProjectRequest,
  TaskChangeFolderRequest,
  AssignUserRequest,
  AssignObserverRequest,
  TimerHistoryRequest,
  AddTimeHistoryRequest,
  TagRequest
} from './model/types/task-request.interface'

// SCHEMAS
export { createTaskSchema } from './lib/taskSchema'
