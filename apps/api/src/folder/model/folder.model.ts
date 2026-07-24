import { MyBaseModel } from '../../common/database/base.model'
import { AutoMap } from '@automapper/classes'
import {
	ProjectModel,
	type ProjectModel as ProjectModelType
} from '../../project/models/project.model'
import { UserModel } from '../../user/models/user.model'
import { TaskModel } from '../../task/models/task.model'
import type { UserModel as UserModelType } from '../../user/models/user.model'
import type { TaskModel as TaskModelType } from '../../task/models/task.model'
import { BaseModel } from '@squareboat/nestjs-objection'
import { getCurrentUTCDateTime } from '../../common/helpers/date'

export class FolderModel extends MyBaseModel {
	static tableName = 'folder'

	@AutoMap()
	id!: number

	@AutoMap()
	title: string

	@AutoMap()
	userId!: number

	@AutoMap()
	projectId!: number

	@AutoMap()
	parentId?: number

	@AutoMap()
	dateDeleted?: Date

	@AutoMap()
	dateUpdated?: Date

	@AutoMap()
	dateCreated: Date

	@AutoMap()
	customOrder?: number

	@AutoMap(() => UserModel)
	user: UserModelType

	@AutoMap(() => ProjectModel)
	project: ProjectModelType

	@AutoMap(() => [TaskModel])
	tasks: TaskModelType[]

	@AutoMap(() => [FolderModel])
	subFolders: FolderModel[]

	@AutoMap(() => FolderModel)
	parent?: FolderModel

	static get modifiers() {
		return {
			selectShort(builder) {
				builder.select(FolderModel.ref('id'), FolderModel.ref('title'))
			},
			notDeleted(builder) {
				builder.where(FolderModel.ref('dateDeleted'), null)
			}
		}
	}

	async $beforeInsert(queryContext) {
		await super.$beforeInsert(queryContext)
		this.dateCreated = getCurrentUTCDateTime()
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
				from: 'folder.userId',
				to: 'user.id'
			}
		},

		project: {
			relation: BaseModel.BelongsToOneRelation,
			modelClass: () => ProjectModel,
			join: {
				from: 'folder.projectId',
				to: 'project.id'
			}
		},

		parent: {
			relation: BaseModel.BelongsToOneRelation,
			modelClass: () => FolderModel,
			join: {
				from: 'folder.parentId',
				to: 'folder.id'
			}
		},

		tasks: {
			relation: BaseModel.HasManyRelation,
			modelClass: () => TaskModel,
			join: {
				from: 'folder.id',
				to: 'task.folderId'
			}
		},

		subFolders: {
			relation: BaseModel.HasManyRelation,
			modelClass: () => FolderModel,
			join: {
				from: 'folder.id',
				to: 'folder.parentId'
			}
		}
	}

	@AutoMap()
	taskCount: number

	async loadTaskCount() {
		this.taskCount = await this.$relatedQuery('tasks').where('dateDeleted', null).resultSize()
	}
}
