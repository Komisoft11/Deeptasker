import { ProjectJobs, Queues } from '../../const'
import { Process, Processor } from '@nestjs/bull'
import { Job } from 'bull'
import { ProjectMover } from '../../../project/components/project-mover'
import { IProjectOrderData } from './project-order.producer.service'
import { UserService } from '../../../user/user.service'
import { ProjectService } from '../../../project/services/project/project.service'
import { EventService } from '../../../events/event.service'
import { waitForJobsToComplete } from '../../job-helper'

@Processor(Queues.PROJECT_ORDER_QUEUE)
export class ProjectOrderConsumer {
  constructor(
    private readonly userService: UserService,
    private readonly projectService: ProjectService,
    private readonly eventService: EventService,
    private readonly projectMover: ProjectMover
  ) {}

  @Process(ProjectJobs.PROJECT_ORDER_JOB)
  async process(job: Job<IProjectOrderData>) {
    await waitForJobsToComplete(job, (j: Job) => j.data.userId === job.data.userId)

    const project = await this.projectService.get(job.data.projectId)
    const user = await this.userService.getUser(job.data.userId)

    await this.projectMover.move(project, { order: job.data.order }, user)

    this.eventService
      .sendEvent({
        userId: user.id,
        project: {
          id: project.id,
          update: {
            parentId: job.data.parentId,
            order: job.data.order
          }
        }
      })
      .then()
      .catch(e => {
        console.error(e)
      })
  }
}
