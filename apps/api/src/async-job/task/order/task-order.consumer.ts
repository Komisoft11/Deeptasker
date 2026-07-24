import { Queues, TaskJobs } from '../../const'
import { Process, Processor } from '@nestjs/bull'
import { Job } from 'bull'
import { UserService } from '../../../user/user.service'
import { EventService } from '../../../events/event.service'
import { waitForJobsToComplete } from '../../job-helper'
import { ITaskOrderData } from './task-order.producer.service'
import { TaskMover } from '../../../task/components/task-mover'
import { TaskService } from '../../../task/services/task.service'

@Processor(Queues.TASK_ORDER_QUEUE)
export class TaskOrderConsumer {
  constructor(
    private readonly userService: UserService,
    private readonly taskService: TaskService,
    private readonly eventService: EventService,
    private readonly taskMover: TaskMover
  ) {}

  @Process(TaskJobs.TASK_ORDER_JOB)
  async process(job: Job<ITaskOrderData>) {
    await waitForJobsToComplete(job, (j: Job) => j.data.userId === job.data.userId)

    const task = await this.taskService.getTask(job.data.taskId)
    const user = await this.userService.getUser(job.data.userId)

    if (job.data.type === 'move') {
      await this.taskMover.move(
        task,
        {
          newParentId: job.data.newParentId,
          customOrder: job.data.customOrder
        },
        job.data.trx
      )
    }

    if (job.data.type === 'reorder') {
      await this.taskMover.reorder(task, job.data.customOrder, job.data.trx)
    }

    this.eventService
      .sendEvent({
        project: {
          id: task.projectId,
          task: {
            id: task.id,
            update: {
              customOrder: job.data.customOrder
            }
          }
        },
        userId: user.id
      })
      .then()
      .catch(e => {
        console.error(e)
      })
  }
}
