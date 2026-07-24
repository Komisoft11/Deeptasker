import { ITag } from '@/entities/Project'
import {
  FileData,
  ITaskComment
} from '@/entities/TaskComment/model/types/task-comment.interface'
import { IUser } from '@/entities/User'
import { IObserver } from '@/entities/User/model/types/user.interface'

export interface MoveTasksToNewStatusResponse {
  updatedAt: Date
}

export interface TaskResponse {
  files: FileData[]
  id: number
  commentsCount: number
  filesCount: number

  title: string
  content: string | null

  assigner: IUser
  user: IUser
  executor: IUser | null
  priority: number

  finishedByTaskId: number | null

  subtasks: number[]
  parentId?: number

  tags: ITag[]

  statusId: number
  projectId: number

  dateFinished: string | null
  dateCreated: string
  activeDate: string | null
  deadlineDate: string | null
  planStartDate: string | null
  dateUpdated: string | null
  estimatedTime: number | null

  customOrder: number | null
  statusOrder: number

  dateSentForReview: string | null
  folderId: number | null

  comments: ITaskComment[]
  timeHistory: TaskTimerHistoryResponse[]
  statusDateUpdated: string | null
  sprintId: number | null
  externalId: string
}

export interface ExtendedTaskResponse extends Pick<TaskResponse, 'id'> {
  userSecondsTracked: number
  totalSecondsTacked: number
  invited: IObserver[]
  files: FileData[]
}

export interface TrackingTaskResponse extends TaskResponse {
  workspaceId: number
  userSecondsTracked: number
}

export interface TaskTimerHistoryResponse {
  id: number
  comment: string | null
  endTime: Date | null
  startTime: Date | null
  taskId: number
  editedDate: Date | null
  user: IUser
  userId: number
}

export interface ReassignUserResponse {
  reassignedAt: Date
}

export interface StartTaskResponse {
  startedAt: Date
}

export interface StopTaskResponse {
  stoppedAt: Date
}

export interface FinishTaskResponse {
  finishedAt: Date
}
