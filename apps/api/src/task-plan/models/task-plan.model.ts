import { MyBaseModel } from '../../common/database/base.model'
import { AutoMap } from '@automapper/classes'
import { TaskModel } from '../../task/models/task.model'
import { BaseModel } from '@squareboat/nestjs-objection'
import { UserModel } from '../../user/models/user.model'
import { getCurrentUTCDateTime } from '../../common/helpers/date'

export class TaskPlanModel extends MyBaseModel {
	static tableName = 'task_plan'

	@AutoMap()
	id: number

	@AutoMap()
	taskId: number

	@AutoMap()
	startDate!: Date

	@AutoMap()
	endDate!: Date

	dateCreated: Date
	dateUpdated: Date
	userId!: number

	task: TaskModel
	user: UserModel

	async $beforeInsert(queryContext) {
		await super.$beforeInsert(queryContext)
		this.dateCreated = getCurrentUTCDateTime()
	}

	async $beforeUpdate(opt, queryContext) {
		await super.$beforeUpdate(opt, queryContext)
		this.dateUpdated = getCurrentUTCDateTime()
	}

	static relationMappings = {
		task: {
			relation: BaseModel.HasOneRelation,
			modelClass: () => TaskModel,
			join: {
				from: 'task_plan.taskId',
				to: 'task.id'
			}
		},

		user: {
			relation: BaseModel.HasOneRelation,
			modelClass: () => UserModel,
			join: {
				from: 'task_plan.userId',
				to: 'user.id'
			}
		}
	}
}
