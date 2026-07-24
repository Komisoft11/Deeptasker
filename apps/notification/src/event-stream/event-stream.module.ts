import { Module } from '@nestjs/common'
import { EventStreamService } from './event-stream.service'
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq'
import { getEventStreamConfig } from '../config/event-stream.config'

@Module({
  imports: [RabbitMQModule.forRootAsync(getEventStreamConfig())],
  providers: [EventStreamService],
  exports: [EventStreamService]
})
export class EventStreamModule {}
