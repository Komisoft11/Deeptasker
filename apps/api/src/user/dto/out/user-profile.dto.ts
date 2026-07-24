import { AutoMap } from '@automapper/classes'

export class UserProfileDto {
  @AutoMap()
  id: number

  @AutoMap()
  username: string

  @AutoMap()
  firstName: string

  @AutoMap()
  lastName: string

  @AutoMap()
  middleName: string

  @AutoMap()
  dob: Date

  @AutoMap()
  sex: string

  @AutoMap()
  description: string

  @AutoMap()
  email: string

  @AutoMap()
  iconBg: string

  @AutoMap()
  iconFg: string

  @AutoMap()
  dateCreated: Date

  @AutoMap()
  avatarId?: number

  @AutoMap()
  isActivated: boolean
}
