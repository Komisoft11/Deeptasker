import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Res
} from '@nestjs/common'
import type { Response } from 'express'
import { TaskService } from '../services/task.service'
import {
  CreateTaskRequest,
  DuplicationTasksRequest,
  ExtendedTaskResponse,
  FinishTaskResponse,
  GenerateTitleRequest,
  RemoveExecutorResponse,
  TaskHistoryResponse,
  TaskResponse,
  TrackingTaskResponse,
  UpdateTaskRequest,
  UpdateTasksStatusRequest,
  UpdateTasksStatusResponse
} from '../dto'
import { Auth } from '../../auth/decorators/auth.decorator'
import { GlobalRole } from '../../user/access/enum.role'
import { User } from '../../auth/decorators/user.decorator'
import { ICreatedRecord } from '../../common/interfaces/created-record.interface'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { ValidatePayloadExistsPipe } from '../../common/helpers/pipes/validate-payload-exists.pipe'
import { I18nContext, I18nService } from 'nestjs-i18n'
import { TaskAuthService } from '../auth/task-auth.service'
import type { Mapper } from '@automapper/core'
import { TaskModel } from '../models/task.model'
import { InjectMapper } from '@automapper/nestjs'
import { ProjectService } from '../../project/services/project/project.service'
import { ProjectAuthService } from '../../project/auth/project-auth.service'
import { TitleGeneratorService } from '../../ai/services/title-generator.service'
import { UserModel } from '../../user/models/user.model'
import { MoveDto } from '../../common/dto/move.dto'
import { TaskHistoryService } from '../services/task-history.service'
import { FolderService } from '../../folder/folder.service'
import { SpecialTaskStatusCode } from '../models/task-status.model'
import { TaskStatusService } from '../../project/services/task-status/task-status.service'
import { getCurrentUTCDateTime } from 'src/common/helpers/date'

@Auth(GlobalRole.User)
@ApiTags('tasks')
@Controller('tasks')
export class TaskController {
  constructor(
    private readonly taskService: TaskService,
    private i18n: I18nService,
    private readonly taskAuthService: TaskAuthService,
    private readonly projectAuthService: ProjectAuthService,
    private readonly projectService: ProjectService,
    private readonly folderService: FolderService,
    @InjectMapper() private readonly mapper: Mapper,
    private readonly titleGenerator: TitleGeneratorService,
    private readonly taskHistoryService: TaskHistoryService,
    private readonly taskStatusService: TaskStatusService
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  public async create(
    @Body() createTaskDto: CreateTaskRequest,
    @User() user: UserModel
  ): Promise<ICreatedRecord> {
    const project = await this.projectService.get(createTaskDto.projectId)

    if (!(await this.taskAuthService.canCreate(user, project, createTaskDto.parentId))) {
      throw new ForbiddenException(
        this.i18n.t('task.forbidden', {
          lang: I18nContext.current().lang
        })
      )
    }

    const task = await this.taskService.create(createTaskDto, project, user)

    return { id: task.id, dateCreated: task.dateCreated, externalId: task.externalId }
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  public async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidatePayloadExistsPipe) updateTaskDto: UpdateTaskRequest,
    @User() user: UserModel
  ): Promise<void> {
    const task = await this.taskService.getTask(id)

    if (!(await this.taskAuthService.canUpdate(user, task, updateTaskDto))) {
      throw new ForbiddenException(
        this.i18n.t('task.forbidden', {
          lang: I18nContext.current().lang
        })
      )
    }

    return this.taskService.update(task, updateTaskDto, user)
  }

  @Get('trackingTask')
  public async trackingTask(
    @User() user: UserModel,
    @Res({ passthrough: true }) res: Response
  ): Promise<TrackingTaskResponse | void> {
    const trackingTask = await this.taskService.trackingTask(user)

    if (trackingTask?.id) {
      return this.mapper.map(trackingTask, TaskModel, TrackingTaskResponse, {
        extraArgs: () => ({ currentUser: user })
      })
    }

    res.status(HttpStatus.NO_CONTENT)
  }

  @Get(':id')
  public async get(
    @Param('id', ParseIntPipe) id: number,
    @User() user: UserModel
  ): Promise<ExtendedTaskResponse> {
    if (!(await this.taskAuthService.canRead(user, id))) {
      throw new ForbiddenException(
        this.i18n.t('task.forbidden', {
          lang: I18nContext.current().lang
        })
      )
    }

    const fullTask = await this.taskService.getFullTask(id)

    return this.mapper.map(fullTask, TaskModel, ExtendedTaskResponse, {
      extraArgs: () => ({ currentUser: user })
    })
  }

