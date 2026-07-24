import { AutoMap } from '@automapper/classes'

export class MemberInvitationDto {
  @AutoMap()
  email: string

  @AutoMap()
  senderId: number
}

export class AcceptMemberInviteDto {
  @AutoMap()
  redirectUrl: string
}
