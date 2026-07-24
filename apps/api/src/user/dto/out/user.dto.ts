import { AutoMap } from '@automapper/classes'

export class UserDto {
  @AutoMap()
  id: number

  @AutoMap()
  firstName: string

  @AutoMap()
  lastName: string

  @AutoMap()
  username: string

  @AutoMap()
  email: string

  @AutoMap()
  role: string

  @AutoMap()
  isActivated: boolean

  @AutoMap()
  iconBg: string

  @AutoMap()
  iconFg: string

  @AutoMap()
  dateCreated: Date

  @AutoMap()
  avatarId: number
}
