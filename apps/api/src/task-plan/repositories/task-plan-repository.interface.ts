import { CustomQueryBuilder, RepositoryContract } from '@squareboat/nestjs-objection'
import { TaskPlanModel } from '../models/task-plan.model'
import { TaskModel } from '../../task/models/task.model'
import { CreateOrUpdateDto } from '../dto/createOrUpdateDto'
import { UserModel } from '../../user/models/user.model'
import { ChangeTaskDayInfoDto } from '../dto/change-task-day-info.dto'

export const TASK_PLAN_REPOSITORY = 'task-plan_repository'

export interface ITaskPlanRepository extends RepositoryContract<TaskPlanModel> {
	query<R = TaskPlanModel>(): CustomQueryBuilder<TaskPlanModel, R>

	createTaskPlan(
		task: TaskModel,
		createDto: CreateOrUpdateDto,
		user: UserModel
	): Promise<TaskPlanModel>

	updateTaskPlan(taskId: number, updateDto: CreateOrUpdateDto, user: UserModel): Promise<void>

	changeDayInfo(task: TaskModel, dayInfoDto: ChangeTaskDayInfoDto, user: UserModel): Promise<void>

	getTaskPlanByPlanDate(planDate: string): Promise<TaskPlanModel[]>
}
