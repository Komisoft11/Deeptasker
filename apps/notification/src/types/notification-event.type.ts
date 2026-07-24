import type {
  BugReportEvent,
  FeedbackReportEvent,
  InvitationEvent,
  NoticeEvent,
  OtpRequestedEvent,
  UpdatePolicyEvent
} from '@/notification/types'
import type { DomesticNotificationEvent } from '../domestic-notification/types'
import type { Lang } from './lang.type'

type NotificationEventMap = OtpRequestedEvent &
  NoticeEvent &
  InvitationEvent &
  UpdatePolicyEvent &
  FeedbackReportEvent &
  BugReportEvent &
  DomesticNotificationEvent

type NotificationType = keyof NotificationEventMap

type RecipientType = {
  email?: string
  emails?: string[]
  phone?: string
  userId?: number
}

type SenderType = {
  userId?: number
}

export type NotificationEventType<T extends NotificationType> = {
  type: T
  recipient: RecipientType
  sender?: SenderType
  lang: Lang
  payload: NotificationEventMap[T]
}
