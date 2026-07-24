import { Injectable } from '@nestjs/common'
import { EventService } from '../events/event.service'
import { ISenderService } from '../events/interfaces/sender-service.interface'
import type { EventStreamDto } from '@komisoft/deeptasker-event-stream-types'

@Injectable()
export class NotificationService implements ISenderService {
  constructor(private readonly eventService: EventService) {}

  public send(event: EventStreamDto): void {
    const receiverId = [event.notification.recipientId]

    return this.eventService.send(receiverId, event)
  }
}
