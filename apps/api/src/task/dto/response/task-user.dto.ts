import { AutoMap } from '@automapper/classes'
import { TaskRoleResponse } from './task-role.dto'
import { UserShortDto } from '../../../common/dto/user-short.dto'

export class TaskUserResponse {
  @AutoMap(() => UserShortDto)
  user: UserShortDto

  @AutoMap(() => TaskRoleResponse)
  role: TaskRoleResponse
}
