import * as React from 'react'
import { Column, Heading, Link, Row, Text } from '@react-email/components'
import type { TemplateProps } from '@/email/types'
import BaseEmailTemplate from '@/email/emails/template/base-email.template'
import { serverUrl } from '@/const/url'

interface ChildrenAsProp {
  children?: React.ReactNode
}

interface InvitationEmailTemplateProps extends TemplateProps {
  acceptLink: string
  declineLink: string
  title: string
  body: string
  withLink?: boolean
}

function InvitationEmailTemplate({
  acceptLink,
  declineLink,
  locale,
  title,
  body,
  withLink = true
}: InvitationEmailTemplateProps) {
  return (
    <BaseEmailTemplate locale={locale}>
      <Row className={'pb-4'}>
        <InvitationEmailTemplate.Title>{title}</InvitationEmailTemplate.Title>
        <InvitationEmailTemplate.Body>
          {body}
          {withLink && (
            <Link href={serverUrl} className={'pl-1 text-accent'}>
              deeptasker.net
            </Link>
          )}
        </InvitationEmailTemplate.Body>
      </Row>

      <Row className={'h-10 w-full pb-6 mx-auto'}>
        <Column className={'h-10 w-max pr-1'}>
          <Link
            href={declineLink}
            className={
              'block w-[185px] py-3 rounded-lg border border-accent text-[14px] leading-4 text-accent ml-auto'
            }
          >
            {locale.decline}
          </Link>
        </Column>
        <Column className={'h-max w-max pl-1'}>
          <Link
            href={acceptLink}
            className={
              'block w-[185px] py-3 bg-accent text-activeText rounded-lg text-[14px] leading-4'
            }
          >
            {locale.accept}
          </Link>
        </Column>
      </Row>
      <Row className={'pt-6 border-t border-border'}>
        <Row>
          <p
            className={
              'm-0 text-textSecond text-[14px] leading-4 text-center pb-6'
            }
          >
            {locale.fallback}
          </p>
        </Row>
        <Row>
          <p
            className={
              'text-textSecond text-[14px] leading-4 m-0 text-left pb-4'
            }
          >
            {locale.accept}:<span className={'block mt-1'}>{acceptLink}</span>
          </p>
        </Row>

        <Row>
          <p className={'text-textSecond text-[14px] leading-4 m-0 text-left'}>
            {locale.decline}:<span className={'block mt-1'}>{declineLink}</span>
          </p>
        </Row>
      </Row>
    </BaseEmailTemplate>
  )
}

InvitationEmailTemplate.Title = function ({ children }: ChildrenAsProp) {
  return (
    <Heading as='h1' className={'m-0 text-[24px] leading-[28px] pb-1'}>
      {children}
    </Heading>
  )
}

InvitationEmailTemplate.Body = function ({ children }: ChildrenAsProp) {
  return <Text className={'m-0 text-[14px] leading-5'}>{children}</Text>
}

export default InvitationEmailTemplate

InvitationEmailTemplate.PreviewProps = {
  acceptLink: 'https://google.com',
  declineLink: 'https://google.com',
  locale: {
    template: "You're receiving this email because of your account on",
    warning:
      'This email is automatically generated, please do not reply to it.',
    accept: 'Accept',
    decline: 'Decline',
    fallback: 'If the buttons above don’t work, use the links below:'
  }
}
