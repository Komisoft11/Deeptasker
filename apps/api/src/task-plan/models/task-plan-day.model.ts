import { MyBaseModel } from '../../common/database/base.model'
import { AutoMap } from '@automapper/classes'
import { TaskModel } from '../../task/models/task.model'
import { BaseModel } from '@squareboat/nestjs-objection'
import { getCurrentUTCDateTime } from '../../common/helpers/date'

export class TaskPlanDayModel extends MyBaseModel {
	static tableName = 'task_plan_day'

	@AutoMap()
	id: number

	@AutoMap()
	taskId: number

	@AutoMap()
	day!: Date

	@AutoMap()
	priority: number

	dateCreated: Date
	dateUpdated: Date
	userId!: number

	task: TaskModel

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
		}
	}
}
