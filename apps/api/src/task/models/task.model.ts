import { BaseModel } from '@squareboat/nestjs-objection'
import { AutoMap } from '@automapper/classes'
import { getCurrentUTCDateTime } from '../../common/helpers/date'
import { TaskCommentModel } from '../comment/models/task-comment.model'
import { FileModel } from '../../file/models/file.model'
import { UserModel, type UserModel as UserModelType } from '../../user/models/user.model'
import { ProjectModel } from '../../project/models/project.model'
import { MyBaseModel } from '../../common/database/base.model'
import { TaskTimerModel } from '../timer/models/task-timer.model'
import { TaskUserModel } from '../access/models/task-user.model'
import { TaskStatusModel } from './task-status.model'
import { TagModel } from '../tag/models/tag.model'
import { QueryContext } from 'objection'
import { FolderModel } from '../../folder/model/folder.model'
import { SprintModel } from '../../sprint/model/sprint.model'

export class TaskModel extends MyBaseModel {
  static tableName = 'task'

  @AutoMap()
  id!: number

  @AutoMap()
  title: string

  @AutoMap()
  content: string

  @AutoMap()
  executorId: number

  @AutoMap()
  userId!: number

  @AutoMap()
  assignerId: number

  @AutoMap()
  projectId!: number

  @AutoMap()
  parentId: number

  @AutoMap()
  finishedByTaskId: number

  @AutoMap()
  deletedByTaskId: number

  @AutoMap()
  folderId?: number

  @AutoMap()
  priority: number

  @AutoMap()
  statusId: number

  @AutoMap()
  planStartDate: Date

  @AutoMap()
  deadlineDate: Date

  @AutoMap()
  dateFinished: Date

  @AutoMap()
  dateDeleted: Date

  @AutoMap()
  dateUpdated: Date

  @AutoMap()
  dateCreated: Date

  @AutoMap()
  activeDate: Date

  @AutoMap()
  customOrder: number

  @AutoMap()
  statusOrder: number

  @AutoMap()
  dateSentForReview: Date

  @AutoMap()
  estimatedTime: number

  @AutoMap(() => [TaskCommentModel])
  comments?: TaskCommentModel[]

  @AutoMap(() => UserModel)
  executor?: UserModelType

  @AutoMap(() => TaskStatusModel)
  status?: TaskStatusModel

  @AutoMap(() => UserModel)
  user: UserModelType

  @AutoMap(() => UserModel)
  assigner: UserModelType

  @AutoMap(() => [TaskUserModel])
  invited?: TaskUserModel[]

  @AutoMap(() => ProjectModel)
  project: ProjectModel

  @AutoMap(() => [FileModel])
  files?: FileModel[]

  @AutoMap(() => [TaskModel])
  subtasks?: TaskModel[]

  @AutoMap(() => TaskModel)
  parent?: TaskModel

  @AutoMap(() => [TagModel])
  tags?: TagModel[]

  @AutoMap(() => FolderModel)
  folder: FolderModel

  @AutoMap()
  commentsCount: number

  @AutoMap()
  filesCount: number

  @AutoMap()
  statusDateUpdated: Date

  @AutoMap()
  sprintId: number

  @AutoMap(() => SprintModel)
  sprint?: SprintModel

  @AutoMap()
  externalId: string

  currentExecutorTimer?: TaskTimerModel

  timers?: TaskTimerModel[]

  static get modifiers() {
    return {
      selectId(builder) {
        builder.select(TaskModel.ref('id'))
      },
      notDeleted(builder) {
        builder.where(TaskModel.ref('dateDeleted'), null)
      }
    }
  }

  async $beforeInsert(queryContext: QueryContext) {
    await super.$beforeInsert(queryContext)

    this.dateCreated = getCurrentUTCDateTime()
  }

  async $beforeUpdate(opt, queryContext: QueryContext) {
    await super.$beforeUpdate(opt, queryContext)

    const currentUTCDateTime = getCurrentUTCDateTime()

    if (opt.old && opt.old.statusId && this.statusId) {
      this.statusDateUpdated = currentUTCDateTime
    }

    this.dateUpdated = currentUTCDateTime
  }

  static relationMappings = {
    timers: {
      relation: BaseModel.HasManyRelation,
      modelClass: () => TaskTimerModel,
      join: {
        from: ['task.id'],
        to: ['task_timer.taskId']
      }
    },

    comments: {
      relation: BaseModel.HasManyRelation,
      modelClass: () => TaskCommentModel,
      join: {
        from: 'task.id',
        to: 'task_comment.taskId'
      }
    },

    files: {
      relation: BaseModel.ManyToManyRelation,
      modelClass: () => FileModel,
      join: {
        from: 'task.id',
        through: {
          from: 'task_file.taskId',
          to: 'task_file.fileId'
        },
        to: 'file.id'
      }
    },

    tags: {
      relation: BaseModel.ManyToManyRelation,
      modelClass: () => TagModel,
      join: {
        from: 'task.id',
        through: {
          from: 'task_tag.taskId',
          to: 'task_tag.tagId'
        },
        to: 'tag.id'
      }
    },

    invited: {
      relation: BaseModel.HasManyRelation,
      modelClass: () => TaskUserModel,
      join: {
        from: 'task.id',
        to: 'task_user.taskId'
      }
    },

    subtasks: {
      relation: BaseModel.HasManyRelation,
      modelClass: () => TaskModel,
      join: {
        from: 'task.id',
        to: 'task.parentId'
      }
    },

    parent: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: () => TaskModel,
      join: {
        from: 'task.parentId',
        to: 'task.id'
      }
    },

    user: {
      relation: BaseModel.HasOneRelation,
      modelClass: () => UserModel,
      join: {
        from: 'task.userId',
        to: 'user.id'
      }
    },

    assigner: {
      relation: BaseModel.HasOneRelation,
      modelClass: () => UserModel,
      join: {
        from: 'task.assignerId',
        to: 'user.id'
      }
    },

    executor: {
      relation: BaseModel.HasOneRelation,
      modelClass: () => UserModel,
      join: {
        from: 'task.executorId',
        to: 'user.id'
      }
    },

    status: {
      relation: BaseModel.HasOneRelation,
      modelClass: () => TaskStatusModel,
      join: {
        from: 'task.statusId',
        to: 'task_status.id'
      }
    },

    project: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: () => ProjectModel,
      join: {
        from: 'task.projectId',
        to: 'project.id'
      }
    },

    folder: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: () => FolderModel,
      join: {
        from: 'task.folderId',
        to: 'folder.id'
      }
    },

    sprint: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: () => SprintModel,
      join: {
        from: 'task.sprintId',
        to: 'sprint.id'
      }
    }
  }

  async loadCommentsCount() {
    this.commentsCount = await this.$relatedQuery('comments')
      .andWhere('dateDeleted', null)
      .resultSize()
  }

  async loadFilesCount() {
    this.filesCount = await this.$relatedQuery('files').resultSize()
  }
}
