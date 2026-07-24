import { AutoMap } from '@automapper/classes'
import { MyBaseModel } from '../../../common/database/base.model'
import { BaseModel } from '@squareboat/nestjs-objection'
import { UserModel } from '../../../user/models/user.model'
import { TaskModel } from '../../models/task.model'

export class TaskTimerHistoryModel extends MyBaseModel {
	static tableName = 'task_timer_history'

	@AutoMap()
	id!: number

	@AutoMap()
	taskId!: number

	@AutoMap()
	startTime: Date

	@AutoMap()
	endTime?: Date

	@AutoMap()
	editedDate?: Date

	@AutoMap()
	comment?: string

	@AutoMap()
	userId!: number

	@AutoMap(() => UserModel)
	user?: UserModel

	@AutoMap(() => TaskModel)
	task?: TaskModel

	static relationMappings = {
		user: {
			relation: BaseModel.HasOneRelation,
			modelClass: UserModel,
			join: {
				from: TaskTimerHistoryModel.tableName + '.userId',
				to: UserModel.tableName + '.id'
			}
		},

		task: {
			relation: BaseModel.HasOneRelation,
			modelClass: UserModel,
			join: {
				from: TaskTimerHistoryModel.tableName + '.taskId',
				to: TaskModel.tableName + '.id'
			}
		}
	}
}
