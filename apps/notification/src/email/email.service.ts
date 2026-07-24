import { Inject, Injectable } from '@nestjs/common'
import { type Transporter } from 'nodemailer'
import { OtpEmailFactory } from '@/email/email-factory/otp-email.factory'
import { ConfigService } from '@nestjs/config'
import {
  AccountDeletedPayload,
  BaseLocale,
  EmailChangeCompletedPayload,
  EmailChangeProcessingPayload,
  InvitationLocale,
  NoticeLocale,
  OtpRequestedPayload,
  PasswordChangedPayload,
  ProjectInvitationPayload,
  UpdatePolicyPayload,
  WorkspaceInvitationPayload
} from '@/email/types'
import type { Lang } from '../types'
import { render } from '@react-email/components'
import ChangedEmailProcessEmail from '@/email/emails/notice/changed-email-process-email'
import ChangedEmailCompletedEmail from '@/email/emails/notice/changed-email-completed-email'
import PasswordChangedEmail from '@/email/emails/notice/password-changed-email'
import DeleteAccountEmail from '@/email/emails/notice/delete-account-email'
import ProjectInvitationEmail from '@/email/emails/invitation/project-invitation-email'
import WorkspaceInvitationEmail from '@/email/emails/invitation/workspace-invitation-email'
import { I18nService } from 'nestjs-i18n'
import UpdatePolicyEmail, {
  UpdatePolicyLocale
} from '@/email/emails/notice/update-policy-email'

@Injectable()
export class EmailService {
  constructor(
    @Inject('MAIL_TRANSPORTER')
    private readonly transporter: Transporter,
    private readonly configService: ConfigService,
    private readonly otpEmailFactory: OtpEmailFactory,
    private readonly i18nService: I18nService
  ) {}

  public async otpRequested(
    recipient: string,
    payload: OtpRequestedPayload,
    lang: Lang
  ) {
    const { html, subject } = await this.otpEmailFactory.createEmail(
      payload,
      lang
    )

    await this.transporter.sendMail({
      html,
      from: this.configService.getOrThrow<string>('SMTP_USER'),
      to: recipient,
      subject
    })
  }

  public async emailChangeProcessing(
    recipient: string,
    payload: EmailChangeProcessingPayload,
    lang: Lang
  ) {
    const locale = <BaseLocale>this.i18nService.translate('base', { lang })
    const noticeLocale = <NoticeLocale & { explanation: string }>(
      this.i18nService.translate('changed-email-process', { lang })
    )
    const html = await render(
      ChangedEmailProcessEmail({ ...payload, locale, noticeLocale })
    )

    await this.transporter.sendMail({
      html,
      from: this.configService.getOrThrow<string>('SMTP_USER'),
      to: recipient,
      subject: noticeLocale.subject
    })
  }

  public async emailChangeCompleted(
    recipient: string,
    payload: EmailChangeCompletedPayload,
    lang: Lang
  ) {
    const locale = <BaseLocale>this.i18nService.translate('base', { lang })
    const noticeLocale = <NoticeLocale>(
      this.i18nService.translate('changed-email-completed', { lang })
    )
    const html = await render(
      ChangedEmailCompletedEmail({ ...payload, locale, noticeLocale })
    )

    await this.transporter.sendMail({
      html,
      from: this.configService.getOrThrow<string>('SMTP_USER'),
      to: recipient,
      subject: noticeLocale.subject
    })
  }

  public async passwordChanged(
    recipient: string,
    payload: PasswordChangedPayload,
    lang: Lang
  ) {
    const locale = <BaseLocale>this.i18nService.translate('base', { lang })
    const noticeLocale = <NoticeLocale>(
      this.i18nService.translate('password-changed', { lang })
    )
    const html = await render(PasswordChangedEmail({ locale, noticeLocale }))

    await this.transporter.sendMail({
      html,
      from: this.configService.getOrThrow<string>('SMTP_USER'),
      to: recipient,
      subject: noticeLocale.subject
    })
  }

  public async accountDeleted(
    recipient: string,
    payload: AccountDeletedPayload,
    lang: Lang
  ) {
    const locale = <BaseLocale>this.i18nService.translate('base', { lang })
    const noticeLocale = <NoticeLocale>(
      this.i18nService.translate('changed-email-completed', { lang })
    )

    const html = await render(DeleteAccountEmail({ locale, noticeLocale }))

    await this.transporter.sendMail({
      html,
      from: this.configService.getOrThrow<string>('SMTP_USER'),
      to: recipient,
      subject: noticeLocale.subject
    })
  }

  public async workspaceInvitation(
    recipient: string,
    payload: WorkspaceInvitationPayload,
    lang: Lang
  ) {
    const locale = <BaseLocale>this.i18nService.translate('base', { lang })

    const invitationLocale = <InvitationLocale>(
      this.i18nService.translate('workspace-invitation', { lang })
    )

    const html = await render(
      WorkspaceInvitationEmail({ locale, invitationLocale, ...payload })
    )

    await this.transporter.sendMail({
      html,
      from: this.configService.getOrThrow<string>('SMTP_USER'),
      to: recipient,
      subject: 'Deeptasker Invitation Email'
    })
  }

  public async projectInvitation(
    recipient: string,
    payload: ProjectInvitationPayload,
    lang: Lang
  ) {
    const locale = <BaseLocale>this.i18nService.translate('base', { lang })
    const invitationLocale = <InvitationLocale>(
      this.i18nService.translate('project-invitation', { lang })
    )

    const html = await render(
      ProjectInvitationEmail({
        locale,
        invitationLocale,
        ...payload
      })
    )

    await this.transporter.sendMail({
      html,
      from: this.configService.getOrThrow<string>('SMTP_USER'),
      to: recipient,
      subject: invitationLocale.subject
    })
  }

  public async updatePolicy(
    recipient: string,
    payload: UpdatePolicyPayload,
    lang: Lang
  ) {
    const locale = <BaseLocale>this.i18nService.translate('base', { lang })
    const noticeLocale: UpdatePolicyLocale = this.i18nService.translate(
      'updatePolicy',
      {
        lang
      }
    )
    // TODO: updatePolicyLocale
    const html = await render(
      UpdatePolicyEmail({ locale, payload, noticeLocale })
    )

    await this.transporter.sendMail({
      html,
      from: this.configService.getOrThrow<string>('SMTP_USER'),
      to: recipient,
      subject: ''
    })
  }

  public async feedbackReport() {}

  public async bugReport() {}
}
