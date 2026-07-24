import { Injectable } from '@nestjs/common'
import { WebSocket } from 'ws'
import { ResourceSubscriber } from '../events/components/resource-subscriber'
import { EventService } from '../events/event.service'
import { ISubscriberService } from '../events/interfaces/subscriber-service.interface'
import { ISenderService } from '../events/interfaces/sender-service.interface'
import type { EventStreamDto } from '@komisoft/deeptasker-event-stream-types'

@Injectable()
export class WorkspaceService implements ISubscriberService, ISenderService {
  private static readonly WorkspaceSubscriber: ResourceSubscriber = new ResourceSubscriber()

  constructor(private readonly eventService: EventService) {
    this.eventService.addResourceSubscriber(WorkspaceService.WorkspaceSubscriber)
  }

  public async subscribe(clientSocket: WebSocket, workspaceId: number): Promise<void> {
    return this.eventService.subscribe(
      clientSocket,
      WorkspaceService.WorkspaceSubscriber,
      workspaceId
    )
  }

  public send(event: EventStreamDto): void {
    if (!event?.workspace?.id) {
      return
    }

    const userIds = WorkspaceService.WorkspaceSubscriber.getSubscribers(event.workspace.id)

    return this.eventService.send(userIds, event)
  }
}
