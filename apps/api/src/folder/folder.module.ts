import { forwardRef, Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { ProjectModule } from '../project/project.module'
import { UserModule } from '../user/user.module'
import { TimerModule } from '../task/timer/timer.module'
import { TaskAccessModule } from '../task/access/task-access.module'
import { WorkspaceModule } from '../workspace/workspace.module'
import { AsyncJobModule } from '../async-job/async-job.module'
import { EventsModule } from '../events/events.module'
import { FOLDER_REPOSITORY } from './repositories/folder-repository.interface'
import { FolderRepository } from './repositories/folder.repository'
import { FolderService } from './folder.service'
import { FolderController } from './folder.controller'
import { FolderProfile } from './profiles/folder.profile'

@Module({
  imports: [
    forwardRef(() => AuthModule),
    forwardRef(() => ProjectModule),
    forwardRef(() => UserModule),
    forwardRef(() => TimerModule),
    forwardRef(() => TaskAccessModule),
    forwardRef(() => WorkspaceModule),
    forwardRef(() => AsyncJobModule),
    EventsModule
  ],
  providers: [
    FolderService,
    FolderProfile,
    { provide: FOLDER_REPOSITORY, useClass: FolderRepository }
  ],
  controllers: [FolderController],
  exports: [FolderService]
})
export class FolderModule {}
