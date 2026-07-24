export interface IInviteeEvent {
  type: 'add' | 'remove'
  email: string
  senderId?: number
}
