import { BaseModel } from '@squareboat/nestjs-objection'
import { AutoMap } from '@automapper/classes'
import { ModelOptions, QueryContext } from 'objection'
import { getCurrentUTCDateTime } from '../../common/helpers/date'
import { FileModel } from '../../file/models/file.model'
import { ProjectModel } from '../../project/models/project.model'
import { UUID } from 'crypto'

export enum ReportStatus {
  Pending = 'pending',
  InProgress = 'in_progress',
  Completed = 'completed',
  Error = 'error'
}

export class ReportModel extends BaseModel {
  static tableName = 'report'

  @AutoMap()
  id: number

  @AutoMap()
  uuid: string | UUID

  @AutoMap()
  title: string

  @AutoMap()
  projectId: number

  @AutoMap()
  fileId: number

  @AutoMap()
  userId: number

  @AutoMap()
  dateCreated: Date

  @AutoMap()
  dateCompleted: Date

  @AutoMap()
  status: ReportStatus

  @AutoMap()
  error: string

  @AutoMap()
  periodStart: Date

  @AutoMap()
  periodEnd: Date

  file?: FileModel

  project?: FileModel

  async $beforeInsert(queryContext: QueryContext) {
    await super.$beforeInsert(queryContext)
    this.dateCreated = getCurrentUTCDateTime()
  }

  async $beforeUpdate(opt: ModelOptions, queryContext: QueryContext) {
    await super.$beforeUpdate(opt, queryContext)
    if (this.status === ReportStatus.Completed && !this.dateCompleted) {
      this.dateCompleted = getCurrentUTCDateTime()
    }
  }

  static relationMappings = {
    project: {
      relation: BaseModel.HasOneRelation,
      modelClass: () => ProjectModel,
      join: {
        from: 'report.projectId',
        to: 'project.id'
      }
    },
    file: {
      relation: BaseModel.HasOneRelation,
      modelClass: () => FileModel,
      join: {
        from: 'report.fileId',
        to: 'file.id'
      }
    }
  }
}
