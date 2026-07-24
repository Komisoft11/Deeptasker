import { AutoMap } from '@automapper/classes'
import { MyBaseModel } from '../../../common/database/base.model'
import { getCurrentUTCDateTime } from '../../../common/helpers/date'
import { BaseModel } from '@squareboat/nestjs-objection'
import { UserModel } from '../../../user/models/user.model'
import { type TaskModel as TaskModelType, TaskModel } from '../../models/task.model'

export class TaskTimerModel extends MyBaseModel {
  static tableName = 'task_timer'

  @AutoMap()
  id: number

  @AutoMap()
  taskId: number

  @AutoMap()
  userId: number

  @AutoMap()
  seconds: number

  @AutoMap()
  dateCreated: Date

  @AutoMap()
  dateUpdated?: Date

  task?: TaskModelType

  user?: UserModel

  async $beforeInsert(queryContext) {
    await super.$beforeInsert(queryContext)
    this.dateCreated = getCurrentUTCDateTime()
  }

  async $beforeUpdate(opt, queryContext) {
    await super.$beforeUpdate(opt, queryContext)
    this.dateUpdated = getCurrentUTCDateTime()
  }

  static get modifiers() {
    return {
      seconds(builder) {
        builder.select(TaskTimerModel.ref('seconds'))
      },
      userId(builder) {
        builder.select(TaskTimerModel.ref('userId'))
      }
    }
  }

  static relationMappings = {
    user: {
      relation: BaseModel.HasOneRelation,
      modelClass: () => UserModel,
      join: {
        from: 'task_timer.userId',
        to: 'user.id'
      }
    },

    task: {
      relation: BaseModel.HasOneRelation,
      modelClass: () => TaskModel,
      join: {
        from: 'task_timer.taskId',
        to: 'task.id'
      }
    }
  }
}
