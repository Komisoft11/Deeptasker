import { forwardRef, Module } from '@nestjs/common'
import { WorkspaceGateway } from './workspace.gateway'
import { WorkspaceService } from './workspace.service'
import { EventsModule } from '../events/events.module'

@Module({
  imports: [forwardRef(() => EventsModule)],
  providers: [WorkspaceGateway, WorkspaceService],
  exports: [WorkspaceService]
})
export class WorkspaceModule {}
