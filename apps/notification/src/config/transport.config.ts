import { ConfigService } from '@nestjs/config'

export function getTransportConfig(configService: ConfigService) {
  return {
    host: configService.getOrThrow<string>('SMTP_HOST'),
    port: configService.getOrThrow<number>('SMTP_PORT'),
    auth: {
      user: configService.getOrThrow<string>('SMTP_USER'),
      pass: configService.getOrThrow<string>('SMTP_PASSWORD')
    }
  }
}
