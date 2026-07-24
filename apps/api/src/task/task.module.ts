import { forwardRef, Logger, Module } from '@nestjs/common'
import { TaskService } from './services/task.service'
import { TaskController } from './controllers/task.controller'
import { AuthModule } from '../auth/auth.module'
import { TaskProfile } from './profiles/task.profile'
import { TimerModule } from './timer/timer.module'
import { EventsModule } from '../events/events.module'
import { ProjectModule } from '../project/project.module'
import { UserModule } from '../user/user.module'
import { TaskRepository } from './repositories/task/task.repository'
import { TASK_REPOSITORY } from './repositories/task/task-repository.interface'
import { TaskAccessModule } from './access/task-access.module'
import { TaskAuthService } from './auth/task-auth.service'
import { TaskCommentController } from './comment/controllers/task-comment.controller'
import { TaskCommentService } from './comment/services/task-comment.service'
import { TaskTagController } from './tag/controllers/task-tag.controller'
import { TaskTagService } from './tag/services/task-tag.service'
import { TagController } from './tag/controllers/tag.controller'
import { WorkspaceModule } from '../workspace/workspace.module'
import { AIModule } from '../ai/ai.module'
import { AsyncJobModule } from '../async-job/async-job.module'
import { TaskMover } from './components/task-mover'
import { StatusMover } from '../project/components/status-mover'
import { FixerController } from './controllers/fixer.controller'
import { TaskHistoryService } from './services/task-history.service'
import { FolderModule } from '../folder/folder.module'
import { SprintModule } from '../sprint/sprint.module'
import { TASK_TAG_REPOSITORY } from './repositories/tag/task-tag-repository.interface'
import { TaskTagRepository } from './repositories/tag/task-tag.repository'
import { TaskUpdater } from './components/task-updater/task-updater'
import { StatusUpdater } from './components/task-updater/updaters/status-updater'
import { DeadlineUpdater } from './components/task-updater/updaters/deadline-updater'
import { SprintUpdater } from './components/task-updater/updaters/sprint-updater'
import { PlanStartDateUpdater } from './components/task-updater/updaters/plan-start-date-updater'
import { NotificationModule } from '../notification/notification.module'

@Module({
  imports: [
    forwardRef(() => AuthModule),
    forwardRef(() => ProjectModule),
    forwardRef(() => UserModule),
    forwardRef(() => TimerModule),
    forwardRef(() => TaskAccessModule),
    forwardRef(() => WorkspaceModule),
    forwardRef(() => AsyncJobModule),
    forwardRef(() => FolderModule),
    forwardRef(() => SprintModule),
    EventsModule,
    AIModule,
    NotificationModule
  ],
  providers: [
    TaskService,
    TaskAuthService,
    Logger,
    TaskProfile,
    { provide: TASK_REPOSITORY, useClass: TaskRepository },
    { provide: TASK_TAG_REPOSITORY, useClass: TaskTagRepository },
    TaskCommentService,
    TaskTagService,
    TaskMover,
    StatusMover,
    TaskHistoryService,
    TaskUpdater,
    StatusUpdater,
    DeadlineUpdater,
    SprintUpdater,
    PlanStartDateUpdater
  ],
  controllers: [
    TaskController,
    TaskCommentController,
    TaskTagController,
    TagController,
    FixerController
  ],
  exports: [TaskService, TaskAuthService, TaskMover, StatusMover]
})
export class TaskModule {}
