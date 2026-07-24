import { Module } from '@nestjs/common'
import { DomesticNotificationService } from './domestic-notification.service'
import { DomesticNotificationController } from './domestic-notification.controller'
import { PrismaModule } from '../prisma/prisma.module'
import { RmqModule } from '@/infrastructure/rmq/rmq.module'
import { EventStreamModule } from '../event-stream/event-stream.module'

@Module({
  imports: [PrismaModule, RmqModule, EventStreamModule],
  controllers: [DomesticNotificationController],
  providers: [DomesticNotificationService]
})
export class DomesticNotificationModule {}
