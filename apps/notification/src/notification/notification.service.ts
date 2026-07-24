import { BadRequestException, Injectable } from '@nestjs/common'
import type { NotificationEventType } from '../types'
import { EmailService } from '@/email/email.service'

@Injectable()
export class NotificationService {
  constructor(private readonly emailService: EmailService) {}

  public async otpRequested(
    event: NotificationEventType<'OTP_REQUESTED'>
  ): Promise<void> {
    if (event.type !== 'OTP_REQUESTED') {
      throw new BadRequestException('Invalid type for OTP_REQUESTED')
    }

    if (event.recipient?.email) {
      await this.emailService.otpRequested(
        event.recipient.email,
        event.payload,
        event.lang
      )
    }
  }

  public async emailChangeProcessing(
    event: NotificationEventType<'EMAIL_CHANGE_PROCESSING'>
  ): Promise<void> {
    if (event.type !== 'EMAIL_CHANGE_PROCESSING') {
      throw new BadRequestException('Invalid type for EMAIL_CHANGE_PROCESSING')
    }

    if (event.recipient?.email) {
      await this.emailService.emailChangeProcessing(
        event.recipient.email,
        event.payload,
        event.lang
      )
    }
  }

  public async emailChangeCompleted(
    event: NotificationEventType<'EMAIL_CHANGE_COMPLETED'>
  ): Promise<void> {
    if (event.type !== 'EMAIL_CHANGE_COMPLETED') {
      throw new BadRequestException('Invalid type for EMAIL_CHANGE_COMPLETED')
    }

    if (event.recipient?.emails.length) {
      await Promise.all(
        event.recipient.emails.map((email) =>
          this.emailService.emailChangeCompleted(
            email,
            event.payload,
            event.lang
          )
        )
      )
    }
  }

  public async passwordChanged(
    event: NotificationEventType<'PASSWORD_CHANGED'>
  ) {
    if (event.type !== 'PASSWORD_CHANGED') {
      throw new BadRequestException('Invalid type for PASSWORD_CHANGED')
    }

    if (event.recipient?.emails.length) {
      await Promise.all(
        event.recipient.emails.map((email) =>
          this.emailService.passwordChanged(email, event.payload, event.lang)
        )
      )
    }
  }

  public async accountDeleted(event: NotificationEventType<'ACCOUNT_DELETED'>) {
    if (event.type !== 'ACCOUNT_DELETED') {
      throw new BadRequestException('Invalid type for ACCOUNT_DELETED')
    }

    if (event.recipient?.emails.length) {
      await Promise.all(
        event.recipient.emails.map((email) =>
          this.emailService.accountDeleted(email, event.payload, event.lang)
        )
      )
    }
  }

  public async workspaceInvitation(
    event: NotificationEventType<'WORKSPACE_INVITATION'>
  ) {
    if (event.type !== 'WORKSPACE_INVITATION') {
      throw new BadRequestException('Invalid type for WORKSPACE_INVITATION')
    }

    if (event.recipient?.email) {
      await this.emailService.workspaceInvitation(
        event.recipient.email,
        event.payload,
        event.lang
      )
    }
  }

  public async projectInvitation(
    event: NotificationEventType<'PROJECT_INVITATION'>
  ) {
    if (event.type !== 'PROJECT_INVITATION') {
      throw new BadRequestException('Invalid type for PROJECT_INVITATION')
    }

    if (event.recipient?.email) {
      await this.emailService.projectInvitation(
        event.recipient.email,
        event.payload,
        event.lang
      )
    }
  }

  public async updatePolicy(event: NotificationEventType<'UPDATE_POLICY'>) {
    if (event.type !== 'UPDATE_POLICY') {
      throw new BadRequestException('Invalid type for UPDATE_POLICY')
    }

    if (event.recipient?.email) {
      await this.emailService.updatePolicy(
        event.recipient.email,
        event.payload,
        event.lang
      )
    }
  }

  public async feedbackReport(event: NotificationEventType<'FEEDBACK_REPORT'>) {
    if (event.type !== 'FEEDBACK_REPORT') {
      throw new BadRequestException('Invalid type for FEEDBACK_REPORT')
    }

    if (event.recipient?.email) {
      await this.emailService.feedbackReport()
    }
  }

  public async bugReport(event: NotificationEventType<'BUG_REPORT'>) {
    if (event.type !== 'BUG_REPORT') {
      throw new BadRequestException('Invalid type for BUG_REPORT')
    }

    if (event.recipient?.email) {
      await this.emailService.bugReport()
    }
  }
}
