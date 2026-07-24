import { MyBaseModel } from '../../common/database/base.model'
import { AutoMap } from '@automapper/classes'
import { UserModel } from '../../user/models/user.model'
import { getCurrentUTCDateTime } from '../../common/helpers/date'
import { BaseModel } from '@squareboat/nestjs-objection'
import { ProjectModel } from './project.model'
import { WorkspaceModel } from '../../workspace/models/workspace.model'
import { randomUUID, UUID } from 'crypto'
import { ProjectRoleType } from '../components/permissions/types/roles/project-role.interface'

const DAYS_BEFORE_EXPIRE: number = 7

export class ProjectInvitationsModel extends MyBaseModel {
  static tableName = 'project_member_invitations'

  @AutoMap()
  id!: number

  @AutoMap()
  email!: string

  @AutoMap()
  senderId: number

  @AutoMap(() => UserModel)
  sender: UserModel

  @AutoMap()
  projectId: number

  @AutoMap(() => ProjectModel)
  project: ProjectModel

  @AutoMap()
  dateCreated: Date

  @AutoMap()
  dateExpired: Date

  @AutoMap()
  role: ProjectRoleType

  token: UUID

  static get modifiers() {
    return {
      selectId(builder) {
        builder.select(ProjectInvitationsModel.ref('id'))
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
        from: 'project_member_invitations.senderId',
        to: 'user.id'
      }
    },

    workspace: {
      relation: BaseModel.HasOneRelation,
      modelClass: () => WorkspaceModel,
      join: {
        from: 'project_member_invitations.workspaceId',
        to: 'workspace.id'
      }
    }
  }
}
