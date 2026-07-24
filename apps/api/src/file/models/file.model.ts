import { BaseModel } from '@squareboat/nestjs-objection'
import { AutoMap } from '@automapper/classes'
import { getCurrentUTCDateTime } from '../../common/helpers/date'
import { TaskModel } from '../../task/models/task.model'
import { MyBaseModel } from '../../common/database/base.model'
import { UserModel } from '../../user/models/user.model'

export class FileModel extends MyBaseModel {
  static tableName = 'file'

  @AutoMap()
  id: number

  @AutoMap()
  filePath: string

  @AutoMap()
  originalName: string

  @AutoMap()
  userId: number

  @AutoMap()
  size: number

  @AutoMap()
  dateCreated: Date

  @AutoMap(() => TaskModel)
  task?: TaskModel

  @AutoMap(() => UserModel)
  user?: UserModel

  async $beforeInsert(queryContext) {
    await super.$beforeInsert(queryContext)
    this.dateCreated = getCurrentUTCDateTime()
  }

  static relationMappings = {
    task: {
      relation: BaseModel.HasOneThroughRelation,
      modelClass: () => TaskModel,
      join: {
        from: 'file.id',
        through: {
          from: 'task_file.fileId',
          to: 'task_file.taskId'
        },
        to: 'task.id'
      }
    },

    user: {
      relation: BaseModel.HasOneRelation,
      modelClass: () => UserModel,
      join: {
        from: 'file.userId',
        to: 'user.id'
      }
    }
  }
}
