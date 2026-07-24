import { forwardRef, Module } from '@nestjs/common'
import { TimerController } from './timer.controller'
import { TimerService } from './timer.service'
import { AuthModule } from '../../auth/auth.module'
import { TASK_TIMER_HISTORY_REPOSITORY } from './repositories/timer-history/task-timer-history-repository.interface'
import { TaskTimerHistoryRepository } from './repositories/timer-history/task-timer-history.repository'
import { TASK_REPOSITORY } from '../repositories/task/task-repository.interface'
import { TaskRepository } from '../repositories/task/task.repository'
import { TaskModule } from '../task.module'
import { EventsModule } from '../../events/events.module'
import { TASK_TIMER_REPOSITORY } from './repositories/timer/task-timer-repository.interface'
import { TaskTimerRepository } from './repositories/timer/task-timer.repository'
import { UserModule } from '../../user/user.module'
import { ProjectModule } from '../../project/project.module'

@Module({
  imports: [
    forwardRef(() => AuthModule),
    forwardRef(() => TaskModule),
    forwardRef(() => UserModule),
    forwardRef(() => ProjectModule),
    EventsModule
  ],
  controllers: [TimerController],
  providers: [
    TimerService,
    { provide: TASK_TIMER_HISTORY_REPOSITORY, useClass: TaskTimerHistoryRepository },
    { provide: TASK_TIMER_REPOSITORY, useClass: TaskTimerRepository },
    { provide: TASK_REPOSITORY, useClass: TaskRepository }
  ],
  exports: [TimerService]
})
export class TimerModule {}
