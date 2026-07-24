import { Module } from '@nestjs/common'
import { NotificationService } from './notification.service'
import { NotificationController } from './notification.controller'
import { EmailModule } from '@/email/email.module'

@Module({
  imports: [EmailModule],
  controllers: [NotificationController],
  providers: [NotificationService]
})
export class NotificationModule {}
