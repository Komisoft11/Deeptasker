import { AutoMap } from '@automapper/classes'
import { SpecialTaskStatusCode } from '../../task/models/task-status.model'

export class TaskStatusDto {
	@AutoMap()
	id!: number

	@AutoMap()
	name!: string

	@AutoMap()
	order!: number

	@AutoMap()
	color!: string

	@AutoMap()
	code?: SpecialTaskStatusCode | string
}