import { MyBaseModel } from '../../common/database/base.model'
import { UserModel } from '../../user/models/user.model'
import { getCurrentUTCDateTime } from '../../common/helpers/date'
import dayjs from 'dayjs'
import { BaseModel } from '@squareboat/nestjs-objection'
import { AutoMap } from '@automapper/classes'

export const REFRESH_DAYS_EXPIRE = 10

export class RefreshModel extends MyBaseModel {
	static tableName = 'refresh'

	id!: number

	@AutoMap()
	token: string

	userId: number

	dateExpire: Date

	dateCreated: Date

	user?: UserModel

	async $beforeInsert(queryContext) {
		await super.$beforeInsert(queryContext)
		this.dateCreated = getCurrentUTCDateTime()
		this.dateExpire = dayjs().add(REFRESH_DAYS_EXPIRE, 'day').toDate()
	}

	static relationMappings = {
		user: {
			relation: BaseModel.HasOneRelation,
			modelClass: () => UserModel,
			join: {
				from: 'refresh.userId',
				to: 'user.id'
			}
		}
	}
}
