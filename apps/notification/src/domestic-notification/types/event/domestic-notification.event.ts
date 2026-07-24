import type { NotificationPayload } from '@komisoft/deeptasker-contracts'

export interface DomesticNotificationEvent {
  PUBLISH_DOMESTIC_NOTIFICATION: {
    message: NotificationPayload
  }
}
