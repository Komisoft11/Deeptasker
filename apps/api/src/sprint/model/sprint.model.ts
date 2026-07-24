import { MyBaseModel } from '../../common/database/base.model'
import { AutoMap } from '@automapper/classes'
import { QueryContext } from 'objection'
import { getCurrentUTCDateTime } from '../../common/helpers/date'
import { BaseModel } from '@squareboat/nestjs-objection'
import { type UserModel as UserModelType, UserModel } from '../../user/models/user.model'
import { ProjectModel } from '../../project/models/project.model'
import { type TaskModel as TaskModelType, TaskModel } from '../../task/models/task.model'

export enum SprintStatuses {
  Planned = 'planned',
  Active = 'active',
  Completed = 'completed'
}

export class SprintModel extends MyBaseModel {
  static tableName = 'sprint'

  @AutoMap()
  id!: number

  @AutoMap()
  title: string

  @AutoMap()
  description?: string

  userId!: number

  @AutoMap(() => UserModel)
  user: UserModelType

  @AutoMap()
  projectId!: number

  @AutoMap()
  status!: SprintStatuses

  @AutoMap()
  dateCreated: Date

  @AutoMap()
  dateUpdated?: Date

  @AutoMap()
  dateDeleted?: Date

  @AutoMap()
  dateStart: Date

  @AutoMap()
  dateEnd: Date

  @AutoMap(() => [TaskModel])
  tasks: TaskModelType[]

  project!: ProjectModel

  static get modifiers() {
    return {
      selectId(builder) {
        builder.select(SprintModel.ref('id'))
      },
      notDeleted(builder) {
        builder.where(SprintModel.ref('dateDeleted'), null)
      }
    }
  }

  async $afterFind() {
    await SprintModel.query()
      .where('dateEnd', '<', getCurrentUTCDateTime())
      .andWhere('status', '!=', SprintStatuses.Completed)
      .patch({ status: SprintStatuses.Completed })
  }

  async $beforeInsert(queryContext: QueryContext) {
    await super.$beforeInsert(queryContext)
    this.dateCreated = getCurrentUTCDateTime()
  }

  async $beforeUpdate(opt, queryContext: QueryContext) {
    await super.$beforeUpdate(opt, queryContext)
    this.dateUpdated = getCurrentUTCDateTime()
  }

  static relationMappings = {
    user: {
      relation: BaseModel.HasOneRelation,
      modelClass: () => UserModel,
      join: {
        from: 'sprint.userId',
        to: 'user.id'
      }
    },

    project: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: () => ProjectModel,
      join: {
        from: 'sprint.projectId',
        to: 'project.id'
      }
    },

    tasks: {
      relation: BaseModel.HasManyRelation,
      modelClass: () => TaskModel,
      join: {
        from: 'sprint.id',
        to: 'task.sprintId'
      }
    }
  }
}
