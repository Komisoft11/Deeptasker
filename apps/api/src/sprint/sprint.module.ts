import { forwardRef, Module } from '@nestjs/common'
import { SprintController } from './sprint.controller'
import { SprintService } from './sprint.service'
import { EventsModule } from '../events/events.module'
import { SPRINT_REPOSITORY } from './repositories/sprint-repository.interface'
import { SprintRepository } from './repositories/sprint.repository'
import { AuthModule } from '../auth/auth.module'
import { ProjectModule } from '../project/project.module'
import { UserModule } from '../user/user.module'
import { AsyncJobModule } from '../async-job/async-job.module'
import { SprintProfile } from './profiles/sprint.profile'

@Module({
  imports: [
    forwardRef(() => AuthModule),
    forwardRef(() => ProjectModule),
    forwardRef(() => UserModule),
    forwardRef(() => AsyncJobModule),
    forwardRef(() => EventsModule)
  ],
  controllers: [SprintController],
  providers: [
    SprintService,
    SprintProfile,
    { provide: SPRINT_REPOSITORY, useClass: SprintRepository }
  ],
  exports: [SprintService]
})
export class SprintModule {}
