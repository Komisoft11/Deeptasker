import { MyBaseModel } from '../../../common/database/base.model'
import { AutoMap } from '@automapper/classes'
import { ProjectModel } from '../../../project/models/project.model'

export class TagModel extends MyBaseModel {
	static tableName = 'tag'

	@AutoMap()
	id!: number

	@AutoMap()
	name: string

	@AutoMap()
	color: string

	projectId: number

	project?: ProjectModel

	static get modifiers() {
		return {
			selectShort(builder) {
				const { ref } = TagModel
				builder.select([ref('id'), ref('name'), ref('color')]);
			},
		}
	}
}
