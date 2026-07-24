import BaseEmailTemplate from '@/email/emails/template/base-email.template'
import { Heading, Row, Text } from '@react-email/components'
import * as React from 'react'
import type { TemplateProps } from '@/email/types/template.interface'

interface OtpEmailTemplateProps extends TemplateProps {
  title: string
  body: string
  otp: string
  expires: string
  warning: string
}

function OtpEmailTemplate({
  locale,
  title,
  body,
  otp,
  expires,
  warning
}: OtpEmailTemplateProps) {
  return (
    <BaseEmailTemplate locale={locale}>
      <Row>
        <OtpEmailTemplate.Title>{title}</OtpEmailTemplate.Title>
        <OtpEmailTemplate.Body>{body}</OtpEmailTemplate.Body>
      </Row>
      <OtpEmailTemplate.OTP>{otp}</OtpEmailTemplate.OTP>
      <Row>
        <OtpEmailTemplate.Expires>{expires}</OtpEmailTemplate.Expires>
        <OtpEmailTemplate.Warning>{warning}</OtpEmailTemplate.Warning>
      </Row>
    </BaseEmailTemplate>
  )
}

OtpEmailTemplate.Title = function ({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <Heading as='h1' className={'m-0 text-[24px] leading-[28px] pb-1'}>
      {children}
    </Heading>
  )
}

OtpEmailTemplate.Body = function ({ children }: { children: React.ReactNode }) {
  return <Text className={'m-0 text-[16px] leading-6'}>{children}</Text>
}

OtpEmailTemplate.OTP = function ({ children }: { children: React.ReactNode }) {
  return (
    <Text
      className={
        'bg-bg p-3 text-[20px] leading-6 color-textMain max-w-[70%] w-full border border-border rounded-lg mx-auto break-all'
      }
    >
      {children}
    </Text>
  )
}

OtpEmailTemplate.Expires = function ({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <Text className={'text-[12px] leading-4 text-textSecond m-0 pb-1'}>
      {children}
    </Text>
  )
}

OtpEmailTemplate.Warning = function ({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <Text className={'text-[12px] leading-4 text-textSecond m-0'}>
      {children}
    </Text>
  )
}

export default OtpEmailTemplate

OtpEmailTemplate.PreviewProps = {
  locale: {
    template: "You're receiving this email because of your account on",
    warning:
      'This email is automatically generated, please do not reply to it.',
    accept: 'Accept',
    decline: 'Decline',
    fallback: 'If the buttons above don’t work, use the links below:'
  }
}
