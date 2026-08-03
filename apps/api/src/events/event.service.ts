import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { EventStreamDto } from '@komisoft/deeptasker-event-stream-types'

@Injectable()
export class EventService {
  constructor(
    private readonly rabbitConnection: AmqpConnection,
    private readonly configService: ConfigService
  ) {}

	public async sendEvent(event: EventStreamDto) {
		try {
			await this.rabbitConnection.publish(
				this.configService.getOrThrow<string>('RABBITMQ_EVENTS_EXCHANGE'),
				'',
				event
			)
		} catch (e) {
			console.error('Error publishing event: ' , e)
		}
	}
}