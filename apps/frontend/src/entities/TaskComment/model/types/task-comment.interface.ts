import { Task } from '@/entities/Task'
import { IUser } from '@/entities/User/model/types/user.interface'
import { IBase } from '@/shared/types/base.interface'

export interface ITaskComment extends IBase {
  user: IUser
  content: string
  dateDeleted: string | null
  reactions: ITaskCommentReaction[]
  files: FileData[]
  replyId: number | null
}

export interface CreateCommentParams {
  comment: string
  task: Task
  files: FileData[]
  replyId?: number
}

export interface ITaskCommentCreateDto {
  comment: string
  taskId: number
  files?: FileData[]
  replyId?: number
}

export interface ITaskCommentReaction {
  name: string
  id: number
  user: {
    id: number
    firstName: string
    lastName: string
    username: string
  }
  commentId: number
  dateCreated: Date
}

export interface ITaskCommentReactDto {
  name: string
}

export interface ITaskFileCommentDto {
  file: File
}

export interface FileData {
  id?: number
  originalName: string
  size?: number
  dateCreated?: Date
  file: File
}

export interface UpdateCommentParams {
  task: Task
  comment: string
}