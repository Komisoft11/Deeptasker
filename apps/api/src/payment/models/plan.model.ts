import { MyBaseModel } from '../../common/database/base.model'
import { ModelOptions, QueryContext } from 'objection'
import { getCurrentUTCDateTime } from '../../common/helpers/date'
import { PlanType } from '../services/plan.service'
import { AutoMap } from '@automapper/classes'
import { BaseModel } from '@squareboat/nestjs-objection'
import { UserPlanModel } from './user-plan.model'

export class PlanModel extends MyBaseModel {
	static tableName = 'plan'

	@AutoMap()
	id: number

	@AutoMap()
	name: string

	@AutoMap()
	description: string

	@AutoMap()
	code: PlanType

	@AutoMap()
	price: number

	@AutoMap()
	numWorkspaces: number

	@AutoMap()
	numProjects: number

	@AutoMap()
	numMembers: number

	@AutoMap()
	aiTaskTitle: boolean

	dateCreated: Date
	dateUpdated: Date
	dateDeleted: Date

	userPlans?: UserPlanModel[]

	@AutoMap(() => UserPlanModel)
	active?: UserPlanModel

	async $beforeInsert(queryContext: QueryContext) {
		await super.$beforeInsert(queryContext)
		this.dateCreated = getCurrentUTCDateTime()
	}

	async $beforeUpdate(opt: ModelOptions, queryContext: QueryContext) {
		await super.$beforeUpdate(opt, queryContext)
		this.dateUpdated = getCurrentUTCDateTime()
	}

	static relationMappings = {
		userPlans: {
			relation: BaseModel.HasManyRelation,
			modelClass: () => UserPlanModel,
			join: {
				from: 'plan.id',
				to: 'user_plan.planId'
			}
		},

		// to use with custom where user_plan.date_active IS NOT NULL
		active: {
			relation: BaseModel.HasOneRelation,
			modelClass: () => UserPlanModel,
			join: {
				from: 'plan.id',
				to: 'user_plan.planId'
			}
		}
	}
}
