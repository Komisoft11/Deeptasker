import { IUser } from '../user.interface'
import { IMemberEvent } from '../member-event.interface'
import { IInviteeEvent } from '../invitee-event.interface'

export interface IProjectUpdateEvent {
  title?: string
  slug?: string
  parentId?: number
  rootId?: number
  order?: number
  taskCount?: number
  user?: IUser
  member?: IMemberEvent
  dateArchived?: Date | null
  invitee?: IInviteeEvent
}