export type { TemplateProps, TemplateOtpProps } from './template.interface'
export type {
  OtpRequestedPayload,
  EmailChangeProcessingPayload,
  EmailChangeCompletedPayload,
  PasswordChangedPayload,
  AccountDeletedPayload,
  WorkspaceInvitationPayload,
  ProjectInvitationPayload,
  UpdatePolicyPayload
} from './email-payload.type'

// locale
export type { BaseLocale } from './locales/base.type'
export type { InvitationLocale } from './locales/invitation.type'
export type { NoticeLocale } from './locales/notice.type'
export type { OtpLocale } from './locales/otp.type'
