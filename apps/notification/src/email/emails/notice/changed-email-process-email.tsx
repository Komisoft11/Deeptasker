import * as React from 'react'
import { TemplateProps } from '@/email/types/template.interface'
import NoticeEmailTemplate from '@/email/emails/template/notice-email.template'
import { NoticeLocale } from '@/email/types'

interface ChangedEmailProcessEmailProps extends TemplateProps {
  newEmail: string
  noticeLocale: NoticeLocale & { explanation: string }
}

export default function ChangedEmailProcessEmail({
  locale,
  newEmail,
  noticeLocale
}: ChangedEmailProcessEmailProps) {
  return (
    <NoticeEmailTemplate locale={locale} {...noticeLocale}>
      <NoticeEmailTemplate.Info>{newEmail}</NoticeEmailTemplate.Info>
    </NoticeEmailTemplate>
  )
}

ChangedEmailProcessEmail.PreviewProps = {
  locale: {
    template: "You're receiving this email because of your account on",
    warning:
      'This email is automatically generated, please do not reply to it.',
    accept: 'Accept',
    decline: 'Decline',
    fallback: 'If the buttons above don’t work, use the links below:'
  },
  newEmail: 'skrgjoirjgodijrgoidrjgoji@sigjoigjd.com',
  noticeLocale: {
    title: 'Your email is being changed',
    explanation:
      "We've received a request to change the email address associated with your account.",
    body: 'New email address:',
    warning:
      "If you didn't request this action or believe this was a mistake, please contact our support team as soon as possible."
  }
} as ChangedEmailProcessEmailProps
