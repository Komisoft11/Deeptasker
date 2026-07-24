import * as React from 'react'
import OtpEmailTemplate from '@/email/emails/template/otp-email.template'
import type { TemplateOtpProps } from '@/email/types/template.interface'
import { OtpLocale } from '@/email/types'

interface DeleteAccountEmail extends TemplateOtpProps {
  otpLocale: OtpLocale
}

export default function DeleteAccountEmail({
  otp,
  locale,
  otpLocale
}: DeleteAccountEmail) {
  return <OtpEmailTemplate locale={locale} otp={otp} {...otpLocale} />
}

DeleteAccountEmail.PreviewProps = {
  otp: '023567',
  locale: {
    template: "You're receiving this email because of your account on",
    warning:
      'This email is automatically generated, please do not reply to it.',
    accept: 'Accept',
    decline: 'Decline',
    fallback: 'If the buttons above don’t work, use the links below:'
  },
  otpLocale: {
    title: 'Confirm account deletion',
    body: 'To confirm the deletion of your account, please enter the verification code below',
    expires: 'This confirmation code is valid for 2 hours.',
    warning:
      'If you did not request this change, we recommend checking the security of your account immediately.'
  }
} as DeleteAccountEmail
