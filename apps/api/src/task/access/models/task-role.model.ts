import { MyBaseModel } from '../../../common/database/base.model'
import { UserModel } from '../../../user/models/user.model'
import { BaseModel } from '@squareboat/nestjs-objection'
import { TaskRoleCode } from '../../auth/task-access.role'
import { AutoMap } from '@automapper/classes'

export class TaskRoleModel extends MyBaseModel {
  static tableName = 'task_role'

  id!: number

  @AutoMap()
  name!: string

  @AutoMap()
  code!: TaskRoleCode

  static relationMappings = {
    users: {
      relation: BaseModel.HasManyRelation,
      modelClass: () => UserModel,
      join: {
        from: 'task_role.id',
        to: 'task_user.taskRoleId'
      }
    }
  }
}
