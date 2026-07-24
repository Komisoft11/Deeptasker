import { forwardRef, Module } from '@nestjs/common'
import { AuthModule } from '../../auth/auth.module'
import { TaskModule } from '../task.module'
import { TASK_REPOSITORY } from '../repositories/task/task-repository.interface'
import { TaskRepository } from '../repositories/task/task.repository'
import { TaskAccessController } from './task-access.controller'
import { TaskAccessService } from './task-access.service'
import { ProjectModule } from '../../project/project.module'
import { UserModule } from '../../user/user.module'
import { EventsModule } from '../../events/events.module'

@Module({
  imports: [
    forwardRef(() => AuthModule),
    forwardRef(() => TaskModule),
    forwardRef(() => ProjectModule),
    forwardRef(() => UserModule),
    EventsModule
  ],
  controllers: [TaskAccessController],
  providers: [TaskAccessService, { provide: TASK_REPOSITORY, useClass: TaskRepository }],
  exports: [TaskAccessService]
})
export class TaskAccessModule {}