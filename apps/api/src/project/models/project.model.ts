import { BaseModel } from '@squareboat/nestjs-objection'
import { AutoMap } from '@automapper/classes'
import { getCurrentUTCDateTime } from '../../common/helpers/date'
import { TaskModel } from '../../task/models/task.model'
import { MyBaseModel } from '../../common/database/base.model'
import type { UserModel as UserModelType } from '../../user/models/user.model'
import { UserModel } from '../../user/models/user.model'
import { randomUUID } from 'crypto'
import { TaskStatusModel } from '../../task/models/task-status.model'
import { TagModel } from '../../task/tag/models/tag.model'
import type { WorkspaceModel as WorkspaceModelType } from '../../workspace/models/workspace.model'
import { WorkspaceModel } from '../../workspace/models/workspace.model'
import { ICreatedRecord } from '../../common/interfaces/created-record.interface'
import { ProjectPermissionsModel } from './project-permissions.model'
import { ProjectSettingsModel } from './project-settings.model'
import { FolderModel } from '../../folder/model/folder.model'

export interface IProjectWithWorkspace extends ICreatedRecord {
  id: number
  workspaceId: number
}

export class ProjectModel extends MyBaseModel implements IProjectWithWorkspace {
  static tableName = 'project'

  static get virtualAttributes() {
    return ['taskCount']
  }

  @AutoMap()
  id!: number

  @AutoMap()
  uuid!: string

  @AutoMap()
  title: string

  @AutoMap()
  userId: number

  @AutoMap()
  slug: string

  @AutoMap()
  workspaceId: number

  @AutoMap()
  iconBg: string

  @AutoMap()
  iconFg: string

  @AutoMap()
  order?: number

  @AutoMap()
  isReviewRequired: boolean

  @AutoMap(() => [UserModel])
  members?: UserModelType[]

  @AutoMap(() => UserModel)
  user?: UserModelType

  @AutoMap(() => WorkspaceModel)
  workspace: WorkspaceModelType

  @AutoMap(() => [TaskStatusModel])
  statuses?: TaskStatusModel[]

  @AutoMap(() => [TagModel])
  tags?: TagModel[]

  @AutoMap(() => ProjectSettingsModel)
  settings: ProjectSettingsModel

  @AutoMap()
  dateCreated: Date

  @AutoMap()
  dateArchived: Date

  dateUpdated: Date

  dateDeleted: Date

  static get modifiers() {
    return {
      selectShort(builder) {
        builder.select(ProjectModel.ref('id'), ProjectModel.ref('title'))
      },
      notDeleted(builder) {
        builder.where(ProjectModel.ref('dateDeleted'), null)
      }
    }
  }

  async $beforeInsert(queryContext) {
    await super.$beforeInsert(queryContext)
    this.dateCreated = getCurrentUTCDateTime()
    this.uuid = randomUUID()
  }

  async $beforeUpdate(opt, queryContext) {
    await super.$beforeUpdate(opt, queryContext)

    this.dateUpdated = getCurrentUTCDateTime()
  }

  static relationMappings = {
    user: {
      relation: BaseModel.HasOneRelation,
      modelClass: () => UserModel,
      join: {
        from: 'project.userId',
        to: 'user.id'
      }
    },

    workspace: {
      relation: BaseModel.HasOneRelation,
      modelClass: () => WorkspaceModel,
      join: {
        from: 'project.workspaceId',
        to: 'workspace.id'
      }
    },

    tasks: {
      relation: BaseModel.HasManyRelation,
      modelClass: () => TaskModel,
      join: {
        from: 'project.id',
        to: 'task.projectId'
      }
    },

    folders: {
      relation: BaseModel.HasManyRelation,
      modelClass: () => FolderModel,
      join: {
        from: 'project.id',
        to: 'folder.projectId'
      }
    },

    statuses: {
      relation: BaseModel.HasManyRelation,
      modelClass: () => TaskStatusModel,
      join: {
        from: 'project.id',
        to: 'task_status.projectId'
      }
    },

    tags: {
      relation: BaseModel.HasManyRelation,
      modelClass: () => TagModel,
      join: {
        from: 'project.id',
        to: 'tag.projectId'
      }
    },

    permissions: {
      relation: BaseModel.HasManyRelation,
      modelClass: () => ProjectPermissionsModel,
      join: {
        from: 'project.id',
        to: 'project_permissions.projectId'
      }
    },

    members: {
      relation: BaseModel.ManyToManyRelation,
      modelClass: () => UserModel,
      join: {
        from: 'project.id',
        through: {
          from: 'project_permissions.projectId',
          to: 'project_permissions.userId'
        },
        to: 'user.id'
      }
    },

    settings: {
      relation: BaseModel.HasOneRelation,
      modelClass: () => ProjectSettingsModel,
      join: {
        from: 'project.id',
        to: 'project_settings.projectId'
      }
    }
  }

  @AutoMap()
  taskCount: number

  @AutoMap()
  folderCount: number

  async loadTaskCount() {
    this.taskCount = await this.$relatedQuery('tasks').where('dateDeleted', null).resultSize()
  }

  async loadFolderCount() {
    this.folderCount = await this.$relatedQuery('folders').where('dateDeleted', null).resultSize()
  }
}
