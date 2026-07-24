type InvitationType = {
  acceptLink: string
  declineLink: string
}

export interface InvitationEvent {
  WORKSPACE_INVITATION: InvitationType
  PROJECT_INVITATION: InvitationType
}
