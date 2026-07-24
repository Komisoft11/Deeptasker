import { forwardRef, Global, Module } from '@nestjs/common'
import { ClientsModule } from '@nestjs/microservices'
import { NotificationService } from './notification.service'
import { AuthModule } from '../auth/auth.module'
import { NotificationController } from './notification.controller'
import { getNotificationConfig } from '../config'

@Global()
@Module({
  imports: [forwardRef(() => AuthModule), ClientsModule.registerAsync(getNotificationConfig())],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService]
})
export class NotificationModule {}
