import { BadRequestException, Injectable } from '@nestjs/common'
import { render } from '@react-email/components'
import ActivateUserEmail from '@/email/emails/otp/activate-user-email'
import ResetPasswordEmail from '@/email/emails/otp/reset-password-email'
import ChangeEmailEmail from '@/email/emails/otp/change-email-email'
import DeleteAccountEmail from '@/email/emails/otp/delete-account-email'
import type { BaseLocale, OtpLocale, OtpRequestedPayload } from '@/email/types'
import type { Lang } from '../../types'
import { I18nService } from 'nestjs-i18n'

type CreateEmail = {
  html: string
  subject: string
}

@Injectable()
export class OtpEmailFactory {
  constructor(private readonly i18nService: I18nService) {}

  public async createEmail(
    payload: OtpRequestedPayload,
    lang: Lang
  ): Promise<CreateEmail> {
    const locale = <BaseLocale>this.i18nService.translate('base', { lang })
    const { code, otpType } = payload

    if (otpType === 'ACTIVATE_USER') {
      const otpLocale = <OtpLocale>(
        this.i18nService.translate('activation-user', { lang })
      )
      const html = await render(
        ActivateUserEmail({ otp: code, locale, otpLocale })
      )

      return { html, subject: otpLocale.subject }
    }

    if (otpType === 'RESET_PASSWORD') {
      const otpLocale = <OtpLocale>(
        this.i18nService.translate('reset-password', { lang })
      )
      const html = await render(
        ResetPasswordEmail({ otp: code, locale, otpLocale })
      )

      return { html, subject: otpLocale.subject }
    }

    if (otpType === 'CHANGE_EMAIL') {
      const otpLocale = <OtpLocale>(
        this.i18nService.translate('change-email', { lang })
      )
      const html = await render(
        ChangeEmailEmail({ otp: code, locale, otpLocale })
      )

      return { html, subject: otpLocale.subject }
    }

    if (otpType === 'DELETE_ACCOUNT') {
      const otpLocale = <OtpLocale>(
        this.i18nService.translate('delete-account', { lang })
      )
      const html = await render(
        DeleteAccountEmail({ otp: code, locale, otpLocale })
      )

      return { html, subject: otpLocale.subject }
    }

    throw new BadRequestException('Can not get type of otp request')
  }
}
