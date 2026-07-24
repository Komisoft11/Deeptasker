import { AutoMap } from '@automapper/classes'
import { TaskRoleCode } from '../../auth/task-access.role'

export class TaskRoleResponse {
  @AutoMap()
  name: TaskRoleCode

  @AutoMap()
  code: string
}
