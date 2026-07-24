import { IUser } from '@/entities/User'

interface IEntity {
  id: number
  name: string
}

type INotificationUser = Pick<
  IUser,
  | 'avatarId'
  | 'email'
  | 'firstName'
  | 'iconBg'
  | 'iconFg'
  | 'id'
  | 'lastName'
  | 'username'
>

export interface INotificationInvitation {
  sender: INotificationUser
  invitationId: number
}

export interface INotificationMessage {
  uuid: string
  dateCreated: Date
  dateDeleted: Date
  isRead: boolean
  project?: {
    id: number
    workspaceId: number
    name: string
    slug: string
    update?: {
      invitation?: INotificationInvitation
      acceptInvitation?: {
        member: INotificationUser
      }
      declineInvitation?: {
        invitee: INotificationUser
      }
      cancelInvitation?: {
        invitationId: number
        canceler: INotificationUser
      }
    }
  }
  workspace?: {
    id: number
    name: string
    newProject?: IEntity
    update?: {
      invitation?: INotificationInvitation
      acceptInvitation?: {
        member: INotificationUser
      }
      declineInvitation?: {
        invitee: INotificationUser
      }
      cancelInvitation?: {
        invitationId: number
        canceler: INotificationUser
      }
    }
  }
  task?: {
    id: number
    name: string
    externalId: string
    isCreated?: boolean
    update?: {
      newComment?: {
        id: number
        content: string
        author: string
      }
      newFile?: IEntity
      status?: IEntity
      deadlineDate?: Date
      priority?: number
      execute?: {
        executor: IEntity
      }
      isExecutor?: boolean
      isAssigner?: boolean
      removeFromExecutor?: boolean
      removeFromAssigner?: boolean
      isDeleted?: boolean
      changeProject?: IEntity
      newSubtask?: IEntity
    }
  }
}
