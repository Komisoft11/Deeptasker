import * as React from 'react'
import { TemplateProps } from '@/email/types/template.interface'
import NoticeEmailTemplate from '@/email/emails/template/notice-email.template'
import { NoticeLocale } from '@/email/types'

interface DeleteAccountEmailProps extends TemplateProps {
  noticeLocale: NoticeLocale
}

export default function DeleteAccountEmail({
  noticeLocale,
  locale
}: DeleteAccountEmailProps) {
  return <NoticeEmailTemplate {...noticeLocale} locale={locale} />
}

DeleteAccountEmail.PreviewProps = {
  locale: {
    template: "You're receiving this email because of your account on",
    warning:
      'This email is automatically generated, please do not reply to it.',
    accept: 'Accept',
    decline: 'Decline',
    fallback: 'If the buttons above don’t work, use the links below:'
  },
  noticeLocale: {
    title: 'Your account has been deleted',
    body: 'This is a confirmation that your account has been permanently deleted.',
    warning:
      "If you didn't request this action or believe this was a mistake, please contact our support team as soon as possible."
  }
} as DeleteAccountEmailProps
