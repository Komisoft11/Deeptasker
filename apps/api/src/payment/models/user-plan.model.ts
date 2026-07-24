import { MyBaseModel } from '../../common/database/base.model'
import { ModelOptions, QueryContext } from 'objection'
import { getCurrentUTCDateTime } from '../../common/helpers/date'
import { PlanModel } from './plan.model'
import { BaseModel } from '@squareboat/nestjs-objection'
import { UserModel } from '../../user/models/user.model'
import { PaymentModel } from './payment.model'
import { AutoMap } from '@automapper/classes'

export class UserPlanModel extends MyBaseModel {
	static tableName = 'user_plan'

	id: number

	userId: number
	planId: number
	paymentId: number

	@AutoMap()
	dateActive?: Date

	@AutoMap()
	dateExpire: Date

	dateCreated: Date
	dateUpdated: Date

	user?: UserModel
	plan?: PlanModel
	payment?: PaymentModel

	async $beforeInsert(queryContext: QueryContext) {
		await super.$beforeInsert(queryContext)
		this.dateCreated = getCurrentUTCDateTime()
	}

	async $beforeUpdate(opt: ModelOptions, queryContext: QueryContext) {
		await super.$beforeUpdate(opt, queryContext)
		this.dateUpdated = getCurrentUTCDateTime()
	}

	static relationMappings = {
		user: {
			relation: BaseModel.HasOneRelation,
			modelClass: () => UserModel,
			join: {
				from: 'user_plan.userId',
				to: 'user.id'
			}
		},

		plan: {
			relation: BaseModel.HasOneRelation,
			modelClass: () => PlanModel,
			join: {
				from: 'user_plan.planId',
				to: 'plan.id'
			}
		},

		payment: {
			relation: BaseModel.HasOneRelation,
			modelClass: () => PaymentModel,
			join: {
				from: 'user_plan.payment_id',
				to: 'payment.id'
			}
		}
	}
}
