import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { CreateOrUpdateDto } from './dto/createOrUpdateDto'
import { IntervalDto } from './dto/interval.dto'
import dayjs from 'dayjs'
import { ITasksOnDate } from './interfaces/tasks-on-date.interface'
import { TaskPlanModel } from './models/task-plan.model'
import { UserModel } from '../user/models/user.model'
import { EventService } from '../events/event.service'
import { I18nService } from 'nestjs-i18n'
import { TaskModel } from '../task/models/task.model'
import { TaskPlanDayModel } from './models/task-plan-day.model'
import { ChangeTaskDayInfoDto } from './dto/change-task-day-info.dto'
import { TASK_PLAN_REPOSITORY } from './repositories/task-plan-repository.interface'
import { TaskPlanRepository } from './repositories/task-plan.repository'

@Injectable()
export class TaskPlanService {
	constructor(
		@Inject(TASK_PLAN_REPOSITORY) private readonly taskPlanRepository: TaskPlanRepository,
		private readonly eventService: EventService,
		private readonly i18n: I18nService
	) {}

	public async create(
		task: TaskModel,
		createDto: CreateOrUpdateDto,
		user: UserModel
	): Promise<TaskPlanModel> {
		this.checkInterval(createDto)

		return this.taskPlanRepository.createTaskPlan(task, createDto, user)
	}

	public async update(
		taskId: number,
		updateDto: CreateOrUpdateDto,
		user: UserModel
	): Promise<void> {
		this.checkInterval(updateDto)

		await this.taskPlanRepository.updateTaskPlan(taskId, updateDto, user)
	}

	public async delete(taskId: number) {
		await TaskPlanModel.query().delete().where('taskId', taskId)
	}

	public async getByInterval(intervalDto: IntervalDto): Promise<ITasksOnDate[]> {
		const tasksOnDate: ITasksOnDate[] = []
		let dateFrom = new Date(intervalDto.dateFrom)
		let dateTo = new Date(intervalDto.dateTo)
		let counter = 0

		for (dateFrom; dateFrom <= dateTo; dateFrom.setDate(dateFrom.getDate() + 1)) {
			let dateString = dayjs(dateFrom).format('YYYY-MM-DD')
			const taskPlans = await this.taskPlanRepository.getTaskPlanByPlanDate(dateString)

			tasksOnDate.push({
				id: counter,
				planDate: dateString,
				dayOfWeek: dayjs(dateFrom).day(),
				tasks: taskPlans.map(plan => plan.task)
			})
			counter++
		}

		return tasksOnDate
	}

	public async changeDayInfo(
		task: TaskModel,
		dayInfoDto: ChangeTaskDayInfoDto,
		user: UserModel
	): Promise<void> {
		await this.taskPlanRepository.changeDayInfo(task, dayInfoDto, user)
	}

	private checkInterval(planInterval: CreateOrUpdateDto) {
		if (dayjs(planInterval.startDate).isAfter(dayjs(planInterval.endDate))) {
			throw new BadRequestException(this.i18n.t('Start date cannot be after end date'))
		}
	}
}
