import { BaseModel } from '@squareboat/nestjs-objection'
import { getCurrentUTCDateTime } from '../../../common/helpers/date'

export class BasePolicyModel extends BaseModel {
  id!: number

  title: string

  link: string

  version: string

  dateCreated: Date

  datePublished?: Date

  dateExpired?: Date

  public async $beforeInsert(queryContext) {
    await super.$beforeInsert(queryContext)
    this.dateCreated = getCurrentUTCDateTime()
  }
}
