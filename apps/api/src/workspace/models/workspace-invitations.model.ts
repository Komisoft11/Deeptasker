import { MyBaseModel } from '../../common/database/base.model'
import { AutoMap } from '@automapper/classes'
import { UserModel } from '../../user/models/user.model'
import { WorkspaceModel } from './workspace.model'
import { getCurrentUTCDateTime } from '../../common/helpers/date'
import { BaseModel } from '@squareboat/nestjs-objection'
import { randomUUID, UUID } from 'crypto'

const DAYS_BEFORE_EXPIRE: number = 7

export class WorkspaceInvitationsModel extends MyBaseModel {
  static tableName = 'workspace_admin_invitations'

  @AutoMap()
  id!: number

  @AutoMap()
  email!: string

  @AutoMap()
  senderId: number

  @AutoMap(() => UserModel)
  sender: UserModel

  @AutoMap()
  workspaceId: number

  @AutoMap(() => WorkspaceModel)
  workspace: WorkspaceModel

  @AutoMap()
  dateCreated: Date

  @AutoMap()
  dateExpired: Date

  token: UUID

  static get modifiers() {
    return {
      selectId(builder) {
        builder.select(WorkspaceInvitationsModel.ref('id'))
      }
    }
  }

  private getDateExpired(): Date {
    const dateExpire = getCurrentUTCDateTime()
    dateExpire.setTime(dateExpire.getTime() + DAYS_BEFORE_EXPIRE * 24 * 60 * 60 * 1000)
    return dateExpire
  }

  async $beforeInsert(queryContext) {
    await super.$beforeInsert(queryContext)
    this.token = randomUUID()
    this.dateCreated = getCurrentUTCDateTime()
    this.dateExpired = this.getDateExpired()
  }

  static relationMappings = {
    sender: {
      relation: BaseModel.HasOneRelation,
      modelClass: () => UserModel,
      join: {
        from: 'workspace_admin_invitations.senderId',
        to: 'user.id'
      }
    },

    workspace: {
      relation: BaseModel.HasOneRelation,
      modelClass: () => WorkspaceModel,
      join: {
        from: 'workspace_admin_invitations.workspaceId',
        to: 'workspace.id'
      }
    }
  }
}
