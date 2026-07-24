import { forwardRef, Module } from '@nestjs/common'
import { TaskExecutionReportService } from './services/task-execution.report.service'
import { FileModule } from '../file/file.module'
import { ReportService } from './services/report.service'
import { ReportProfile } from './profiles/report.profile'
import { AsyncJobModule } from '../async-job/async-job.module'
import { ReportController } from './report.controller'
import { ProjectModule } from '../project/project.module'
import { AuthModule } from '../auth/auth.module'
import { REPORT_REPOSITORY } from './repositories/report-repository.interface'
import { ReportRepository } from './repositories/report.repository'
import { TASK_REPOSITORY } from '../task/repositories/task/task-repository.interface'
import { TaskRepository } from '../task/repositories/task/task.repository'
import { EventsModule } from '../events/events.module'

@Module({
  imports: [
    forwardRef(() => AuthModule),
    forwardRef(() => FileModule),
    forwardRef(() => AsyncJobModule),
    forwardRef(() => ProjectModule),
    forwardRef(() => EventsModule)
  ],
  controllers: [ReportController],
  providers: [
    TaskExecutionReportService,
    ReportService,
    ReportProfile,
    { provide: REPORT_REPOSITORY, useClass: ReportRepository },
    { provide: TASK_REPOSITORY, useClass: TaskRepository }
  ],
  exports: [ReportService, TaskExecutionReportService]
})
export class ReportModule {}
