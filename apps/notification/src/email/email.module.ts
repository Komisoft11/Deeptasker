import { Module } from '@nestjs/common'
import { EmailService } from './email.service'
import { ConfigService } from '@nestjs/config'
import { createTransport } from 'nodemailer'
import { getTransportConfig } from '@/config'
import { OtpEmailFactory } from '@/email/email-factory/otp-email.factory'

@Module({
  providers: [
    {
      provide: 'MAIL_TRANSPORTER',
      useFactory: (configService: ConfigService) => {
        return createTransport(getTransportConfig(configService))
      },
      inject: [ConfigService]
    },
    EmailService,
    OtpEmailFactory
  ],
  exports: [EmailService]
})
export class EmailModule {}
