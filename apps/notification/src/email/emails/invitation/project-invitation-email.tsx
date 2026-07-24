import InvitationEmailTemplate from '@/email/emails/template/invitation-email.template'
import { InvitationLocale, TemplateProps } from '@/email/types'
import * as React from 'react'

interface ProjectInvitationEmailProps extends TemplateProps {
  acceptLink: string
  declineLink: string
  invitationLocale: InvitationLocale
}

export default function ProjectInvitationEmail({
  locale,
  invitationLocale,
  acceptLink,
  declineLink
}: ProjectInvitationEmailProps) {
  return (
    <InvitationEmailTemplate
      locale={locale}
      acceptLink={acceptLink}
      declineLink={declineLink}
      {...invitationLocale}
    />
  )
}

ProjectInvitationEmail.PreviewProps = {
  acceptLink:
    'test.deeptasker.net/workspaces/2/projects/accept-invitation/fa13795a-8e25-4d31-9907-e2185cbb1a2e',
  declineLink:
    'test.deeptasker.net/workspaces/2/projects/decline-invitation/fa13795a-8e25-4d31-9907-e2185cbb1a2e',
  locale: {
    template: "You're receiving this email because of your account on",
    warning:
      'This email is automatically generated, please do not reply to it.',
    accept: 'Accept',
    decline: 'Decline',
    fallback: 'If the buttons above don’t work, use the links below:'
  },
  invitationLocale: {
    title: "You've been invited to a project!",
    body: 'Someone invited you to join their project on'
  }
} as ProjectInvitationEmailProps
