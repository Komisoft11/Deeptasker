import { MyBaseModel } from '../../common/database/base.model'
import { BaseModel } from '@squareboat/nestjs-objection'
import { UserModel } from './user.model'

export class PendingEmailUpdatesModel extends MyBaseModel {
  static tableName = 'pending_email_updates'

  id!: number

  userId: number

  user: UserModel

  email: string

  static relationMappings = {
    user: {
      relation: BaseModel.HasOneRelation,
      modelClass: () => UserModel,
      join: {
        from: 'pending_email_updates.userId',
        to: 'user.id'
      }
    }
  }
}
