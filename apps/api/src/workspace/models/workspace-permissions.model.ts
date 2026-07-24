import { MyBaseModel } from '../../common/database/base.model'
import { UserModel } from '../../user/models/user.model'
import { WorkspaceModel } from './workspace.model'
import { BaseModel } from '@squareboat/nestjs-objection'
import { AutoMap } from '@automapper/classes'

export class WorkspacePermissionsModel extends MyBaseModel
{
	static tableName = 'workspace_permissions'

	id: number
	@AutoMap()
	workspaceId: number
	@AutoMap()
	userId: number

	@AutoMap()
	createProjects: boolean
	@AutoMap()
	deleteProjects: boolean
	@AutoMap()
	editProjects: boolean
	@AutoMap()
	manageAdmins: boolean
	@AutoMap()
	edit: boolean
	@AutoMap()
	delete: boolean

	workspace?: WorkspaceModel
	user?: UserModel

	static relationMappings = {
		user: {
			relation: BaseModel.HasOneRelation,
			modelClass: () => UserModel,
			join: {
				from: 'workspace_permissions.userId',
				to: 'user.id'
			}
		},

		workspace: {
			relation: BaseModel.BelongsToOneRelation,
			modelClass: () => WorkspaceModel,
			join: {
				from: 'workspace_permissions.workspaceId',
				to: 'workspace.id'
			}
		},
	}
}