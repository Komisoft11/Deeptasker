import { Injectable } from '@nestjs/common'
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'
import { ConfigService } from '@nestjs/config'
import type { EventStreamDto } from '@komisoft/deeptasker-event-stream-types'

@Injectable()
export class EventStreamService {
  constructor(
    private readonly rabbitConnection: AmqpConnection,
    private readonly configService: ConfigService
  ) {}

  public async sendEvent(event: EventStreamDto) {
    try {
      this.rabbitConnection.publish(
        this.configService.get('RABBITMQ_EVENTS_EXCHANGE') || 'events',
        '',
        event
      )
    } catch (e) {
      console.error('Error publishing event: ', e)
    }
  }
}