  @Get('workspace/:workspaceId/slug/:projectSlug/external/:externalId')
  public async getByExternalId(
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Param('projectSlug') projectSlug: string,
    @Param('externalId') externalId: string,
    @User() user: UserModel
  ): Promise<ExtendedTaskResponse> {
    const task = await this.taskService.getTaskByExternalId(workspaceId, projectSlug, externalId)

    if (!(await this.taskAuthService.canRead(user, task.id))) {
      throw new ForbiddenException(
        this.i18n.t('task.forbidden', {
          lang: I18nContext.current().lang
        })
      )
    }

    const fullTask = await this.taskService.getFullTask(task.id)

    return this.mapper.map(fullTask, TaskModel, ExtendedTaskResponse, {
      extraArgs: () => ({ currentUser: user })
    })
  }

  @Post(':id/return')
  @HttpCode(HttpStatus.OK)
  public async backToWork(@Param('id', ParseIntPipe) id: number, @User() user: UserModel) {
    const task = await this.taskService.getTask(id)

    if (!(await this.taskAuthService.canFinish(user, task))) {
      throw new ForbiddenException(
        this.i18n.t('task.forbidden', {
          lang: I18nContext.current().lang
        })
      )
    }

    return this.taskService.backToWork(id, user)
  }

  @Post(':id/assign/:executorId')
  @HttpCode(HttpStatus.OK)
  public async assign(
    @Param('id', ParseIntPipe) id: number,
    @Param('executorId', ParseIntPipe) executorId: number,
    @User() user: UserModel
  ) {
    const assignedAt = getCurrentUTCDateTime()
    const task = await this.taskService.getTask(id)

    if (!(await this.taskAuthService.modelAuth.canAssign(user, task))) {
      throw new ForbiddenException(
        this.i18n.t('task.forbidden', {
          lang: I18nContext.current().lang
        })
      )
    }

    return this.taskService.assign(task, executorId, assignedAt, user)
  }

  @ApiOperation({
    summary: 'Remove task executor',
    description: 'Remove user from task executor role'
  })
  @ApiOkResponse({
    type: RemoveExecutorResponse
  })
  @Patch(':id/assign')
  @HttpCode(HttpStatus.OK)
  public async removeExecutor(
    @Param('id', ParseIntPipe) id: number,
    @User() user: UserModel
  ): Promise<RemoveExecutorResponse> {
    const reassignedAt = getCurrentUTCDateTime()

    const task = await this.taskService.getTask(id)

    if (!(await this.taskAuthService.modelAuth.canAssign(user, task))) {
      throw new ForbiddenException(
        this.i18n.t('task.forbidden', {
          lang: I18nContext.current().lang
        })
      )
    }

    await this.taskService.removeExecutorWithStatusChange(task, reassignedAt, user)

    return { reassignedAt }
  }

  @Patch(':id/assigner/:assignerId')
  @HttpCode(HttpStatus.OK)
  public async changeAssigner(
    @Param('id', ParseIntPipe) id: number,
    @Param('assignerId', ParseIntPipe) assignerId: number,
    @User() user: UserModel
  ) {
    const task = await this.taskService.getTask(id)

    if (!(await this.taskAuthService.modelAuth.canAssign(user, task))) {
      throw new ForbiddenException(
        this.i18n.t('task.forbidden', {
          lang: I18nContext.current().lang
        })
      )
    }

    return this.taskService.changeAssigner(task, assignerId, user)
  }

  // MOVE: прявязка к новому родителю с отвзякой от старого (если он был)
  @Post(':id/move')
  @HttpCode(HttpStatus.OK)
  public async move(
    @Param('id', ParseIntPipe) taskId: number,
    @Body() moveDto: MoveDto,
    @User() user: UserModel
  ) {
    const task = await this.taskService.getTask(taskId)

    if (!(await this.taskAuthService.canMove(user, task, moveDto.newParentId))) {
      throw new ForbiddenException(
        this.i18n.t('task.forbidden', {
          lang: I18nContext.current().lang
        })
      )
    }

    return this.taskService.moveByQueue(task, moveDto, user.id)
  }

