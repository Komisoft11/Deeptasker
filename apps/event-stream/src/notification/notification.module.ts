import { forwardRef, Module } from '@nestjs/common'
import { NotificationService } from './notification.service'
import { EventsModule } from '../events/events.module'

@Module({
  imports: [forwardRef(() => EventsModule)],
  providers: [NotificationService],
  exports: [NotificationService]
})
export class NotificationModule {}
