import { Injectable } from '@nestjs/common'
import { ISubscriberService } from '../events/interfaces/subscriber-service.interface'
import { ResourceSubscriber } from '../events/components/resource-subscriber'
import { EventService } from '../events/event.service'
import { WebSocket } from 'ws'
import { ISenderService } from '../events/interfaces/sender-service.interface'
import type { EventStreamDto } from '@komisoft/deeptasker-event-stream-types'

@Injectable()
export class ProjectService implements ISubscriberService, ISenderService {
  private static readonly ProjectSubscriber: ResourceSubscriber = new ResourceSubscriber()

  constructor(private readonly eventService: EventService) {
    this.eventService.addResourceSubscriber(ProjectService.ProjectSubscriber)
  }

  public async subscribe(clientSocket: WebSocket, workspaceId: number) {
    return this.eventService.subscribe(clientSocket, ProjectService.ProjectSubscriber, workspaceId)
  }

  public send(event: EventStreamDto): void {
    if (!event?.project?.id) {
      return
    }

    const userIds = ProjectService.ProjectSubscriber.getSubscribers(event.project.id)

    return this.eventService.send(userIds, event)
  }
}
