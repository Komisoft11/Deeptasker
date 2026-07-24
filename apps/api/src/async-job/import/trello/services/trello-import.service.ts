import { Injectable } from '@nestjs/common'
import { FileService } from '../../../../file/services/file.service'
import streamToString from 'stream-to-string'
import { ITrelloProject } from '../interfaces'
import { ProjectService } from '../../../../project/services/project/project.service'
import { ProjectModel } from '../../../../project/models/project.model'
import { transformToSlug } from '../../../../common/helpers/strings'
import { WorkspaceService } from '../../../../workspace/services/workspace/workspace.service'
import { UserService } from '../../../../user/user.service'
import { UserModel } from '../../../../user/models/user.model'
import { WorkspaceModel } from '../../../../workspace/models/workspace.model'
import { TransactionOrKnex } from 'objection'
import { MyBaseModel } from '../../../../common/database/base.model'
import { TaskStatusService } from '../../../../project/services/task-status/task-status.service'
import { TaskService } from '../../../../task/services/task.service'
import { TaskModel } from '../../../../task/models/task.model'

@Injectable()
export class TrelloImportService {
  constructor(
    private readonly fileService: FileService,
    private readonly projectService: ProjectService,
    private readonly workspaceService: WorkspaceService,
    private readonly userService: UserService,
    private readonly taskStatusService: TaskStatusService,
    private readonly taskService: TaskService
  ) {}

  public async import(fileId: number, workspaceId: number, userId: number) {
    const file = await this.fileService.getFileContent(fileId)

    const workspace = await this.workspaceService.getWorkspace(workspaceId)
    const user = await this.userService.getUser(userId)

    const trelloProject: ITrelloProject = JSON.parse(await streamToString(file))

    const trx = await MyBaseModel.startTransaction()

    try {
      console.log('Creating project')
      const project = await this.createProject(trelloProject.name, workspace, user, trx)
      console.log('Creating statuses')
      const listMap = await this.createStatuses(trelloProject, project, user, trx)
      console.log('Creating tasks')
      const taskMap = await this.createTasks(trelloProject, listMap, project, user, trx)
      console.log('Creating subtasks')
      await this.createSubtasksFromChecklists(trelloProject, taskMap, user, trx)

      console.log('Done')

      await trx.commit()

      console.log('Committed')
    } catch (e) {
      await trx.rollback()
      throw e
    }
  }

  private async createProject(
    name: string,
    workspace: WorkspaceModel,
    user: UserModel,
    trx: TransactionOrKnex
  ): Promise<ProjectModel> {
    return this.projectService.create(
      {
        slug: transformToSlug(name),
        title: name
      },
      workspace,
      user,
      false,
      trx
    )
  }

  private async createStatuses(
    trelloProject: ITrelloProject,
    project: ProjectModel,
    user: UserModel,
    trx: TransactionOrKnex
  ): Promise<Map<string, number>> {
    const listMap = new Map<string, number>()

    for (const list of trelloProject.lists) {
      const taskStatus = await this.taskStatusService.create(
        project,
        { name: list.name },
        user,
        trx
      )
      listMap.set(list.id, taskStatus.id)
    }

    return listMap
  }

  private async createTasks(
    trelloProject: ITrelloProject,
    listMap: Map<string, number>,
    project: ProjectModel,
    user: UserModel,
    trx: TransactionOrKnex
  ): Promise<Map<string, TaskModel>> {
    const taskMap = new Map<string, TaskModel>()

    for (const task of trelloProject.cards) {
      const statusId = listMap.get(task.idList)
      if (!statusId) {
        throw new Error('Could not find list: ' + task.idList)
      }

      const taskModel = await this.taskService.create(
        {
          title: task.name,
          content: task.desc,
          deadlineDate: task.due,
          projectId: project.id,
          statusId
        },
        project,
        user,
        trx
      )

      taskMap.set(task.id, taskModel)
    }

    return taskMap
  }

  private async createSubtasksFromChecklists(
    trelloProject: ITrelloProject,
    taskMap: Map<string, TaskModel>,
    user: UserModel,
    trx: TransactionOrKnex
  ) {
    for (const checklist of trelloProject.checklists) {
      const parentTask = taskMap.get(checklist.idCard)
      if (!parentTask) {
        throw new Error('Parent task not found with card id: ' + checklist.idCard)
      }
      for (const checkItem of checklist.checkItems) {
        let title = checkItem.name
        let content = ''

        if (title.length > 255) {
          title = title.slice(0, title.length / 3) + ' ...'
          content = checkItem.name
        }
        await this.taskService.create(
          {
            title,
            content,
            deadlineDate: checkItem.due,
            projectId: parentTask.projectId,
            statusId: parentTask.statusId,
            parentId: parentTask.id
          },
          parentTask.project,
          user,
          trx
        )
      }
    }
  }
}
