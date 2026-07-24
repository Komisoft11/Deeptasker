import type { Lang } from './interfaces/locale.type'
import type { OtpRequestedEvent } from './events/otp-requested.event'
import type { NoticeEvent } from './events/notice.event'
import type { InvitationEvent } from './events/invitation.event'
import type { UpdatePolicyEvent } from './events/update-policy.event'
import type { FeedbackReportEvent } from './events/feedback-report.event'
import type { BugReportEvent } from './events/bug-report.event'
import { DomesticNotificationEvent } from './events/domestic-notification.event'

type NotificationEventMap = OtpRequestedEvent &
  NoticeEvent &
  InvitationEvent &
  UpdatePolicyEvent &
  FeedbackReportEvent &
  BugReportEvent &
  DomesticNotificationEvent

type RecipientType = {
  email?: string
  emails?: string[]
  phone?: string
  userId?: number
}

type SenderType = {
  userId?: number
}

export type NotificationType = keyof NotificationEventMap

export type NotificationEventType<T extends NotificationType> = {
  type: T
  recipient: RecipientType
  sender?: SenderType
  lang?: Lang
  payload: NotificationEventMap[T]
}
