import { INotificationCreateEvent } from './notification-create.event'
import { INotificationDeleteEvent } from './notification-delete.event'

export interface INotificationEvent {
  countUnread: number
  receiverId: number
  create?: INotificationCreateEvent
  delete?: INotificationDeleteEvent
}
