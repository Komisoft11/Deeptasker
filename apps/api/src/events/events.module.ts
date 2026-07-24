import { forwardRef, Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { EventService } from './event.service'
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq'
import { getEventsConfig } from '../config'

@Module({
  imports: [
    forwardRef(() => AuthModule),
    RabbitMQModule.forRootAsync(RabbitMQModule, getEventsConfig())
  ],
  providers: [EventService],
  exports: [EventService]
})
export class EventsModule {}
