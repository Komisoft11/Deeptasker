import { IUser } from '../user.interface'
import { IAdminEvent } from '../admin-event.interface'
import { IInviteeEvent } from '../invitee-event.interface'

export interface IWorkspaceUpdateEvent {
  title?: string
  user?: IUser
  admin?: IAdminEvent
  invitee?: IInviteeEvent
}
