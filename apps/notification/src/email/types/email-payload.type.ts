import type { NotificationEventType } from '../../types'

export type OtpRequestedPayload =
  NotificationEventType<'OTP_REQUESTED'>['payload']

export type EmailChangeProcessingPayload =
  NotificationEventType<'EMAIL_CHANGE_PROCESSING'>['payload']

export type EmailChangeCompletedPayload =
  NotificationEventType<'EMAIL_CHANGE_COMPLETED'>['payload']

export type PasswordChangedPayload =
  NotificationEventType<'PASSWORD_CHANGED'>['payload']

export type AccountDeletedPayload =
  NotificationEventType<'ACCOUNT_DELETED'>['payload']

export type WorkspaceInvitationPayload =
  NotificationEventType<'WORKSPACE_INVITATION'>['payload']

export type ProjectInvitationPayload =
  NotificationEventType<'PROJECT_INVITATION'>['payload']

export type UpdatePolicyPayload =
  NotificationEventType<'UPDATE_POLICY'>['payload']
