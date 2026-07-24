import { Controller } from '@nestjs/common'
import { NotificationService } from './notification.service'
import { RmqService } from '@/infrastructure/rmq/rmq.service'
import {
  Ctx,
  EventPattern,
  Payload,
  type RmqContext
} from '@nestjs/microservices'
import type { NotificationEventType } from '../types'

@Controller('NOTIFICATION_SERVICE_RMQ')
export class NotificationController {
  constructor(
    private readonly rmqService: RmqService,
    private readonly notificationService: NotificationService
  ) {}

  @EventPattern('OTP_REQUESTED')
  public async otpRequested(
    @Payload() event: NotificationEventType<'OTP_REQUESTED'>,
    @Ctx() ctx: RmqContext
  ) {
    try {
      await this.notificationService.otpRequested(event)
      this.rmqService.ack(ctx)
    } catch (e) {
      this.rmqService.nack(ctx)
    }
  }

  @EventPattern('EMAIL_CHANGE_PROCESSING')
  public async emailChangeProcessing(
    @Payload() event: NotificationEventType<'EMAIL_CHANGE_PROCESSING'>,
    @Ctx() ctx: RmqContext
  ) {
    try {
      await this.notificationService.emailChangeProcessing(event)
      this.rmqService.ack(ctx)
    } catch (e) {
      this.rmqService.nack(ctx)
    }
  }

  @EventPattern('EMAIL_CHANGE_COMPLETED')
  public async emailChangeCompleted(
    @Payload() event: NotificationEventType<'EMAIL_CHANGE_COMPLETED'>,
    @Ctx() ctx: RmqContext
  ) {
    try {
      await this.notificationService.emailChangeCompleted(event)
      this.rmqService.ack(ctx)
    } catch (e) {
      this.rmqService.nack(ctx)
    }
  }

  @EventPattern('PASSWORD_CHANGED')
  public async passwordChanged(
    @Payload() event: NotificationEventType<'PASSWORD_CHANGED'>,
    @Ctx() ctx: RmqContext
  ) {
    try {
      await this.notificationService.passwordChanged(event)
      this.rmqService.ack(ctx)
    } catch (e) {
      this.rmqService.nack(ctx)
    }
  }

  @EventPattern('ACCOUNT_DELETED')
  public async accountDeleted(
    @Payload() event: NotificationEventType<'ACCOUNT_DELETED'>,
    @Ctx() ctx: RmqContext
  ) {
    try {
      await this.notificationService.accountDeleted(event)
      this.rmqService.ack(ctx)
    } catch (e) {
      this.rmqService.nack(ctx)
    }
  }

  @EventPattern('WORKSPACE_INVITATION')
  public async workspaceInvitation(
    @Payload() event: NotificationEventType<'WORKSPACE_INVITATION'>,
    @Ctx() ctx: RmqContext
  ) {
    try {
      await this.notificationService.workspaceInvitation(event)
      this.rmqService.ack(ctx)
    } catch (e) {
      this.rmqService.nack(ctx)
    }
  }

  @EventPattern('PROJECT_INVITATION')
  public async projectInvitation(
    @Payload() event: NotificationEventType<'PROJECT_INVITATION'>,
    @Ctx() ctx: RmqContext
  ) {
    try {
      await this.notificationService.projectInvitation(event)
      this.rmqService.ack(ctx)
    } catch (e) {
      this.rmqService.nack(ctx)
    }
  }

  @EventPattern('UPDATE_POLICY')
  public async updatePolicy(
    @Payload() event: NotificationEventType<'UPDATE_POLICY'>,
    @Ctx() ctx: RmqContext
  ) {
    try {
      await this.notificationService.updatePolicy(event)
      this.rmqService.ack(ctx)
    } catch (e) {
      this.rmqService.nack(ctx)
    }
  }

  @EventPattern('FEEDBACK_REPORT')
  public async feedbackReport(
    @Payload() event: NotificationEventType<'FEEDBACK_REPORT'>,
    @Ctx() ctx: RmqContext
  ) {
    try {
      await this.notificationService.feedbackReport(event)
      this.rmqService.ack(ctx)
    } catch (e) {
      this.rmqService.nack(ctx)
    }
  }

  @EventPattern('BUG_REPORT')
  public async bugReport(
    @Payload() event: NotificationEventType<'BUG_REPORT'>,
    @Ctx() ctx: RmqContext
  ) {
    try {
      await this.notificationService.bugReport(event)
      this.rmqService.ack(ctx)
    } catch (e) {
      this.rmqService.nack(ctx)
    }
  }
}
