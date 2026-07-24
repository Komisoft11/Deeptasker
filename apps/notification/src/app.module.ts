import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { RmqModule } from '@/infrastructure/rmq/rmq.module'
import { EmailModule } from '@/email/email.module'
import { NotificationModule } from './notification/notification.module'
import * as path from 'path'
import { AcceptLanguageResolver, I18nModule } from 'nestjs-i18n'
import { DomesticNotificationModule } from './domestic-notification/domestic-notification.module'
import { PrismaModule } from './prisma/prisma.module'
import { EventStreamModule } from './event-stream/event-stream.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true
      },
      resolvers: [AcceptLanguageResolver]
    }),
    RmqModule,
    EmailModule,
    NotificationModule,
    DomesticNotificationModule,
    PrismaModule,
    EventStreamModule
  ]
})
export class AppModule {}
