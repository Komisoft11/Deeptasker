import { BaseModel } from '@squareboat/nestjs-objection'
import { AutoMap } from '@automapper/classes'
import { getCurrentUTCDateTime } from '../../common/helpers/date'
import { TaskModel } from '../../task/models/task.model'
import { hash } from '../../auth/utilities/password'
import { TaskCommentModel } from '../../task/comment/models/task-comment.model'
import { MyBaseModel } from '../../common/database/base.model'
import { ProjectModel } from '../../project/models/project.model'
import { IUser } from '../../events/interfaces/user.interface'
import { FolderModel } from '../../folder/model/folder.model'
import { FileModel } from '../../file/models/file.model'
import { ProjectRoleType } from '../../project/components/permissions/types/roles/project-role.interface'

export enum UserSex {
  male = 'M',
  female = 'F'
}

export class UserModel extends MyBaseModel {
  static tableName = 'user'

  static get virtualAttributes() {
    return ['fullName']
  }

  @AutoMap()
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`
  }

  public getShortInfo(): IUser {
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      username: this.username,
      iconBg: this.iconBg,
      iconFg: this.iconFg
    }
  }

  @AutoMap()
  id!: number

  @AutoMap()
  username?: string

  @AutoMap()
  firstName: string

  @AutoMap()
  lastName: string

  @AutoMap()
  middleName: string

  @AutoMap()
  dob: Date

  @AutoMap()
  sex: string

  @AutoMap()
  description: string

  @AutoMap()
  email: string

  password: string

  @AutoMap()
  role: string

  @AutoMap()
  activeTaskId: number

  @AutoMap()
  iconBg: string

  @AutoMap()
  iconFg: string

  dateDeleted?: Date

  dateUpdated?: Date

  @AutoMap()
  dateCreated: Date

  @AutoMap()
  isActivated: boolean

  @AutoMap()
  projectRole?: ProjectRoleType

  @AutoMap({ type: () => TaskModel, depth: 0 })
  activeTask?: TaskModel

  @AutoMap()
  phoneNumber?: string

  @AutoMap()
  avatarId?: number

  @AutoMap({ type: () => FileModel, depth: 0 })
  avatar?: FileModel

  static get modifiers() {
    return {
      selectShort(builder) {
        builder.select(
          UserModel.ref('id'),
          UserModel.ref('firstName'),
          UserModel.ref('lastName'),
          UserModel.ref('username'),
          UserModel.ref('avatarId')
        )
      },
      selectShortColor(builder) {
        builder.select(
          UserModel.ref('id'),
          UserModel.ref('firstName'),
          UserModel.ref('lastName'),
          UserModel.ref('username'),
          UserModel.ref('iconBg'),
          UserModel.ref('iconFg'),
          UserModel.ref('avatarId')
        )
      },
      selectRole(builder) {
        builder.select(UserModel.ref('id'), UserModel.ref('role'))
      },
      notDeleted(builder) {
        builder.where(UserModel.ref('dateDeleted'), null)
      },
      activeTask(builder) {
        builder.select(UserModel.ref('activeTaskId'))
      }
    }
  }

  private async setPassword(password: string) {
    this.password = await hash(password)
  }

  async $beforeInsert(queryContext) {
    await super.$beforeInsert(queryContext)
    await this.setPassword(this.password)
    this.dateCreated = getCurrentUTCDateTime()
  }

  async $beforeUpdate(opt, queryContext) {
    await super.$beforeUpdate(opt, queryContext)
    this.dateUpdated = getCurrentUTCDateTime()
    if (this.password && opt?.old.password !== this.password) {
      await this.setPassword(this.password)
    }
  }

  static relationMappings = {
    projects: {
      relation: BaseModel.ManyToManyRelation,
      modelClass: () => ProjectModel,
      join: {
        from: 'user.id',
        through: {
          from: 'project_permissions.userId',
          to: 'project_permissions.projectId'
        },
        to: 'project.id'
      }
    },

    ownerProjects: {
      relation: BaseModel.HasManyRelation,
      modelClass: () => ProjectModel,
      join: {
        from: 'user.id',
        to: 'project.userId'
      }
    },

    folders: {
      relation: BaseModel.HasManyRelation,
      modelClass: () => FolderModel,
      join: {
        from: 'user.id',
        to: 'folder.id'
      }
    },

    tasks: {
      relation: BaseModel.HasManyRelation,
      modelClass: () => TaskModel,
      join: {
        from: 'user.id',
        to: 'task.userId'
      }
    },

    taskComments: {
      relation: BaseModel.HasManyRelation,
      modelClass: () => TaskCommentModel,
      join: {
        from: 'user.id',
        to: 'task_comment.userId'
      }
    },

    activeTask: {
      relation: BaseModel.HasOneRelation,
      modelClass: () => TaskModel,
      join: {
        from: 'user.activeTaskId',
        to: 'task.id'
      }
    },

    avatar: {
      relation: BaseModel.HasOneRelation,
      modelClass: () => FileModel,
      join: {
        from: 'user.avatarId',
        to: 'file.id'
      }
    }
  }
}
