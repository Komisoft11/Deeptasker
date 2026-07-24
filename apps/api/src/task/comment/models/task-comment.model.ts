import { BaseModel, CustomQueryBuilder } from '@squareboat/nestjs-objection'
import { AutoMap } from '@automapper/classes'
import { getCurrentUTCDateTime } from '../../../common/helpers/date'
import { TaskModel } from '../../models/task.model'
import { UserModel, type UserModel as UserModelType } from '../../../user/models/user.model'
import { MyBaseModel } from '../../../common/database/base.model'
import {
	TaskCommentReactionModel,
	type TaskCommentReactionModel as TaskModelReactionModelType
} from './task-comment-reaction.model'
import { FileModel, type FileModel as FileModelType } from '../../../file/models/file.model'

export class TaskCommentModel extends MyBaseModel {
	static tableName = 'task_comment'

	@AutoMap()
	id: number

	@AutoMap()
	taskId: number

	@AutoMap()
	replyId: number

	@AutoMap()
	userId: number

	@AutoMap()
	comment: string

	@AutoMap()
	dateDeleted: Date

	@AutoMap()
	dateUpdated: Date

	@AutoMap()
	dateCreated: Date

	@AutoMap(() => UserModel)
	user: UserModelType

	@AutoMap(() => [TaskCommentReactionModel])
	reactions?: TaskModelReactionModelType[]

	@AutoMap(() => [FileModel])
	files?: FileModelType[]

	task?: TaskModel

	static get modifiers() {
		return {
			selectShort(builder: CustomQueryBuilder<TaskCommentModel>) {
				builder.select('id', 'replyId', 'comment', 'dateUpdated', 'dateCreated')
			},
			notDeleted(builder) {
				builder.where('dateDeleted', null)
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
		task: {
			relation: BaseModel.HasOneRelation,
			modelClass: () => TaskModel,
			join: {
				from: 'task_comment.taskId',
				to: 'task.id'
			}
		},

		user: {
			relation: BaseModel.BelongsToOneRelation,
			modelClass: () => UserModel,
			join: {
				from: 'task_comment.userId',
				to: 'user.id'
			}
		},

		reactions: {
			relation: BaseModel.HasManyRelation,
			modelClass: () => TaskCommentReactionModel,
			join: {
				from: 'task_comment.id',
				to: 'task_comment_reaction.commentId'
			}
		},

		files: {
			relation: BaseModel.ManyToManyRelation,
			modelClass: () => FileModel,
			join: {
				from: 'task_comment.id',
				through: {
					from: 'task_comment_file.commentId',
					to: 'task_comment_file.fileId'
				},
				to: 'file.id'
			}
		}
	}
}
