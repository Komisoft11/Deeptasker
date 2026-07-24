import { forwardRef, Module } from '@nestjs/common'
import { EventService } from './event.service'
import { AuthModule } from '../auth/auth.module'
import { ConsumerController } from './consumer.controller'
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq'
import { ProjectModule } from '../project/project.module'
import { WorkspaceModule } from '../workspace/workspace.module'
import { NotificationModule } from '../notification/notification.module'
import { getRabbitConfig } from '../config'

@Module({
  imports: [
    AuthModule,
    forwardRef(() => WorkspaceModule),
    forwardRef(() => ProjectModule),
    forwardRef(() => NotificationModule),
    RabbitMQModule.forRootAsync(RabbitMQModule, getRabbitConfig())
  ],
  providers: [EventService, ConsumerController],
  exports: [EventService]
})
export class EventsModule {}
