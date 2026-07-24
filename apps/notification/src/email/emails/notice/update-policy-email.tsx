import * as React from 'react'
import { NoticeLocale, TemplateProps, UpdatePolicyPayload } from '@/email/types'
import NoticeEmailTemplate from '@/email/emails/template/notice-email.template'
import { Link, Row, Text } from '@react-email/components'

export interface UpdatePolicyLocale extends NoticeLocale {
  effectiveDate: string
  review: string
  cta: string
  agreement: string
}

interface UpdatePolicyEmailProps extends TemplateProps {
  payload: UpdatePolicyPayload
  noticeLocale: UpdatePolicyLocale
}

export default function UpdatePolicyEmail({
  locale,
  payload,
  noticeLocale
}: UpdatePolicyEmailProps) {
  const formattedDate = new Date(payload.dateUpdated).toLocaleDateString(
    'en-GB',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }
  )

  const policyName =
    payload.policyType === 'privacyPolicy'
      ? 'Privacy Policy'
      : 'Personal Data Processing Policy'

  return (
    <NoticeEmailTemplate locale={locale} {...noticeLocale}>
      <Row className={'pb-4'}>
        <Text className='m-0 text-[16px] leading-6 text-center text-textSecond pb-1'>
          {noticeLocale.effectiveDate
            .replace('{policyName}', policyName)
            .replace('{date}', formattedDate)}
          {noticeLocale.review}
        </Text>

        <Text className='m-0 text-center'>
          <Link href={payload.policyLink} className='text-accent underline'>
            {noticeLocale.cta.replace('{policyName}', policyName)}
          </Link>
        </Text>
      </Row>
      <Row>
        <Text className='m-0 mb-[-12px] text-[12px] leading-4 text-textSecond text-center pt-4 border-t border-border mb-1'>
          {noticeLocale.agreement}
        </Text>
      </Row>
    </NoticeEmailTemplate>
  )
}

UpdatePolicyEmail.PreviewProps = {
  locale: {
    template: "You're receiving this email because of your account on",
    warning:
      'This email is automatically generated, please do not reply to it.',
    accept: 'Accept',
    decline: 'Decline',
    fallback: 'If the buttons above don’t work, use the links below:'
  },
  payload: {
    policyType: 'privacyPolicy',
    policyLink: 'https://updated-privacy-policy-link?download',
    dateUpdated: new Date('2026-03-26T08:07:10.363Z')
  },
  noticeLocale: {
    title: 'Updates to our Privacy Policy',
    body: 'We have updated our Privacy Policy to reflect recent changes.',
    warning:
      'If you do not agree with these changes, you may stop using our services at any time.',
    effectiveDate: 'The updated {policyName} will take effect on {date}.',
    review:
      'We encourage you to review the updated policy to understand how your personal data is processed.',
    cta: 'View updated {policyName}',
    agreement:
      'By continuing to use our services after this date, you agree to the updated terms.'
  }
} as UpdatePolicyEmailProps
