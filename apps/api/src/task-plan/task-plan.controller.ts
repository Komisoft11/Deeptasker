import {
	Body,
	Controller,
	Delete,
	ForbiddenException,
	Get,
	NotFoundException,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	Query
} from '@nestjs/common'
import { TaskPlanService } from './task-plan.service'
import { IntervalDto } from './dto/interval.dto'
import { CreateOrUpdateDto } from './dto/createOrUpdateDto'
import { ITasksOnDate } from './interfaces/tasks-on-date.interface'
import { Auth } from '../auth/decorators/auth.decorator'
import { GlobalRole } from '../user/access/enum.role'
import { ApiTags } from '@nestjs/swagger'
import { ICreatedRecord } from '../common/interfaces/created-record.interface'
import { User } from '../auth/decorators/user.decorator'
import { TaskPlanAuthService } from './auth/task-plan-auth.service'
import { TaskService } from '../task/services/task.service'
import { ChangeTaskDayInfoDto } from './dto/change-task-day-info.dto'
import { I18nContext, I18nService } from 'nestjs-i18n'
import { UserModel } from '../user/models/user.model'

@Auth(GlobalRole.User)
@ApiTags('task-plans')
@Controller('task-plans')
export class TaskPlanController {
	constructor(
		private readonly taskService: TaskService,
		private readonly taskPlanService: TaskPlanService,
		private readonly taskPlanAuthService: TaskPlanAuthService,
		private readonly i18n: I18nService
	) {}

	@Get('interval')
	async getTaskPlanByWeek(
		@Query() intervalDto: IntervalDto,
		@User() user: UserModel
	): Promise<ITasksOnDate[]> {
		return this.taskPlanService.getByInterval(intervalDto)
	}

	@Post(':taskId')
	async create(
		@Param('taskId', ParseIntPipe) taskId: number,
		@Body() createDto: CreateOrUpdateDto,
		@User() user: UserModel
	): Promise<ICreatedRecord> {
		const task = await this.taskService.getTask(taskId)
		if (!task) {
			throw new NotFoundException(
				this.i18n.t('task.not_found', {
					lang: I18nContext.current().lang,
					args: { id: taskId }
				})
			)
		}

		if (!(await this.taskPlanAuthService.canCreate(task, user))) {
			throw new ForbiddenException()
		}

		const taskPlan = await this.taskPlanService.create(task, createDto, user)

		return { id: taskPlan.id }
	}

	@Patch(':taskId')
	async update(
		@Param('taskId', ParseIntPipe) taskId: number,
		@Body() updateDto: CreateOrUpdateDto,
		@User() user: UserModel
	) {
		const task = await this.taskService.getTask(taskId)
		if (!task) {
			throw new NotFoundException(
				this.i18n.t('task.not_found', {
					lang: I18nContext.current().lang,
					args: { id: taskId }
				})
			)
		}

		if (!(await this.taskPlanAuthService.canUpdate(task, user))) {
			throw new ForbiddenException()
		}

		return this.taskPlanService.update(taskId, updateDto, user)
	}

	@Delete(':taskId')
	async delete(@Param('taskId', ParseIntPipe) taskId: number, @User() user: UserModel) {
		const task = await this.taskService.getTask(taskId)
		if (!task) {
			throw new NotFoundException(
				this.i18n.t('task.not_found', {
					lang: I18nContext.current().lang,
					args: { id: taskId }
				})
			)
		}

		if (!(await this.taskPlanAuthService.canDelete(task, user))) {
			throw new ForbiddenException()
		}

		return this.taskPlanService.delete(taskId)
	}

	@Post('/day-info/:taskId')
	async changeTaskDayInfo(
		@Param('taskId', ParseIntPipe) taskId: number,
		@Body() dayInfoDto: ChangeTaskDayInfoDto,
		@User() user: UserModel
	) {
		const task = await this.taskService.getTask(taskId)
		if (!task) {
			throw new NotFoundException(
				this.i18n.t('task.not_found', {
					lang: I18nContext.current().lang,
					args: { id: taskId }
				})
			)
		}

		if (!(await this.taskPlanAuthService.canChangeDayInfo(task, user))) {
			throw new ForbiddenException()
		}

		return this.taskPlanService.changeDayInfo(task, dayInfoDto, user)
	}
}
