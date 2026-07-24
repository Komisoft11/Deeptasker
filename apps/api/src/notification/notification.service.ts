import { Inject, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common'
import { ClientGrpc, ClientProxy } from '@nestjs/microservices'
import type { NotificationEventType, NotificationMessage, NotificationType } from './types'
import type {
  DeleteAllNotificationsRequest,
  DeleteNotificationRequest,
  GetUnreadNotificationsCountRequest,
  GetUserNotificationsRequest,
  MarkReadAllRequest,
  MarkReadRequest,
  NotificationsServiceClient,
  UndeleteNotificationRequest
} from '@komisoft/deeptasker-contracts'
import { firstValueFrom } from 'rxjs'
import dayjs from 'dayjs'
import { NOTIFICATION_SERVICE_GRPC, NOTIFICATION_SERVICE_RMQ } from '../config'
import * as grpc from '@grpc/grpc-js'
import { InternalServerErrorException } from '@nestjs/common/exceptions/internal-server-error.exception'

@Injectable()
export class NotificationService implements OnModuleInit {
  private grpcService: NotificationsServiceClient
  constructor(
    @Inject(NOTIFICATION_SERVICE_RMQ) private readonly clientProxy: ClientProxy,
    @Inject(NOTIFICATION_SERVICE_GRPC) private readonly clientGrpc: ClientGrpc
  ) {}

  onModuleInit() {
    this.grpcService = this.clientGrpc.getService('NotificationsService')
  }

  public async getUserNotifications(
    request: GetUserNotificationsRequest
  ): Promise<NotificationMessage[]> {
    const { notifications } = await firstValueFrom(this.grpcService.getUserNotifications(request))

    if (!notifications || !notifications.length) {
      return []
    }

    return notifications.map(notification => {
      return {
        uuid: notification.uuid,
        dateCreated: dayjs(notification.dateCreated).toDate(),
        isRead: Boolean(notification.dateRead),
        ...notification.payload
      } as NotificationMessage
    })
  }

  public async getUnreadNotificationsCount(request: GetUnreadNotificationsCountRequest) {
    const res = await firstValueFrom(this.grpcService.getUnreadNotificationsCount(request))
    return res.count
  }

  public async markRead(request: MarkReadRequest) {
    try {
      await firstValueFrom(this.grpcService.markRead(request))
    } catch (e) {
      if ((e.code = grpc.status.NOT_FOUND)) {
        throw new NotFoundException('Notification was not found')
      }
      throw new InternalServerErrorException(e)
    }
  }

  public async markReadAll(request: MarkReadAllRequest) {
    try {
      await firstValueFrom(this.grpcService.markReadAll(request))
    } catch (e) {
      if ((e.code = grpc.status.NOT_FOUND)) {
        throw new NotFoundException('Notification was not found')
      }
      throw new InternalServerErrorException(e)
    }
  }

  public async deleteNotification(request: DeleteNotificationRequest) {
    try {
      await firstValueFrom(this.grpcService.deleteNotification(request))
    } catch (e) {
      if ((e.code = grpc.status.NOT_FOUND)) {
        throw new NotFoundException('Notification was not found')
      }
      throw new InternalServerErrorException(e)
    }
  }

  public async undeleteNotification(request: UndeleteNotificationRequest) {
    try {
      await firstValueFrom(this.grpcService.undeleteNotification(request))
    } catch (e) {
      if ((e.code = grpc.status.NOT_FOUND)) {
        throw new NotFoundException('Notification was not found')
      }
      throw new InternalServerErrorException(e)
    }
  }

  public async deleteAllNotifications(request: DeleteAllNotificationsRequest) {
    try {
      await firstValueFrom(this.grpcService.deleteAllNotifications(request))
    } catch (e) {
      if ((e.code = grpc.status.NOT_FOUND)) {
        throw new NotFoundException('Notification was not found')
      }
      throw new InternalServerErrorException(e)
    }
  }

  public async publishNotification(dto: NotificationEventType<NotificationType>): Promise<void> {
    this.clientProxy.emit(dto.type, dto)
  }
}
