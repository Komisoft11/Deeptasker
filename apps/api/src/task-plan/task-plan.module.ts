import { AuthModule } from '../auth/auth.module'
import { forwardRef, Module } from '@nestjs/common'
import { TaskPlanController } from './task-plan.controller'
import { TaskPlanService } from './task-plan.service'
import { EventsModule } from '../events/events.module'
import { TaskModule } from '../task/task.module'
import { TaskPlanAuthService } from './auth/task-plan-auth.service'
import { TASK_PLAN_REPOSITORY } from './repositories/task-plan-repository.interface'
import { TaskPlanRepository } from './repositories/task-plan.repository'

@Module({
	imports: [forwardRef(() => AuthModule), EventsModule, TaskModule],
	controllers: [TaskPlanController],
	providers: [
		TaskPlanService,
		TaskPlanAuthService,
		{ provide: TASK_PLAN_REPOSITORY, useClass: TaskPlanRepository }
	]
})
export class TaskPlanModule {}
