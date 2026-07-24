import { MyBaseModel } from '../../common/database/base.model'
import { AutoMap } from '@automapper/classes'
import { TaskModel } from '../../task/models/task.model'
import { FileModel } from './file.model'
import { BaseModel } from '@squareboat/nestjs-objection'
import { UserModel } from '../../user/models/user.model'

export class TaskFileModel extends MyBaseModel {
	static tableName = 'task_file'

	static get idColumn() {
		return ['taskId', 'fileId']
	}

	@AutoMap()
	taskId!: number

	@AutoMap()
	fileId!: number

	@AutoMap()
	userId!: number

	@AutoMap(() => TaskModel)
	task!: TaskModel

	@AutoMap(() => FileModel)
	file!: FileModel

	@AutoMap(() => UserModel)
	user!: UserModel

	static relationMappings = {
		task: {
			relation: BaseModel.HasOneRelation,
			modelClass: () => TaskModel,
			join: {
				from: 'task_file.taskId',
				to: 'task.id'
			}
		},

		user: {
			relation: BaseModel.HasOneRelation,
			modelClass: () => UserModel,
			join: {
				from: 'task_file.userId',
				to: 'user.id'
			}
		},

		file: {
			relation: BaseModel.HasOneRelation,
			modelClass: () => FileModel,
			join: {
				from: 'task_file.fileId',
				to: 'file.id'
			}
		}
	}
}
