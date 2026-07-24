import { MyBaseModel } from '../../../common/database/base.model'
import { UserModel } from '../../../user/models/user.model'
import { TaskModel } from '../../models/task.model'
import type { UserModel as UserModelType } from '../../../user/models/user.model'
import type { TaskModel as TaskModelType } from '../../models/task.model'
import { BaseModel } from '@squareboat/nestjs-objection'
import { getCurrentUTCDateTime } from '../../../common/helpers/date'
import { TaskRoleModel } from './task-role.model'
import { AutoMap } from '@automapper/classes'

export class TaskUserModel extends MyBaseModel {
	static tableName = 'task_user'

	id!: number
	userId!: number
	taskId!: number
	taskRoleId!: number
	dateCreated!: Date

	@AutoMap(() => UserModel)
	user?: UserModelType

	task?: TaskModelType

	@AutoMap(() => TaskRoleModel)
	taskRole?: TaskRoleModel

	async $beforeInsert(queryContext) {
		await super.$beforeInsert(queryContext)
		this.dateCreated = getCurrentUTCDateTime()
	}

	static relationMappings = {
		user: {
			relation: BaseModel.BelongsToOneRelation,
			modelClass: () => UserModel,
			join: {
				from: 'task_user.userId',
				to: 'user.id'
			}
		},

		task: {
			relation: BaseModel.BelongsToOneRelation,
			modelClass: () => TaskModel,
			join: {
				from: 'task_user.taskId',
				to: 'task.id'
			}
		},

		taskRole: {
			relation: BaseModel.HasOneRelation,
			modelClass: () => TaskRoleModel,
			join: {
				from: 'task_user.taskRoleId',
				to: 'task_role.id'
			}
		}
	}
}
