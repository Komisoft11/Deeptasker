import { Queues, ReportJobs } from '../const'
import { Job } from 'bull'
import { TaskExecutionReportService } from '../../report/services/task-execution.report.service'
import { OnQueueActive, OnQueueCompleted, OnQueueFailed, Process, Processor } from '@nestjs/bull'
import { ITaskExecutionReportRequestData } from '../../report/interfaces/report.interface'

@Processor(Queues.REPORT_QUEUE)
export class ReportConsumer {
  constructor(private readonly taskExecutionReportService: TaskExecutionReportService) {}

  @Process(ReportJobs.TASK_REPORT_JOB)
  async process(job: Job<ITaskExecutionReportRequestData>) {
    console.log('Processing job in queue: ' + ReportJobs.TASK_REPORT_JOB)

    await this.taskExecutionReportService.create(job.data)
  }

  @OnQueueActive()
  onActive(job: Job) {
    console.log(`Processing job ${job.id} of type ${job.name} with data ${job.data}...`)
  }

  @OnQueueCompleted()
  async onCompleted(jobId: number, result: any) {
    console.log('On completed: job ', jobId, ' -> result: ', result)
  }

  @OnQueueFailed()
  onFailed(job: Job, err: Error) {
    console.log(`Failed job ${job.id} of type ${job.name} with error ${err.message}...`)
  }
}
