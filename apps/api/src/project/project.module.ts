import { TaskModule } from '../task/task.module'
import { UserModule } from '../user/user.module'
import { forwardRef, Logger, Module } from '@nestjs/common'
import { ProjectService } from './services/project/project.service'
import { ProjectController } from './controllers/project.controller'
import { AuthModule } from '../auth/auth.module'
import { ProjectProfile } from './profiles/project.profile'
import { PROJECT_REPOSITORY } from './repositories/project/project-repository.interface'
import { ProjectRepository } from './repositories/project/project.repository'
import { ProjectAuthService } from './auth/project-auth.service'
import { WorkspaceModule } from '../workspace/workspace.module'
import { EventsModule } from '../events/events.module'
import { TaskStatusController } from './controllers/task-status.controller'
import { TaskStatusService } from './services/task-status/task-status.service'
import { ArchivedProjectController } from './controllers/archived-project.controller'
import { ArchivedProjectService } from './services/project/archived-project.service'
import { AsyncJobModule } from '../async-job/async-job.module'
import { ProjectMover } from './components/project-mover'
import { StatusMover } from './components/status-mover'
import { PaymentModule } from '../payment/payment.module'
import { FolderModule } from '../folder/folder.module'
import { ReportService } from '../report/services/report.service'
import { REPORT_REPOSITORY } from '../report/repositories/report-repository.interface'
import { ReportRepository } from '../report/repositories/report.repository'
import { FileModule } from '../file/file.module'
import { TASK_STATUS_REPOSITORY } from './repositories/task-status/task-status-repository.interface'
import { TaskStatusRepository } from './repositories/task-status/task-status.repository'
import { SprintModule } from '../sprint/sprint.module'
import { SprintService } from '../sprint/sprint.service'
import { SprintRepository } from '../sprint/repositories/sprint.repository'
import { SPRINT_REPOSITORY } from '../sprint/repositories/sprint-repository.interface'
import { PROJECT_INVITATIONS_REPOSITORY } from './repositories/invitations/project-invitations-repository.interface'
import { ProjectInvitationsRepository } from './repositories/invitations/project-invitations-repository'
import { PROJECT_PERMISSIONS_REPOSITORY } from './repositories/permissions/project-permissions-repository.interface'
import { ProjectPermissionsRepository } from './repositories/permissions/project-permissions-repository'
import { ProjectPermissionsService } from './services/project-permissions/project-permissions.service'
import { NotificationModule } from '../notification/notification.module'

@Module({
  imports: [
    forwardRef(() => AuthModule),
    forwardRef(() => TaskModule),
    forwardRef(() => FolderModule),
    forwardRef(() => UserModule),
    forwardRef(() => WorkspaceModule),
    forwardRef(() => EventsModule),
    forwardRef(() => AsyncJobModule),
    forwardRef(() => PaymentModule),
    forwardRef(() => FileModule),
    forwardRef(() => SprintModule),
    NotificationModule
  ],
  providers: [
    ProjectService,
    ArchivedProjectService,
    TaskStatusService,
    ProjectAuthService,
    Logger,
    ProjectProfile,
    ProjectMover,
    StatusMover,
    ReportService,
    SprintService,
    ProjectPermissionsService,
    { provide: PROJECT_REPOSITORY, useClass: ProjectRepository },
    { provide: PROJECT_INVITATIONS_REPOSITORY, useClass: ProjectInvitationsRepository },
    { provide: REPORT_REPOSITORY, useClass: ReportRepository },
    { provide: TASK_STATUS_REPOSITORY, useClass: TaskStatusRepository },
    { provide: SPRINT_REPOSITORY, useClass: SprintRepository },
    { provide: PROJECT_PERMISSIONS_REPOSITORY, useClass: ProjectPermissionsRepository }
  ],
  controllers: [ProjectController, TaskStatusController, ArchivedProjectController],
  exports: [
    ProjectService,
    ArchivedProjectService,
    PROJECT_REPOSITORY,
    ProjectAuthService,
    TaskStatusService,
    ProjectMover,
    StatusMover,
    ReportService,
    ProjectPermissionsService
  ]
})
export class ProjectModule {}
