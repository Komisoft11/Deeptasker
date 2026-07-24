import * as React from 'react'
import OtpEmailTemplate from '@/email/emails/template/otp-email.template'
import type { TemplateOtpProps } from '@/email/types/template.interface'
import { OtpLocale } from '@/email/types'

interface ChangeEmailEmailProps extends TemplateOtpProps {
  otpLocale: OtpLocale
}

export default function ChangeEmailEmail({
  otp,
  locale,
  otpLocale
}: ChangeEmailEmailProps) {
  return <OtpEmailTemplate locale={locale} otp={otp} {...otpLocale} />
}

ChangeEmailEmail.PreviewProps = {
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
    title: 'Confirm Email Change',
    body: 'You requested to change the email address for your account. Enter the code below on the email change page to confirm this action.',
    expires: 'This confirmation code is valid for 2 hours.',
    warning:
      'If you did not request this change, we recommend checking the security of your account immediately.'
  }
} as ChangeEmailEmailProps
