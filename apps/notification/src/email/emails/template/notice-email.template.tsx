import * as React from 'react'
import { Heading, Row, Text } from '@react-email/components'
import { TemplateProps } from '@/email/types'
import BaseEmailTemplate from '@/email/emails/template/base-email.template'

interface ChildrenAsProp {
  children?: React.ReactNode
}
interface NoticeEmailTemplateProps extends ChildrenAsProp, TemplateProps {
  title: string
  body: string
  warning: string
}

function NoticeEmailTemplate({
  children,
  locale,
  title,
  body,
  warning
}: NoticeEmailTemplateProps) {
  return (
    <BaseEmailTemplate locale={locale}>
      <Row className='pb-4'>
        <NoticeEmailTemplate.Title>{title}</NoticeEmailTemplate.Title>
        <Text className='m-0 text-[16px] leading-6 text-textSecond text-center'>
          {body}
        </Text>
        {children && children}
        <NoticeEmailTemplate.Warning>{warning}</NoticeEmailTemplate.Warning>
      </Row>
    </BaseEmailTemplate>
  )
}

NoticeEmailTemplate.Title = function ({ children }: ChildrenAsProp) {
  return (
    <Heading as='h1' className={'m-0 text-[24px] leading-[28px] pb-1'}>
      {children}
    </Heading>
  )
}

NoticeEmailTemplate.Info = function ({ children }: ChildrenAsProp) {
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

NoticeEmailTemplate.Warning = function ({ children }: ChildrenAsProp) {
  return (
    <Text className={'m-0 text-[12px] leading-4 text-textSecond text-center'}>
      {children}
    </Text>
  )
}

export default NoticeEmailTemplate

NoticeEmailTemplate.PreviewProps = {
  locale: {
    template: "You're receiving this email because of your account on",
    warning:
      'This email is automatically generated, please do not reply to it.',
    accept: 'Accept',
    decline: 'Decline',
    fallback: 'If the buttons above don’t work, use the links below:'
  }
} as NoticeEmailTemplateProps
