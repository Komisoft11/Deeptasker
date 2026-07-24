import { Repository } from '../../common/database/repository'
import { TaskPlanModel } from '../models/task-plan.model'
import { ITaskPlanRepository } from './task-plan-repository.interface'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@squareboat/nestjs-objection'
import { TaskModel } from '../../task/models/task.model'
import { CreateOrUpdateDto } from '../dto/createOrUpdateDto'
import { UserModel } from '../../user/models/user.model'
import { ChangeTaskDayInfoDto } from '../dto/change-task-day-info.dto'
import { TaskPlanDayModel } from '../models/task-plan-day.model'

@Injectable()
export class TaskPlanRepository extends Repository<TaskPlanModel> implements ITaskPlanRepository {
	@InjectModel(TaskPlanModel)
	model: TaskPlanModel

	public async createTaskPlan(
		task: TaskModel,
		createDto: CreateOrUpdateDto,
		user: UserModel
	): Promise<TaskPlanModel> {
		return TaskPlanModel.query().insert({
			taskId: task.id,
			startDate: createDto.startDate,
			endDate: createDto.endDate,
			userId: user.id
		})
	}

	public async updateTaskPlan(
		taskId: number,
		updateDto: CreateOrUpdateDto,
		user: UserModel
	): Promise<void> {
		await TaskPlanModel.query()
			.patch({
				startDate: updateDto.startDate,
				endDate: updateDto.endDate,
				userId: user.id
			})
			.where('taskId', taskId)
	}

	public async changeDayInfo(
		task: TaskModel,
		dayInfoDto: ChangeTaskDayInfoDto,
		user: UserModel
	): Promise<void> {
		const dayInfo = await TaskPlanDayModel.query().findOne({ day: dayInfoDto.day, taskId: task.id })
		if (dayInfo) {
			await dayInfo.$query().patch({ priority: dayInfoDto.priority })
			return
		}

		await TaskPlanDayModel.query().insert({
			taskId: task.id,
			day: dayInfoDto.day,
			priority: dayInfoDto.priority
		})
	}

	public async getTaskPlanByPlanDate(planDate: string): Promise<TaskPlanModel[]> {
		return TaskPlanModel.query()
			.withGraphJoined('task')
			.where('startDate', '<=', planDate)
			.andWhere('endDate', '>=', planDate)
	}
}
