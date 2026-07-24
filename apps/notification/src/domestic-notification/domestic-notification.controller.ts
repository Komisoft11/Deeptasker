import { Controller } from '@nestjs/common'
import { DomesticNotificationService } from './domestic-notification.service'
import {
  Ctx,
  EventPattern,
  GrpcMethod,
  Payload,
  type RmqContext
} from '@nestjs/microservices'
import type {
  DeleteAllNotificationsRequest,
  DeleteNotificationRequest,
  GetUnreadNotificationsCountRequest,
  GetUnreadNotificationsCountResponse,
  GetUserNotificationsRequest,
  GetUserNotificationsResponse,
  MarkReadAllRequest,
  MarkReadRequest,
  UndeleteNotificationRequest
} from '@komisoft/deeptasker-contracts'
import type { NotificationEventType } from '../types'
import { RmqService } from '@/infrastructure/rmq/rmq.service'

@Controller('domestic-notification')
export class DomesticNotificationController {
  constructor(
    private readonly rmqService: RmqService,
    private readonly domesticNotificationService: DomesticNotificationService
  ) {}

  @EventPattern('PUBLISH_DOMESTIC_NOTIFICATION')
  public async publishNotification(
    @Payload() event: NotificationEventType<'PUBLISH_DOMESTIC_NOTIFICATION'>,
    @Ctx() ctx: RmqContext
  ) {
    try {
      await this.domesticNotificationService.publishNotification(event)
      this.rmqService.ack(ctx)
    } catch (e) {
      console.error(e)
      this.rmqService.nack(ctx)
    }
  }

  @GrpcMethod('NotificationsService', 'GetUserNotifications')
  public async getUserNotifications(
    data: GetUserNotificationsRequest
  ): Promise<GetUserNotificationsResponse> {
    return this.domesticNotificationService.getUserNotifications(data)
  }

  @GrpcMethod('NotificationsService', 'GetUnreadNotificationsCount')
  public async getUnreadNotificationsCount(
    data: GetUnreadNotificationsCountRequest
  ): Promise<GetUnreadNotificationsCountResponse> {
    return this.domesticNotificationService.getUnreadNotificationsCount(data)
  }

  @GrpcMethod('NotificationsService', 'MarkRead')
  public async markRead(data: MarkReadRequest): Promise<void> {
    return this.domesticNotificationService.markRead(data)
  }

  @GrpcMethod('NotificationsService', 'MarkReadAll')
  public async markReadAll(data: MarkReadAllRequest): Promise<void> {
    return this.domesticNotificationService.markReadAll(data)
  }

  @GrpcMethod('NotificationsService', 'DeleteNotification')
  public async deleteNotification(
    data: DeleteNotificationRequest
  ): Promise<void> {
    return this.domesticNotificationService.deleteNotification(data)
  }

  @GrpcMethod('NotificationsService', 'UndeleteNotification')
  public async undeleteNotification(
    data: UndeleteNotificationRequest
  ): Promise<void> {
    return this.domesticNotificationService.undeleteNotification(data)
  }

  @GrpcMethod('NotificationsService', 'DeleteAllNotifications')
  public async deleteAllNotifications(
    data: DeleteAllNotificationsRequest
  ): Promise<void> {
    return this.domesticNotificationService.deleteAllNotifications(data)
  }
}