  @Get(':id/history')
  public async getHistory(
    @Param('id', ParseIntPipe) taskId: number,
    @User() user: UserModel
  ): Promise<TaskHistoryResponse[]> {
    if (!(await this.taskAuthService.canRead(user, taskId))) {
      throw new ForbiddenException(
        this.i18n.t('task.forbidden', {
          lang: I18nContext.current().lang
        })
      )
    }

    return this.taskHistoryService.getHistory(taskId)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async delete(@Param('id', ParseIntPipe) id: number, @User() user: UserModel) {
    const deletedAt = getCurrentUTCDateTime()

    const task = await this.taskService.getTask(id)

    if (!(await this.taskAuthService.modelAuth.canDelete(user, task))) {
      throw new ForbiddenException(
        this.i18n.t('task.forbidden', {
          lang: I18nContext.current().lang
        })
      )
    }

    return this.taskService.delete(task, deletedAt, user)
  }

  @Post(':id/change-project/:projectId')
  @HttpCode(HttpStatus.OK)
  public async changeProject(
    @Param('id', ParseIntPipe) taskId: number,
    @Param('projectId', ParseIntPipe) projectId: number,
    @User() user: UserModel
  ) {
    const project = await this.projectService.get(projectId)
    const task = await this.taskService.getTask(taskId)

    if (
      !(await this.taskAuthService.modelAuth.canDelete(user, task)) ||
      !(await this.projectAuthService.canCreateTasks(user, project))
    ) {
      throw new ForbiddenException(
        this.i18n.t('task.forbidden', {
          lang: I18nContext.current().lang
        })
      )
    }

    return this.taskService.changeProject(task, project, user)
  }

  @Post(':id/change-folder/:folderId')
  @HttpCode(HttpStatus.OK)
  public async changeFolder(
    @Param('id', ParseIntPipe) taskId: number,
    @Param('folderId', ParseIntPipe) folderId: number,
    @User() user: UserModel
  ) {
    const task = await this.taskService.getTask(taskId)
    const project = await this.projectService.get(task.projectId)

    if (
      !(await this.taskAuthService.modelAuth.canDelete(user, task)) ||
      !(await this.projectAuthService.canEditFolders(project, user))
    ) {
      throw new ForbiddenException(
        this.i18n.t('task.forbidden', {
          lang: I18nContext.current().lang
        })
      )
    }

    const folder = await this.folderService.getFolder(folderId)

    if (folder.projectId !== project.id) {
      throw new ForbiddenException(
        this.i18n.t('task.not_found', {
          lang: I18nContext.current().lang
        })
      )
    }

    return this.taskService.changeFolder(task, folder, user)
  }

  @Post(':id/remove-folder')
  @HttpCode(HttpStatus.OK)
  public async removeFolder(@Param('id', ParseIntPipe) taskId: number, @User() user: UserModel) {
    const task = await this.taskService.getTask(taskId)
    const project = await this.projectService.get(task.projectId)

    if (
      !(await this.taskAuthService.modelAuth.canDelete(user, task)) ||
      !(await this.projectAuthService.canEditFolders(project, user))
    ) {
      throw new ForbiddenException(
        this.i18n.t('task.forbidden', {
          lang: I18nContext.current().lang
        })
      )
    }

    return this.taskService.removeFolder(task, user)
  }

  @Post('generate-title')
  public async generateTitle(
    @Body() generateTitleDto: GenerateTitleRequest,
    @User() user: UserModel
  ): Promise<string> {
    return this.titleGenerator.generate(generateTitleDto.content)
  }

  @Post(':id/sent-for-review')
  @HttpCode(HttpStatus.OK)
  public async execute(
    @Param('id', ParseIntPipe) taskId: number,
    @User() user: UserModel
  ): Promise<void> {
    const task = await this.taskService.getTask(taskId)

    if (!(await this.taskAuthService.canExecute(user, task))) {
      throw new ForbiddenException(
        this.i18n.t('task.forbidden', {
          lang: I18nContext.current().lang
        })
      )
    }

    return this.taskService.sentForReview(task, user)
  }

  @Post(':id/cancel-review')
  @HttpCode(HttpStatus.OK)
  public async cancel(
    @Param('id', ParseIntPipe) taskId: number,
    @User() user: UserModel
  ): Promise<void> {
    const task = await this.taskService.getTask(taskId)

    if (!(await this.taskAuthService.canExecute(user, task))) {
      throw new ForbiddenException(
        this.i18n.t('task.forbidden', {
          lang: I18nContext.current().lang
        })
      )
    }

    return this.taskService.cancelReview(task, user)
  }

  @Post(':id/confirm')
  @HttpCode(HttpStatus.OK)
  public async confirm(
    @Param('id', ParseIntPipe) taskId: number,
    @User() user: UserModel
  ): Promise<void> {
    const task = await this.taskService.getTask(taskId)

    if (!(await this.taskAuthService.canConfirm(user, task))) {
      throw new ForbiddenException(
        this.i18n.t('task.forbidden', {
          lang: I18nContext.current().lang
        })
      )
    }

    return this.taskService.confirm(task, user)
  }

  @ApiOperation({
    summary: 'Complete a task',
    description: 'Marks the task as completed and change its status into completed too'
  })
  @ApiOkResponse({
    type: FinishTaskResponse
  })
  @Post(':id/finish')
  @HttpCode(HttpStatus.OK)
  public async finish(
    @Param('id', ParseIntPipe) id: number,
    @User() user: UserModel
  ): Promise<FinishTaskResponse> {
    const finishedAt = getCurrentUTCDateTime()
    const task = await this.taskService.getTask(id)

    if (!(await this.taskAuthService.canFinish(user, task))) {
      throw new ForbiddenException(
        this.i18n.t('task.forbidden', {
          lang: I18nContext.current().lang
        })
      )
    }

    await this.taskService.finish(task, user, finishedAt)

    return { finishedAt }
  }

  @ApiOperation({
    summary: 'Move tasks between statuses',
    description:
      'Updates the status of multiple tasks from a source status to a target status within a project'
  })
  @ApiOkResponse({
    type: UpdateTasksStatusResponse
  })
  @Post('update-status')
  @HttpCode(HttpStatus.OK)
  public async updateTasksStatus(
    @Body() updateTasksStatusDto: UpdateTasksStatusRequest,
    @User() user: UserModel
  ): Promise<UpdateTasksStatusResponse> {
    const updatedAt = getCurrentUTCDateTime()

    const tasks = await this.taskService.getTasksByStatus(
      updateTasksStatusDto.sourceStatusId,
      updateTasksStatusDto.projectId
    )

    const status = await this.taskStatusService.get(
      updateTasksStatusDto.targetStatusId,
      updateTasksStatusDto.projectId
    )

    const canUpdateEveryTask = (
      await Promise.all(
        tasks.map(
          task =>
            this.taskAuthService.canUpdate(user, task, updateTasksStatusDto) &&
            task.status.code !== SpecialTaskStatusCode.executed &&
            !task.dateFinished
        )
      )
    ).every(Boolean)

    if (!canUpdateEveryTask) {
      throw new ForbiddenException(
        this.i18n.t('task.forbidden', {
          lang: I18nContext.current().lang
        })
      )
    }

    if (status.code === SpecialTaskStatusCode.executed) {
      await Promise.all(tasks.map(task => this.taskService.finish(task, user, updatedAt)))
    } else {
      await this.taskService.updateTasksStatus(
        tasks,
        updateTasksStatusDto.targetStatusId,
        updateTasksStatusDto.projectId,
        user
      )
    }

    return { updatedAt }
  }

  @Post('duplicate')
  @HttpCode(HttpStatus.OK)
  public async duplicateTasks(
    @Body() duplicationTasksDto: DuplicationTasksRequest,
    @User() user: UserModel
  ): Promise<TaskResponse[]> {
    const project = await this.projectService.get(duplicationTasksDto.projectId)

    if (!(await this.taskAuthService.canCreate(user, project))) {
      throw new ForbiddenException(
        this.i18n.t('task.forbidden', {
          lang: I18nContext.current().lang
        })
      )
    }

    const status = await this.taskStatusService.get(duplicationTasksDto.targetStatusId, project.id)

    if (!status) {
      throw new NotFoundException(this.i18n.t('project.status.not_found'))
    }

    const originalTasks = await this.taskService.getByIds(
      duplicationTasksDto.tasksIds,
      duplicationTasksDto.projectId
    )

    const canDuplicateEveryTask = originalTasks
      .map(
        originalTask =>
          originalTask.status.code !== SpecialTaskStatusCode.executed && !originalTask.dateFinished
      )
      .every(Boolean)

    if (!canDuplicateEveryTask) {
      throw new ForbiddenException(
        this.i18n.t('task.forbidden', {
          lang: I18nContext.current().lang
        })
      )
    }

    const duplicatedTasks = await this.taskService.duplicateTasks(originalTasks, status.id)

    return this.mapper.mapArray(duplicatedTasks, TaskModel, TaskResponse)
  }
}
