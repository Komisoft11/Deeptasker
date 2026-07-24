import type { InvitationLocale, TemplateProps } from '@/email/types'
import InvitationEmailTemplate from '@/email/emails/template/invitation-email.template'
import * as React from 'react'

interface WorkspaceInvitationEmailProps extends TemplateProps {
  acceptLink: string
  declineLink: string
  invitationLocale: InvitationLocale
}

export default async function WorkspaceInvitationEmail({
  locale,
  invitationLocale,
  acceptLink,
  declineLink
}: WorkspaceInvitationEmailProps) {
  return (
    <InvitationEmailTemplate
      locale={locale}
      acceptLink={acceptLink}
      declineLink={declineLink}
      {...invitationLocale}
    />
  )
}

WorkspaceInvitationEmail.PreviewProps = {
  acceptLink:
    'test.deeptasker.net/workspaces/accept-invitation/fa13795a-8e25-4d31-9907-e2185cbb1a2e',
  declineLink:
    'test.deeptasker.net/workspaces/decline-invitation/fa13795a-8e25-4d31-9907-e2185cbb1a2e',
  locale: {
    template: "You're receiving this email because of your account on",
    warning:
      'This email is automatically generated, please do not reply to it.',
    accept: 'Accept',
    decline: 'Decline',
    fallback: 'If the buttons above don’t work, use the links below:'
  },
  invitationLocale: {
    title: "You've been invited to a workspace!",
    body: 'Someone invited you to join their workspace on '
  }
} as WorkspaceInvitationEmailProps
