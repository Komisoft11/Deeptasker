import { MyBaseModel } from '../../common/database/base.model'
import { getCurrentUTCDateTime } from '../../common/helpers/date'

export class WorkspaceUserModel extends MyBaseModel {
	static tableName = 'workspace_user'

	id: number
	workspaceId: number
	userId: number
	dateCreated: Date

	async $beforeInsert(queryContext) {
		await super.$beforeInsert(queryContext)
		this.dateCreated = getCurrentUTCDateTime()
	}
}
