import { MyBaseModel } from '../../common/database/base.model'
import { UserModel } from '../../user/models/user.model'
import { getCurrentUTCDateTime } from '../../common/helpers/date'
import { randomUUID } from 'crypto'
import { AutoMap } from '@automapper/classes'
import { BaseModel } from '@squareboat/nestjs-objection'
import { TaskModel } from '../../task/models/task.model'
import { ProjectModel } from '../../project/models/project.model'

export class WorkspaceModel extends MyBaseModel {
	static tableName = 'workspace'

	@AutoMap()
	id!: number

	@AutoMap()
	uuid!: string

	@AutoMap()
	title: string

	userId!: number

	@AutoMap()
	dateCreated: Date

	dateDeleted: Date

	dateUpdated: Date

	@AutoMap(() => UserModel)
	user?: UserModel

	@AutoMap(() => [UserModel])
	admins?: UserModel[]

	static get modifiers() {
		return {
			selectId(builder) {
				builder.select(TaskModel.ref('id'), TaskModel.ref('userId'))
			}
		}
	}

	async $beforeInsert(queryContext) {
		await super.$beforeInsert(queryContext)
		this.uuid = randomUUID()
		this.dateCreated = getCurrentUTCDateTime()
	}

	async $beforeUpdate(opt, queryContext) {
		await super.$beforeUpdate(opt, queryContext)
		this.dateUpdated = getCurrentUTCDateTime()
	}

	static relationMappings = {
		user: {
			relation: BaseModel.HasOneRelation,
			modelClass: () => UserModel,
			join: {
				from: 'workspace.userId',
				to: 'user.id'
			}
		},

		admins: {
			relation: BaseModel.ManyToManyRelation,
			modelClass: () => UserModel,
			join: {
				from: 'workspace.id',
				through: {
					from: 'workspace_user.workspaceId',
					to: 'workspace_user.userId'
				},
				to: 'user.id'
			}
		},

		projects: {
			relation: BaseModel.HasManyRelation,
			modelClass: () => ProjectModel,
			join: {
				from: 'workspace.id',
				to: 'project.workspaceId'
			}
		}
	}

	@AutoMap()
	projectCount: number

	@AutoMap()
	archivedProjectCount: number

	async loadProjectCount(workspaceId: number) {
		this.projectCount = await this.$relatedQuery('projects')
			.where('workspaceId', workspaceId)
			.andWhere('dateArchived', null)
			.andWhere('dateDeleted', null)
			.resultSize()

		this.archivedProjectCount = await this.$relatedQuery('projects')
			.where('workspaceId', workspaceId)
			.andWhereNot('dateArchived', null)
			.andWhere('dateDeleted', null)
			.resultSize()
	}
}
