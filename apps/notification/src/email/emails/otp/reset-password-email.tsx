import * as React from 'react'
import OtpEmailTemplate from '@/email/emails/template/otp-email.template'
import type { TemplateOtpProps } from '@/email/types/template.interface'
import { OtpLocale } from '@/email/types'

interface ResetPasswordEmailProps extends TemplateOtpProps {
  otpLocale: OtpLocale
}

export default function ResetPasswordEmail({
  otp,
  locale,
  otpLocale
}: ResetPasswordEmailProps) {
  return <OtpEmailTemplate locale={locale} otp={otp} {...otpLocale} />
}

ResetPasswordEmail.PreviewProps = {
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
    title: 'Password Reset',
    body: 'We received a request to reset the password for your account. Enter the code below on the password reset page.',
    expires: 'This password reset code is valid for 2 hours.',
    warning:
      'If you did not request a password reset, you can safely ignore this email.'
  }
} as ResetPasswordEmailProps
