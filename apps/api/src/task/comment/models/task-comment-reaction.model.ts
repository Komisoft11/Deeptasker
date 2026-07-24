import { MyBaseModel } from '../../../common/database/base.model'
import { AutoMap } from '@automapper/classes'
import { UserModel, type UserModel as UserModelType } from '../../../user/models/user.model'
import {
	TaskCommentModel,
	type TaskCommentModel as TaskCommentModelType
} from './task-comment.model'
import { BaseModel } from '@squareboat/nestjs-objection'
import { getCurrentUTCDateTime } from '../../../common/helpers/date'

export class TaskCommentReactionModel extends MyBaseModel {
	static tableName = 'task_comment_reaction'

	@AutoMap()
	id: number

	@AutoMap()
	name: string

	@AutoMap()
	commentId: number

	@AutoMap()
	dateCreated: Date

	@AutoMap()
	userId: number

	@AutoMap(() => UserModel)
	user?: UserModelType

	@AutoMap(() => TaskCommentModel)
	comment?: TaskCommentModelType

	async $beforeInsert(queryContext) {
		await super.$beforeInsert(queryContext)
		this.dateCreated = getCurrentUTCDateTime()
	}

	static relationMappings = {
		user: {
			relation: BaseModel.HasOneRelation,
			modelClass: () => UserModel,
			join: {
				from: 'task_comment_reaction.userId',
				to: 'user.id'
			}
		},

		comment: {
			relation: BaseModel.HasOneRelation,
			modelClass: () => UserModel,
			join: {
				from: 'task_comment_reaction.commentId',
				to: 'task_comment.id'
			}
		}
	}
}
