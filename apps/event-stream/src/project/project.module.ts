import { forwardRef, Module } from '@nestjs/common'
import { ProjectService } from './project.service'
import { EventsModule } from '../events/events.module'
import { ProjectGateway } from './project.gateway'

@Module({
  imports: [forwardRef(() => EventsModule)],
  providers: [ProjectGateway, ProjectService],
  exports: [ProjectService]
})
export class ProjectModule {}
