import { BaseLocale } from '@/email/types/locales/base.type'

export interface TemplateProps {
  locale: BaseLocale
}

export interface TemplateOtpProps extends TemplateProps {
  otp: string
}
