import { RabbitPayload, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq'
import { BadRequestException, Injectable, ValidationPipe } from '@nestjs/common'
import { getQueueName } from '../auth/utils/queue'
import { ProjectService } from '../project/project.service'
import { WorkspaceService } from '../workspace/workspace.service'
import { NotificationService } from '../notification/notification.service'
import type { EventStreamDto } from '@komisoft/deeptasker-event-stream-types'

@Injectable()
export class ConsumerController {
  constructor(
    private readonly projectService: ProjectService,
    private readonly workspaceService: WorkspaceService,
    private readonly notificationService: NotificationService
  ) {}

  // TODO add logging of validation errors, exceptionFactory may not work
  @RabbitSubscribe({
    exchange: process.env.RABBIT_EVENTS_EXCHANGE ?? 'events',
    queue: getQueueName(),
    routingKey: getQueueName(),
    queueOptions: {
      durable: false,
      exclusive: true,
      messageTtl: 10 * 60 * 60
    }
  })
  public async handleEvents(
    @RabbitPayload(
      new ValidationPipe({
        exceptionFactory: function (errors) {
          console.log(errors)
          return new BadRequestException(errors)
        }
      })
    )
    event: EventStreamDto
  ) {
    return this.factorySendEvent(event)
  }

  public async factorySendEvent(event: EventStreamDto): Promise<void> {
    if (event.workspace) {
      this.workspaceService.send(event)
    }

    if (event.project) {
      this.projectService.send(event)
    }

    if (event.notification) {
      this.notificationService.send(event)
    }
  }
}
