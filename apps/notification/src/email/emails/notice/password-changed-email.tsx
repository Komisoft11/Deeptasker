import * as React from 'react'
import { TemplateProps } from '@/email/types/template.interface'
import NoticeEmailTemplate from '@/email/emails/template/notice-email.template'
import { NoticeLocale } from '@/email/types'

interface PasswordChangedEmailProps extends TemplateProps {
  noticeLocale: NoticeLocale
}

export default function PasswordChangedEmail({
  locale,
  noticeLocale
}: PasswordChangedEmailProps) {
  return <NoticeEmailTemplate locale={locale} {...noticeLocale} />
}

PasswordChangedEmail.PreviewProps = {
  locale: {
    template: "You're receiving this email because of your account on",
    warning:
      'This email is automatically generated, please do not reply to it.',
    accept: 'Accept',
    decline: 'Decline',
    fallback: 'If the buttons above don’t work, use the links below:'
  },
  noticeLocale: {
    title: 'Your password was changed',
    body: 'This is a confirmation that your account password was changed successfully.',
    warning:
      "If you didn't request this action or believe this was a mistake, please contact our support team as soon as possible."
  }
} as PasswordChangedEmailProps
