import { BaseModel } from '@squareboat/nestjs-objection'
import { AutoMap } from '@automapper/classes'
import { MyBaseModel } from '../../common/database/base.model'
import { type UserModel as UserModelType, UserModel } from '../../user/models/user.model'
import { getCurrentUTCDateTime } from '../../common/helpers/date'
import { hash } from '../../auth/utilities/password'

export enum VerificationType {
  Registration = 'registration',
  PasswordReset = 'password_reset',
  EmailChange = 'email_change',
  DeleteUser = 'delete_user'
}

const TIME_BEFORE_CODES_EXPIRE = {
  [VerificationType.Registration]: 2 * 60 * 60 * 1000, // 2hrs
  [VerificationType.PasswordReset]: 2 * 60 * 1000, // 2min
  [VerificationType.EmailChange]: 24 * 60 * 60 * 1000, // 1day
  [VerificationType.DeleteUser]: 2 * 60 * 1000 // 2min
}

export class VerificationModel extends MyBaseModel {
  static tableName = 'verification'

  @AutoMap()
  id!: number

  @AutoMap()
  userId!: number

  @AutoMap()
  code: string

  @AutoMap()
  dateExpire: Date

  @AutoMap()
  dateCreated: Date

  @AutoMap()
  type: VerificationType

  @AutoMap(() => UserModel)
  user: UserModelType

  private async setCode(code: string) {
    this.code = await hash(code)
  }

  private getDateExpire(type: VerificationType) {
    const dateExpire = getCurrentUTCDateTime()
    dateExpire.setTime(dateExpire.getTime() + TIME_BEFORE_CODES_EXPIRE[type])
    return dateExpire
  }

  async $beforeInsert(queryContext) {
    await super.$beforeInsert(queryContext)
    await this.setCode(this.code)
    this.dateCreated = getCurrentUTCDateTime()
    this.dateExpire = this.getDateExpire(this.type)
  }

  static relationMappings = {
    user: {
      relation: BaseModel.HasOneRelation,
      modelClass: () => UserModel,
      join: {
        from: 'verification.userId',
        to: 'user.id'
      }
    }
  }
}
