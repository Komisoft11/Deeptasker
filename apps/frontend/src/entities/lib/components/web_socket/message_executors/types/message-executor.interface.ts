import { Folder, IFolderDTO, IUpdateFolderDTO } from '@/entities/Folder'
import {
  IPermissionProject,
  IProjectDto,
  ITag,
  Project,
  ProjectRole
} from '@/entities/Project'
import { Invitees } from '@/entities/Project/model/types/project.interface'
import { IProjectReport } from '@/entities/Report'
import {
  ISprintDTO,
  ISprintUpdateDTO
} from '@/entities/Sprint/model/types/sprint.types'
import { TaskResponse } from '@/entities/Task'
import {
  FileData,
  ITaskCommentReaction
} from '@/entities/TaskComment/model/types/task-comment.interface'
import { IUser } from '@/entities/User'
import { IObserverUser } from '@/entities/User/model/types/user.interface'
import {
  IPermissionWorkspace,
  IWorkspaceDTO,
  Workspace
} from '@/entities/Workspace'

export type ITaskUpdateEvent =
  | TaskResponse
  | IWebSocketTaskComment
  | IWebSocketTaskTag
  | IWebSocketObserver
  | IWebSocketTaskFile

export interface ITaskMessage {
  id: number
  update?: ITaskUpdateEvent
  create?: TaskResponse
  delete?: TaskResponse
  move?: IWebsocketMoveTask
}

export interface IWebsocketMoveTask {
  folder?: {
    change?: {
      newFolderId: number
    }
    remove?: {
      folderId: number
    }
  }
  task?: {
    change?: {
      newTaskId: number
      oldTaskId?: number
    }
    remove?: {
      parentId: number
    }
  }
}

export interface IWebSocketTaskFile {
  file: {
    id: number
    originalName: string
    userId: number
    size?: number
    dateCreated: Date
    file: File
    dateDeleted?: Date
  }
}

export interface IFolderMessage {
  id: number
  update?: IUpdateFolderDTO
  create?: IFolderDTO
  delete?: Folder
}

export interface IWebSocketObserver {
  observers: {
    add?: IObserverUser[]
    remove?: IObserverUser[]
  }
}

export type CommentEventType = 'add' | 'update' | 'delete'

export interface IWebSocketTaskComment {
  projectId: number
  comment: {
    type: CommentEventType
    taskId: number
    dto: {
      id: number
      replyId: number
      user: IUser
      content: string
      dateDeleted: Date
      reaction?: {
        add?: ITaskCommentReaction
        remove?: ITaskCommentReaction
      }
      files: FileData[]
    }
  }
}

export interface IWebSocketTaskTag {
  tags: {
    add?: ITag
    delete?: ITag
  }
}

export interface IWebSocketProjectTag {
  add?: {
    id: number
    color: string
    name: string
  }
  delete?: ITag
  update?: {
    id: number
    color?: string
    name?: string
  }
}

export interface IStatusMessage {
  statusId: number
  create?: {
    name: string
    color: string
    order: number
  }
  update?: {
    name?: string
    color?: string
  }
  delete?: {
    dateDeleted: Date
  }
}

export interface ISprintMessage {
  id: number
  update?: ISprintUpdateDTO
  create?: ISprintDTO
  delete?: { projectId: number; dateDeleted: Date }
  tasks?: ISprintUpdateTasks
}

export interface ISprintUpdateTasks {
  add?: number[]
  remove?: number[]
}

export interface IMessageExecutor {
  execute(event: MessageEvent): void
}

export interface IProjectMessageEvent {
  userId: number
  project: IProjectMessage
}

export interface IProjectMessage {
  id: number
  task?: ITaskMessage
  update?: Project | IWebSocketMember | IWebSocketInvitee | IProjectDto
  create?: IProjectCreate
  delete?: Project
  folder?: IFolderMessage
  report?: IProjectReport
  sprint?: ISprintMessage
  tags?: IWebSocketProjectTag
  status?: IStatusMessage
}

export type IProjectCreate = IProjectDto & {
  members?: Invitees
}

export type MemberEventType = 'add' | 'remove' | 'updatePermissions'

export interface IWebSocketMember {
  userId: number
  member: IMember
}

export interface IWebSocketInvitee {
  userId: number
  invitee: IInvitee
}

export interface IWorkspaceUpdateDto {
  id?: number
  title?: string
  user?: IUser
  admin?: IWorkspaceAdmin
  invitee?: IInvitee
}

export interface IMember {
  role: ProjectRole
  type: MemberEventType
  user: IUser
  permissions: IPermissionProject
}

export interface IInvitee {
  type: 'add' | 'remove'
  email: string
  senderId: number
}

export interface IWorkspaceAdmin {
  type: MemberEventType
  admin: IUser
  permissions?: IPermissionWorkspace
}

export interface IWorkspaceMessage {
  userId: number
  workspace: {
    id: number
    delete?: IWorkspaceDTO
    update?: IWorkspaceUpdateDto
    create?: Workspace
    project?: IProjectMessage
  }
}

export interface INotificationMessage {
  userId: number
  notification: {
    countUnread: number
    receiverId: number
    create: {
      uuid: string
      dateCreated: Date
    }
  }
}
