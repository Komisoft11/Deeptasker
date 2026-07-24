import { ITag, Project } from '@/entities/Project'
import { Task, TaskResponse } from '@/entities/Task'
import { TaskTimerHistoryResponse } from '@/entities/Task/model/types/task-response.interface'
import { IUser } from '@/entities/User'
import { IObserverUser } from '@/entities/User/model/types/user.interface'

export interface MoveTasksToNewStatusRequest {
  projectId: number
  sourceStatusId: number
  targetStatusId: number
}

export type TaskCreateRequest = Pick<Task, 'title' | 'projectId'> & {
  parentId?: number
  executorId?: number
  statusId?: number
  folderId?: number
  sprintId?: number
  observers?: number[]
  content?: string
  priority?: number
  deadlineDate?: Date
  assignerId?: number
  tags?: number[]
}

type TaskUpdateDto = Partial<
  Pick<
    Task,
    | 'title'
    | 'content'
    | 'deadlineDate'
    | 'status'
    | 'statusOrder'
    | 'planStartDate'
    | 'estimatedTime'
    | 'sprintId'
  >
> &
  Partial<Pick<TaskResponse, 'statusId' | 'priority'>> &
  Partial<{
    executorId: number | null
  }>

export interface TaskUpdateFieldsRequest {
  id: number
  dto: TaskUpdateDto
}

export interface MoveTaskRequest {
  taskId: number
  taskFromId?: number
  taskToId?: number
  order: number
}

export interface BindTaskRequest {
  taskId: number
  parentId: number
}

export interface AutoCompleteRequest {
  id: number
  title: string
}

export interface TaskChangeProjectRequest {
  task: Task
  mainProject: Project
  changedProject: Project
}

export interface TaskChangeFolderRequest {
  taskId: number
  folderId: number
}

export type AssignUserRequest = [task: Task, user: IUser]

export type AssignObserverRequest = [task: Task, user: IObserverUser]

export type TimerHistoryRequest = Partial<
  Pick<TaskTimerHistoryResponse, 'endTime' | 'comment'>
>
export interface AddTimeHistoryRequest {
  comment: string
  endTime: Date
  startTime: Date
}

export interface TagRequest {
  task: Task
  tag: ITag
}
