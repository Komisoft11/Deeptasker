import {
  Body,
  Container,
  Html,
  Img,
  Link,
  Row,
  Text
} from '@react-email/components'
import * as React from 'react'
import { TemplateProps } from '@/email/types'
import { Tailwind } from '@react-email/tailwind'
import { serverUrl } from '@/const/url'
import tailwindConfig from '@/tailwind'

interface BaseEmailTemplateProps extends TemplateProps {
  children: React.ReactNode
}
export default function BaseEmailTemplate({
  locale,
  children
}: BaseEmailTemplateProps) {
  return (
    <Tailwind config={tailwindConfig}>
      <Html className={'font-inter'}>
        <Body className={'bg-bg m-0 px-6 py-0 text-center'}>
          <Container className={'max-w-[560px] mx-auto my-0 py-6 '}>
            <Img
              src={''}
              alt='DT-Logo'
              width='64'
              height='64'
              className={'mx-auto'}
            />
          </Container>
          <Container
            className={
              'max-w-[560px] p-6 bg-objects rounded-lg border border-border'
            }
          >
            {children}
          </Container>
          <Container
            className={
              'max-w-[560px] items-center justify-center text-textSecond p-6'
            }
          >
            <Row className={'pb-2'}>
              <Text className={'m-0 text-[12px] leading-4 text-center'}>
                {locale.template}
                <Link href={serverUrl} className={'pl-1'}>
                  deeptasker.net
                </Link>
                .
              </Text>

              <Text className={'m-0 text-[12px] leading-4 text-center'}>
                {locale.warning}
              </Text>
            </Row>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  )
}

BaseEmailTemplate.PreviewProps = {
  locale: {
    template: "You're receiving this email because of your account on",
    warning: 'This email is automatically generated, please do not reply to it.'
  }
}
