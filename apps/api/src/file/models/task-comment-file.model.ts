import { MyBaseModel } from '../../common/database/base.model'
import { AutoMap } from '@automapper/classes'
import { FileModel, type FileModel as FileModelType } from './file.model'
import { UserModel, type UserModel as UserModelType } from '../../user/models/user.model'
import { BaseModel } from '@squareboat/nestjs-objection'
import {
	TaskCommentModel,
	type TaskCommentModel as TaskCommentModelType
} from '../../task/comment/models/task-comment.model'

export class TaskCommentFileModel extends MyBaseModel {
	static tableName = 'task_comment_file'

	@AutoMap()
	id: number

	@AutoMap()
	fileId: number

	@AutoMap()
	userId: number

	@AutoMap()
	commentId: number

	@AutoMap(() => TaskCommentModel)
	comment?: TaskCommentModelType

	@AutoMap(() => FileModel)
	file?: FileModelType

	@AutoMap(() => UserModel)
	user?: UserModelType

	static relationMappings = {
		comment: {
			relation: BaseModel.HasOneRelation,
			modelClass: () => TaskCommentModel,
			join: {
				from: 'task_comment_file.commentId',
				to: 'task_comment.id'
			}
		},

		user: {
			relation: BaseModel.HasOneRelation,
			modelClass: () => UserModel,
			join: {
				from: 'task_comment_file.userId',
				to: 'user.id'
			}
		},

		file: {
			relation: BaseModel.HasOneRelation,
			modelClass: () => FileModel,
			join: {
				from: 'task_comment_file.fileId',
				to: 'file.id'
			}
		}
	}
}
