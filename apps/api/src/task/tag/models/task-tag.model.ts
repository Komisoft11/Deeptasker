import { MyBaseModel } from '../../../common/database/base.model'
import { AutoMap } from '@automapper/classes'
import { TaskModel } from '../../models/task.model'
import { UserModel } from '../../../user/models/user.model'
import { TagModel } from './tag.model'
import { getCurrentUTCDateTime } from '../../../common/helpers/date'
import { BaseModel } from '@squareboat/nestjs-objection'

export class TaskTagModel extends MyBaseModel {
	static tableName = 'task_tag'

	@AutoMap()
	id!: number

	@AutoMap()
	taskId: number

	@AutoMap()
	tagId: number

	@AutoMap()
	userId: number

	dateCreated: Date

	task?: TaskModel
	tag?: TagModel
	user?: UserModel

	async $beforeInsert(queryContext) {
		await super.$beforeInsert(queryContext)
		this.dateCreated = getCurrentUTCDateTime()
	}

	static relationMappings = {
		user: {
			relation: BaseModel.HasOneRelation,
			modelClass: () => UserModel,
			join: {
				from: 'task_tag.userId',
				to: 'user.id'
			}
		},

		tag: {
			relation: BaseModel.HasOneRelation,
			modelClass: () => TagModel,
			join: {
				from: 'task_tag.tagId',
				to: 'tag.id'
			}
		},

		task: {
			relation: BaseModel.HasOneRelation,
			modelClass: () => TaskModel,
			join: {
				from: 'task_tag.taskId',
				to: 'task.id'
			}
		}
	}
}
