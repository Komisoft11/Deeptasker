import { forwardRef, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { BullModule } from '@nestjs/bull'
import { TrelloConsumer } from './import/trello/consumers/trello.consumer'
import { TrelloImportService } from './import/trello/services/trello-import.service'
import { ProjectModule } from '../project/project.module'
import { UserModule } from '../user/user.module'
import { ProjectOrderProducerService } from './project/order/project-order.producer.service'
import { ProjectOrderConsumer } from './project/order/project-order.consumer'
import { EventsModule } from '../events/events.module'
import { ProjectImportService } from './import/project-import.service'
import { TrelloProducerService } from './import/trello/producers/trello.producer.service'
import { FileModule } from '../file/file.module'
import { WorkspaceModule } from '../workspace/workspace.module'
import { TaskModule } from '../task/task.module'
import { TaskOrderConsumer } from './task/order/task-order.consumer'
import { TaskOrderProducerService } from './task/order/task-order.producer.service'
import { ReportModule } from '../report/report.module'
import { ReportProducer } from './report/report.producer'
import { ReportConsumer } from './report/report.consumer'
import { getBullConfig, getBullQueues } from '../config'

@Module({
  imports: [
    ConfigModule,
    BullModule.forRootAsync(getBullConfig()),
    BullModule.registerQueue(...getBullQueues()),
    forwardRef(() => ProjectModule),
    forwardRef(() => UserModule),
    forwardRef(() => EventsModule),
    FileModule,
    forwardRef(() => WorkspaceModule),
    forwardRef(() => TaskModule),
    ReportModule
  ],
  providers: [
    ProjectOrderConsumer,
    TaskOrderConsumer,
    ProjectImportService,
    TrelloConsumer,
    TrelloImportService,
    TrelloProducerService,
    ProjectOrderProducerService,
    TaskOrderProducerService,
    ReportProducer,
    ReportConsumer
  ],
  controllers: [],
  exports: [
    ProjectImportService,
    ProjectOrderProducerService,
    TaskOrderProducerService,
    ReportProducer
  ]
})
export class AsyncJobModule {}
