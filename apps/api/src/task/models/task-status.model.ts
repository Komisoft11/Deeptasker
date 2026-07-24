import { BaseModel } from '@squareboat/nestjs-objection'
import { ProjectModel } from '../../project/models/project.model'
import { MyBaseModel } from '../../common/database/base.model'
import { AutoMap } from '@automapper/classes'

export enum SpecialTaskStatusCode {
  open = 'open',
  process = 'process',
  review = 'review',
  executed = 'executed'
}

export class TaskStatusModel extends MyBaseModel {
  static tableName = 'task_status'

  @AutoMap()
  id!: number

  projectId!: number

  @AutoMap()
  name!: string

  @AutoMap()
  order!: number

  @AutoMap()
  color: string

  @AutoMap()
  code: SpecialTaskStatusCode | string

  project?: ProjectModel

  dateDeleted?: Date

  static get modifiers() {
    return {
      notDeleted(builder) {
        builder.where(TaskStatusModel.ref('dateDeleted'), null)
      }
    }
  }

  static relationMappings = {
    project: {
      relation: BaseModel.HasOneRelation,
      modelClass: () => ProjectModel,
      join: {
        from: 'task_status.projectId',
        to: 'project.id'
      }
    }
  }
}
