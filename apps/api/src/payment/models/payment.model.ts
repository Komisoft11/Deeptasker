import { MyBaseModel } from '../../common/database/base.model'
import { UserModel } from '../../user/models/user.model'
import { ModelOptions, QueryContext } from 'objection'
import { getCurrentUTCDateTime } from '../../common/helpers/date'
import { BaseModel } from '@squareboat/nestjs-objection'
import { PlanModel } from './plan.model'
import type { PlanModel as PlanModelType } from './plan.model'
import { AutoMap } from '@automapper/classes'

export enum PaymentStatus {
	wait = 'wait',
	success = 'success',
	canceled = 'canceled',
	refund = 'refund'
}

export class PaymentModel extends MyBaseModel {
	static tableName = 'payment'

	@AutoMap()
	id: number
	externalId: string

	@AutoMap()
	amount: number

	@AutoMap()
	months: number

	@AutoMap()
	status: PaymentStatus
	userId: number
	planId: number

	@AutoMap()
	dateCreated: Date

	dateUpdated: Date

	user?: UserModel

	@AutoMap(() => PlanModel)
	plan?: PlanModelType

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
				from: 'payment.userId',
				to: 'user.id'
			}
		},

		plan: {
			relation: BaseModel.HasOneRelation,
			modelClass: () => PlanModel,
			join: {
				from: 'payment.planId',
				to: 'plan.id'
			}
		}
	}
}
