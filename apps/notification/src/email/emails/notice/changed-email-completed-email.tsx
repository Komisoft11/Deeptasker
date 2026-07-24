import * as React from 'react'
import { TemplateProps } from '@/email/types/template.interface'
import NoticeEmailTemplate from '@/email/emails/template/notice-email.template'
import { NoticeLocale } from '@/email/types'

interface ChangedEmailCompletedEmailProps extends TemplateProps {
  newEmail: string
  noticeLocale: NoticeLocale
}

export default function ChangedEmailCompletedEmail({
  locale,
  newEmail,
  noticeLocale
}: ChangedEmailCompletedEmailProps) {
  return (
    <NoticeEmailTemplate locale={locale} {...noticeLocale}>
      <NoticeEmailTemplate.Info>{newEmail}</NoticeEmailTemplate.Info>
    </NoticeEmailTemplate>
  )
}

ChangedEmailCompletedEmail.PreviewProps = {
  locale: {
    template: "You're receiving this email because of your account on",
    warning:
      'This email is automatically generated, please do not reply to it.',
    accept: 'Accept',
    decline: 'Decline',
    fallback: 'If the buttons above don’t work, use the links below:'
  },
  newEmail: 'skrgjoirjgodijrgoidrjgojsjeufhoifoeijfosiejfosefjoi@sigjoigjd.com',
  noticeLocale: {
    title: 'Your email address was updated',
    body: 'Your account is now linked to the new email address:',
    warning:
      "If you didn't request this action or believe this was a mistake, please contact our support team as soon as possible."
  }
} as ChangedEmailCompletedEmailProps
