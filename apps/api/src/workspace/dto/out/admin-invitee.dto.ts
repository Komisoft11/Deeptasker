import { AutoMap } from '@automapper/classes'

export class AdminInviteeDto {
  @AutoMap()
  email: string

  @AutoMap()
  senderId: number
}

export class AcceptAdminInviteDto {
  @AutoMap()
  redirectUrl: string
}
