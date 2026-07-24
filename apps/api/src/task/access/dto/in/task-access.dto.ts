import { IsEnum, IsNotEmpty } from 'class-validator'
import { TaskRoleCode } from '../../../auth/task-access.role'

export class TaskAccessDto {
	@IsNotEmpty()
	@IsEnum(TaskRoleCode)
	code: TaskRoleCode
}