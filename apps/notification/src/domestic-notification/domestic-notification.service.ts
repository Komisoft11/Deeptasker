import { Injectable } from '@nestjs/common'
import {
  DeleteAllNotificationsRequest,
  DeleteNotificationRequest,
  GetUnreadNotificationsCountRequest,
  GetUnreadNotificationsCountResponse,
  GetUserNotificationsRequest,
  GetUserNotificationsResponse,
  MarkReadAllRequest,
  MarkReadRequest,
  Notification,
  UndeleteNotificationRequest
} from '@komisoft/deeptasker-contracts'
import { PrismaService } from '../prisma/prisma.service'
import type { NotificationEventType } from '../types'
import { EventStreamService } from '../event-stream/event-stream.service'
import { Prisma } from '../generated/prisma/client'
import { RpcException } from '@nestjs/microservices'
import * as grpc from '@grpc/grpc-js'
import { convertDateToString } from '../common/date/convertDateToString'

@Injectable()
export class DomesticNotificationService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly eventStreamService: EventStreamService
  ) {}

  public async publishNotification(
    event: NotificationEventType<'PUBLISH_DOMESTIC_NOTIFICATION'>
  ) {
    const senderId = event.sender.userId
    const recipientId = event.recipient.userId

    const notification = await this.prismaService.notification.create({
      data: {
        senderId: senderId,
        recipientId: recipientId,
        payload: event.payload.message as any
      }
    })

    const unreadNotificationsCount = await this.getUnreadNotificationsCount({
      userId: recipientId
    })

    this.eventStreamService.sendEvent({
      userId: senderId,
      notification: {
        countUnread: unreadNotificationsCount.count,
        recipientId: recipientId,
        create: {
          uuid: notification.uuid,
          dateCreated: notification.dateCreated
        }
      }
    })
  }

  public async getUserNotifications(
    data: GetUserNotificationsRequest
  ): Promise<GetUserNotificationsResponse> {
    const skip = data.offset || 0
    const take = data.offset || 50

    const notifications = await this.prismaService.notification.findMany({
      where: { recipientId: data.userId, dateDeleted: null },
      skip,
      take
    })

    if (!notifications || !notifications.length) {
      return { notifications: [] }
    }

    return {
      notifications: notifications.map(
        (n) =>
          ({
            id: n.id,
            uuid: n.uuid,
            recipientId: n.recipientId,
            senderId: n.senderId,
            payload: n.payload,
            dateCreated: convertDateToString(n.dateCreated),
            dateRead: convertDateToString(n.dateCreated)
          }) as Notification
      )
    }
  }

  public async getUnreadNotificationsCount(
    data: GetUnreadNotificationsCountRequest
  ): Promise<GetUnreadNotificationsCountResponse> {
    const count = await this.prismaService.notification.count({
      where: { recipientId: data.userId, dateDeleted: null, dateRead: null }
    })

    return { count }
  }

  public async markRead(data: MarkReadRequest) {
    try {
      await this.prismaService.notification.update({
        where: { recipientId: data.userId, uuid: data.uuid },
        data: { dateRead: new Date() }
      })
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2025') {
          throw new RpcException({
            code: grpc.status.NOT_FOUND,
            message: `Notification with UUID: ${data.uuid} was not found.`
          })
        }
      }
    }
  }

  public async markReadAll(data: MarkReadAllRequest) {
    try {
      await this.prismaService.notification.updateMany({
        where: {
          recipientId: data.userId,
          dateRead: null,
          dateDeleted: null
        },
        data: { dateRead: new Date() }
      })
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2025') {
          throw new RpcException({
            code: grpc.status.NOT_FOUND,
            message: `Notifications with recipient: ${data.userId} was not found.`
          })
        }
      }
    }
  }

  public async deleteNotification(data: DeleteNotificationRequest) {
    try {
      await this.prismaService.notification.update({
        where: { recipientId: data.userId, uuid: data.uuid, dateDeleted: null },
        data: { dateDeleted: new Date() }
      })
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2025') {
          throw new RpcException({
            code: grpc.status.NOT_FOUND,
            message: `Notification with UUID: ${data.uuid} was not found.`
          })
        }
      }
    }
  }

  public async undeleteNotification(data: UndeleteNotificationRequest) {
    try {
      await this.prismaService.notification.update({
        where: { recipientId: data.userId, uuid: data.uuid },
        data: { dateDeleted: null }
      })
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2025') {
          throw new RpcException({
            code: grpc.status.NOT_FOUND,
            message: `Notification with UUID: ${data.uuid} was not found.`
          })
        }
      }
    }
  }

  public async deleteAllNotifications(data: DeleteAllNotificationsRequest) {
    try {
      await this.prismaService.notification.updateMany({
        where: { recipientId: data.userId, dateDeleted: null },
        data: { dateDeleted: new Date() }
      })
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2025') {
          throw new RpcException({
            code: grpc.status.NOT_FOUND,
            message: `Notifications with recipient: ${data.userId} was not found.`
          })
        }
      }
    }
  }
}
