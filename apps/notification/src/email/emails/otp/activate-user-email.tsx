import * as React from 'react'
import OtpEmailTemplate from '@/email/emails/template/otp-email.template'
import type { TemplateOtpProps } from '@/email/types/template.interface'
import { OtpLocale } from '@/email/types'

interface ActivateUserEmailProps extends TemplateOtpProps {
  otpLocale: OtpLocale
}

export default function ActivateUserEmail({
  otp,
  locale,
  otpLocale
}: ActivateUserEmailProps) {
  return <OtpEmailTemplate otp={otp} locale={locale} {...otpLocale} />
}

ActivateUserEmail.PreviewProps = {
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
    title: 'Activation Code',
    body: 'Before logging in, we need to confirm your identity. Please enter the code below on the signup page.',
    expires: 'Your verification code expires in 2 hours.',
    warning:
      'If you did not request this action, you can safely ignore this email.'
  }
} as ActivateUserEmailProps
