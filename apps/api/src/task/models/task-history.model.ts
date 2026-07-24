import { AutoMap } from '@automapper/classes'
import { MyBaseModel } from '../../common/database/base.model'
import { BaseModel } from '@squareboat/nestjs-objection'
import { TaskModel } from './task.model'

export class TaskHistoryModel extends MyBaseModel {
	static tableName = 'task_history'

	@AutoMap()
	id: number

	taskId: number

	@AutoMap()
	dateCreated: Date

	@AutoMap()
	userId: number

	@AutoMap()
	field: string

	@AutoMap()
	oldValue: string

	@AutoMap()
	newValue: string

	static relationMappings = {
		task: {
			relation: BaseModel.HasOneRelation,
			modelClass: () => TaskModel,
			join: {
				from: 'task_history.taskId',
				to: 'task.id'
			}
		},

		user: {
			relation: BaseModel.HasOneRelation,
			modelClass: () => TaskModel,
			join: {
				from: 'task_history.userId',
				to: 'user.id'
			}
		}
	}
}
