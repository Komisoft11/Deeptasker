import { AutoMap } from '@automapper/classes'
import { IUser } from '../../events/interfaces/user.interface'

export class UserShortDto implements IUser {
  @AutoMap()
  id: number

  @AutoMap()
  firstName: string

  @AutoMap()
  lastName: string

  @AutoMap()
  username: string

  @AutoMap()
  activeTaskId?: number

  @AutoMap()
  projectRole: string

  @AutoMap()
  iconBg?: string

  @AutoMap()
  iconFg?: string

  @AutoMap()
  email?: string

  @AutoMap()
  avatarId?: number
}
