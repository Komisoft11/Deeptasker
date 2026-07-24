import { UserProfile } from './profile/user.profile'
import { forwardRef, Logger, Module } from '@nestjs/common'
import { UserController } from './user.controller'
import { UserService } from './user.service'
import { AuthModule } from '../auth/auth.module'
import { UserRepository } from './repositories/user/user.repository'
import { ProjectModule } from '../project/project.module'
import { UserAuthService } from './auth/user-auth.service'
import { AsyncJobModule } from '../async-job/async-job.module'
import { TaskModule } from '../task/task.module'
import { USER_REPOSITORY } from './repositories/user/user-repository.interface'
import { VerificationModule } from '../verification/verification.module'
import { PENDING_EMAIL_UPDATES_REPOSITORY } from './repositories/pending-email-updates/pending-email-updates-repository.interface'
import { PendingEmailUpdatesRepository } from './repositories/pending-email-updates/pending-email-updates.repository'
import { WorkspaceModule } from '../workspace/workspace.module'
import { NotificationModule } from '../notification/notification.module'
import { PoliciesModule } from '../policies/policies.module'

@Module({
  imports: [
    forwardRef(() => AuthModule),
    forwardRef(() => AsyncJobModule),
    forwardRef(() => ProjectModule),
    forwardRef(() => TaskModule),
    forwardRef(() => VerificationModule),
    forwardRef(() => WorkspaceModule),
    forwardRef(() => ProjectModule),
    forwardRef(() => ProjectModule),
    PoliciesModule,
    NotificationModule
  ],
  controllers: [UserController],
  providers: [
    UserService,
    UserAuthService,
    Logger,
    UserProfile,
    { provide: USER_REPOSITORY, useClass: UserRepository },
    { provide: PENDING_EMAIL_UPDATES_REPOSITORY, useClass: PendingEmailUpdatesRepository }
  ],
  exports: [UserService]
})
export class UserModule {}
