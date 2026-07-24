import type { NotificationPayload } from '@komisoft/deeptasker-contracts'

export interface NotificationMessage extends NotificationPayload {
  uuid: string
  dateCreated: Date
  isRead: boolean
}
