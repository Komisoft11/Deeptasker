import { Injectable } from '@nestjs/common'
import { generate } from 'random-words'
import { WorkspaceModel } from '../../workspace/models/workspace.model'
import { MyBaseModel } from '../../common/database/base.model'
import { ProjectService } from '../../project/services/project/project.service'
import { TransactionOrKnex } from 'objection'
import { ProjectModel } from '../../project/models/project.model'
import { TaskService } from '../../task/services/task.service'
import { TaskModel } from '../../task/models/task.model'
import { SpecialTaskStatusCode } from '../../task/models/task-status.model'
import { TaskRepository } from '../../task/repositories/task/task.repository'

@Injectable()
export class ProjectGeneratorService {
  private readonly NUM_TASKS = 10000

  constructor(
    private readonly projectService: ProjectService,
    private readonly taskService: TaskService
  ) {}

  public async generate(workspaceId: number): Promise<void> {
    const workspace = await WorkspaceModel.query().findById(workspaceId).withGraphJoined('user')

    if (!workspace) {
      throw new Error('Workspace does not exist: ' + workspaceId)
    }

    let projectName = generate({ exactly: 2, join: ' ' })
    projectName = projectName[0].toUpperCase() + projectName.slice(1)

    const trx = await MyBaseModel.startTransaction()

    try {
      const project = await this.createProject(projectName, workspace, trx)
      await this.createTasks(project, trx)

      await trx.commit()

      console.log(`[+] Created ${this.NUM_TASKS} tasks in project ${projectName}`)
    } catch (e) {
      console.error(e)
      await trx.rollback()
    }
  }

  private async createProject(
    projectName: string,
    workspace: WorkspaceModel,
    trx: TransactionOrKnex
  ): Promise<ProjectModel> {
    return this.projectService.create(
      {
        slug: projectName,
        title: projectName
      },
      workspace,
      workspace.user,
      true,
      trx
    )
  }

  private async createTasks(project: ProjectModel, trx: TransactionOrKnex): Promise<void> {
    let numTotalTasksToCreate = this.NUM_TASKS
    const totalRootTasksToCreate = 100

    if (totalRootTasksToCreate > numTotalTasksToCreate) {
      throw new Error('Total root tasks cannot be more than ' + numTotalTasksToCreate)
    }

    await project.$fetchGraph('user')

    // 100 root tasks
    let promises: Promise<TaskModel>[] = []
    for (let i = 0; i < totalRootTasksToCreate; i++) {
      console.log('Creating task ', i)
      promises.push(
        this.taskService.create(
          {
            projectId: project.id,
            title: generate({ min: 1, max: 10, join: ' ' }),
            content: generate({ exactly: 300, join: ' ' })
          },
          project,
          project.user,
          trx
        )
      )
    }

    const rootTasks = await Promise.all(promises)

    numTotalTasksToCreate -= totalRootTasksToCreate

    const statuses = await project.$relatedQuery('statuses', trx)

    const subtasksPromises = []

    // subtasks
    const minSubtasks = 150
    const maxSubtasks = 300
    for (const task of rootTasks) {
      let numSubtasksToCreate = Math.floor(
        Math.random() * (maxSubtasks - minSubtasks) + minSubtasks
      )
      if (numSubtasksToCreate > numTotalTasksToCreate) {
        numSubtasksToCreate = numTotalTasksToCreate
      }

      const rows = []
      console.log('Creating insert rows for ' + numSubtasksToCreate + ' subtasks')
      for (let i = 0; i < numSubtasksToCreate; i++) {
        const status = statuses[Math.floor(Math.random() * statuses.length)]
        rows.push({
          title: generate({ min: 1, max: 10, join: ' ' }),
          content: generate({ exactly: 300, join: ' ' }),
          projectId: project.id,
          assignerId: project.user.id,
          userId: project.user.id,
          priority: TaskRepository.Priorities.None,
          statusId: status.id,
          executorId:
            status.code === SpecialTaskStatusCode.process ||
            status.code === SpecialTaskStatusCode.review ||
            status.code === SpecialTaskStatusCode.executed
              ? project.userId
              : undefined
        })
      }

      subtasksPromises.push(
        (async () => {
          const tasks = await TaskModel.query(trx).insert([...rows])
          numTotalTasksToCreate -= tasks.length
          console.log(`Created: ${tasks.length} rows. Left: ${numTotalTasksToCreate}`)
        })()
      )
    }

    console.log(
      `Waiting for all ${subtasksPromises.length} promises to finish creating for project ${project.title}...`
    )
    await Promise.all(subtasksPromises)
  }
}
