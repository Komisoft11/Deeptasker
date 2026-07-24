import { AutoMap } from '@automapper/classes'

export class UserSearchDto {
  @AutoMap()
  id: number

  @AutoMap()
  username: string

  @AutoMap()
  firstName: string

  @AutoMap()
  lastName: string

  @AutoMap()
  iconFg: string

  @AutoMap()
  iconBg: string

  @AutoMap()
  avatarId: number

  @AutoMap()
  email: string
}
