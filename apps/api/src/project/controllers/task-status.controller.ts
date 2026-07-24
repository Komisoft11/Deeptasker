import { Auth } from '../../auth/decorators/auth.decorator'
import { GlobalRole } from '../../user/access/enum.role'
import { ApiTags } from '@nestjs/swagger'
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
  Post
} from '@nestjs/common'
import { ProjectService } from '../services/project/project.service'
import { InjectMapper } from '@automapper/nestjs'
import type { Mapper } from '@automapper/core'
import { ProjectAuthService } from '../auth/project-auth.service'
import { I18nContext, I18nService } from 'nestjs-i18n'
import { User } from '../../auth/decorators/user.decorator'
import { CreateStatusDto } from '../dto/task-status/in/create-status.dto'
import { TaskStatusService } from '../services/task-status/task-status.service'
import { TaskStatusModel } from '../../task/models/task-status.model'
import { UpdateStatusDto } from '../dto/task-status/in/update-status.dto'
import { UserModel } from '../../user/models/user.model'
import { CreateDuplicateTaskStatusDto } from '../dto/task-status/in/create-duplicate-task-status.dto'
import { DuplicatedTaskStatusDto } from '../dto/task-status/out/duplicate-task-status.dto'
import { TaskModel } from '../../task/models/task.model'
import { TaskResponse } from '../../task/dto'
import { getCurrentUTCDateTime } from '../../common/helpers/date'

@Auth(GlobalRole.User)
@ApiTags('task-status')
@Controller('/workspaces/:workspaceId/projects/:projectId/status')
export class TaskStatusController {
  constructor(
    private readonly projectService: ProjectService,
    private readonly taskStatusService: TaskStatusService,
    @InjectMapper() private readonly mapper: Mapper,
    private readonly projectAuthService: ProjectAuthService,
    private readonly i18n: I18nService
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  public async create(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() createProjectDto: CreateStatusDto,
    @User() user: UserModel
  ) {
    const project = await this.projectService.get(projectId)

    if (!(await this.projectAuthService.canCreateStatus(user, project))) {
      throw new ForbiddenException(
        this.i18n.t('project.forbidden', {
          lang: I18nContext.current().lang
        })
      )
    }

    return this.taskStatusService.create(project, createProjectDto, user)
  }

  @Patch(':statusId')
  @HttpCode(HttpStatus.OK)
  public async update(
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('statusId', ParseIntPipe) statusId: number,
    @Body() updateStatusDto: UpdateStatusDto,
    @User() user: UserModel
  ) {
    const project = await this.projectService.get(projectId)

    if (!(await this.projectAuthService.canCreateStatus(user, project))) {
      throw new ForbiddenException(
        this.i18n.t('project.forbidden', {
          lang: I18nContext.current().lang
        })
      )
    }

    const taskStatus = await this.taskStatusService.get(statusId, project.id)
    if (!taskStatus) {
      throw new NotFoundException(this.i18n.t('project.status.not_found'))
    }

    return this.taskStatusService.update(taskStatus, updateStatusDto, user)
  }

  @Delete(':statusId')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deleteStatus(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('statusId', ParseIntPipe) statusId: number,
    @User() user: UserModel
  ) {
    const deletedAt = getCurrentUTCDateTime()

    const project = await this.projectService.get(projectId)

    if (!(await this.projectAuthService.canDeleteStatus(user, project))) {
      throw new ForbiddenException(
        this.i18n.t('project.forbidden', {
          lang: I18nContext.current().lang
        })
      )
    }

    return this.taskStatusService.deleteStatus(project, statusId, deletedAt, user)
  }

  @Get()
  public async get(
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() createProjectDto: CreateStatusDto,
    @User() user: UserModel
  ): Promise<TaskStatusModel[]> {
    const project = await this.projectService.get(projectId)

    if (!(await this.projectAuthService.canRead(user, project))) {
      throw new ForbiddenException(
        this.i18n.t('project.forbidden', {
          lang: I18nContext.current().lang
        })
      )
    }

    return this.taskStatusService.getStatuses(project)
  }

  @Post('duplicate')
  @HttpCode(HttpStatus.OK)
  public async duplicateTaskStatus(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() duplicationTaskStatusDto: CreateDuplicateTaskStatusDto,
    @User() user: UserModel
  ): Promise<DuplicatedTaskStatusDto> {
    const project = await this.projectService.get(projectId)

    if (!(await this.projectAuthService.canCreateStatus(user, project))) {
      throw new ForbiddenException(
        this.i18n.t('project.forbidden', {
          lang: I18nContext.current().lang
        })
      )
    }

    const { duplicatedStatus, duplicatedTasks } = await this.taskStatusService.duplicateTaskStatus(
      duplicationTaskStatusDto,
      project,
      user
    )

    return {
      id: duplicatedStatus.id,
      name: duplicatedStatus.name,
      tasksDTOs: this.mapper.mapArray(duplicatedTasks, TaskModel, TaskResponse)
    }
  }
}
