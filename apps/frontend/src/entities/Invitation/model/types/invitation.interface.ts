import { INotificationMessage } from '@/entities/Notifications'

export interface IAcceptOrDeclineInvitationDTO
  extends Pick<INotificationMessage, 'uuid'> {
  link: string
}
