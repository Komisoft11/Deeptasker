import { MyBaseModel } from '../../common/database/base.model'
import { AutoMap } from '@automapper/classes'
import { BaseModel } from '@squareboat/nestjs-objection'
import { ProjectModel } from './project.model'

export class ProjectSettingsModel extends MyBaseModel {
	static tableName = 'project_settings'

	id!: number

	projectId!: number

	@AutoMap()
	isReviewRequired: boolean

	project?: ProjectModel

	static relationMappings = {
		project: {
			relation: BaseModel.HasOneRelation,
			modelClass: () => ProjectModel,
			join: {
				from: 'project_settings.projectId',
				to: 'project.id'
			}
		}
	}
}
