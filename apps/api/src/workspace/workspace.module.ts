import { forwardRef, Module } from '@nestjs/common'
import { ProjectModule } from '../project/project.module'
import { WorkspaceService } from './services/workspace/workspace.service'
import { WorkspaceController } from './workspace.controller'
import { AuthModule } from '../auth/auth.module'
import { WorkspaceAuthService } from './auth/workspace-auth.service'
import { WorkspaceProfile } from './profiles/workspace.profile'
import { UserModule } from '../user/user.module'
import { EventsModule } from '../events/events.module'
import { PaymentModule } from '../payment/payment.module'
import { WORKSPACE_REPOSITORY } from './repositories/workspace/workspace-repository.interface'
import { WorkspaceRepository } from './repositories/workspace/workspace.repository'
import { WORKSPACE_INVITATIONS_REPOSITORY } from './repositories/invitations/workspace-invitations-repository.interface'
import { WorkspaceInvitationsRepository } from './repositories/invitations/workspace-invitations.repository'
import { AsyncJobModule } from '../async-job/async-job.module'
import { WorkspacePermissionsService } from './services/permissions/workspace-permissions.service'
import { WORKSPACE_PERMISSIONS_REPOSITORY } from './repositories/permissions/workspace-permissions-repository.interface'
import { WorkspacePermissionsRepository } from './repositories/permissions/workspace-permissions-repository'
import { NotificationModule } from '../notification/notification.module'

@Module({
  imports: [
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
    forwardRef(() => ProjectModule),
    forwardRef(() => PaymentModule),
    forwardRef(() => AsyncJobModule),
    EventsModule,
    NotificationModule
  ],
  providers: [
    WorkspaceService,
    WorkspaceAuthService,
    WorkspaceProfile,
    WorkspacePermissionsService,
    { provide: WORKSPACE_REPOSITORY, useClass: WorkspaceRepository },
    { provide: WORKSPACE_INVITATIONS_REPOSITORY, useClass: WorkspaceInvitationsRepository },
    { provide: WORKSPACE_PERMISSIONS_REPOSITORY, useClass: WorkspacePermissionsRepository }
  ],
  controllers: [WorkspaceController],
  exports: [
    WorkspaceService,
    WORKSPACE_REPOSITORY,
    WorkspaceAuthService,
    WorkspacePermissionsService
  ]
})
export class WorkspaceModule {}
