import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post
} from '@nestjs/common'
import { Auth } from '../auth/decorators/auth.decorator'
import { GlobalRole } from '../user/access/enum.role'
import { ApiTags } from '@nestjs/swagger'
import { User } from '../auth/decorators/user.decorator'
import { UserModel } from '../user/models/user.model'
import { SprintService } from './sprint.service'
import { CreateSprintDto } from './dto/in/create-sprint.dto'
import { ProjectAuthService } from '../project/auth/project-auth.service'
import { I18nContext, I18nService } from 'nestjs-i18n'
import { ProjectService } from '../project/services/project/project.service'
import { SprintDto } from './dto/out/sprint.dto'
import { InjectMapper } from '@automapper/nestjs'
import { Mapper } from '@automapper/core'
import { SprintModel } from './model/sprint.model'
import { UpdateSprintDto } from './dto/in/update-sprint.dto'
import { TasksSprintDto } from './dto/in/tasks-sprint.dto'
import { ShortSprintDto } from './dto/out/short-sprint.dto'

@Auth(GlobalRole.User)
@ApiTags('sprints')
@Controller('sprints')
export class SprintController {
  constructor(
    @InjectMapper() private readonly mapper: Mapper,
    private readonly sprintService: SprintService,
    private readonly projectService: ProjectService,
    private readonly projectAuthService: ProjectAuthService,
    private readonly i18n: I18nService
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createSprintDto: CreateSprintDto,
    @User() user: UserModel
  ): Promise<ShortSprintDto> {
    const project = await this.projectService.get(createSprintDto.projectId)

    if (!(await this.projectAuthService.canCreateSprints(project, user))) {
      throw new ForbiddenException(this.i18n.t('auth.security.forbidden'))
    }

    const sprint = await this.sprintService.create(createSprintDto, user)

    return this.mapper.map(sprint, SprintModel, ShortSprintDto)
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async get(@Param('id', ParseIntPipe) id: number, @User() user: UserModel): Promise<SprintDto> {
    const sprint = await this.sprintService.get(id)

    return this.mapper.map(sprint, SprintModel, SprintDto)
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSprintDto: UpdateSprintDto,
    @User() user: UserModel
  ): Promise<void> {
    const sprint = await this.sprintService.get(id)

    const project = await this.projectService.get(sprint.projectId)

    if (!(await this.projectAuthService.canUpdateSprints(project, user))) {
      throw new ForbiddenException(
        this.i18n.t('sprint.forbidden', {
          lang: I18nContext.current().lang
        })
      )
    }

    await this.sprintService.update(updateSprintDto, sprint, user)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseIntPipe) id: number, @User() user: UserModel) {
    const sprint = await this.sprintService.get(id)

    const project = await this.projectService.get(sprint.projectId)

    if (!(await this.projectAuthService.canDeleteSprints(project, user))) {
      throw new ForbiddenException(
        this.i18n.t('sprint.forbidden', {
          lang: I18nContext.current().lang
        })
      )
    }

    await this.sprintService.delete(sprint, user)
  }

  @Patch(':id/add/tasks')
  @HttpCode(HttpStatus.OK)
  async addTasks(
    @Param('id', ParseIntPipe) id: number,
    @Body() tasksSprintDto: TasksSprintDto,
    @User() user: UserModel
  ): Promise<void> {
    const sprint = await this.sprintService.get(id)

    const project = await this.projectService.get(sprint.projectId)

    if (!(await this.projectAuthService.canUpdateSprints(project, user))) {
      throw new ForbiddenException(
        this.i18n.t('sprint.forbidden', {
          lang: I18nContext.current().lang
        })
      )
    }

    await this.sprintService.addTasks(sprint, tasksSprintDto, user)
  }

  @Patch(':id/remove/tasks')
  @HttpCode(HttpStatus.OK)
  async removeTasks(
    @Param('id', ParseIntPipe) id: number,
    @Body() tasksSprintDto: TasksSprintDto,
    @User() user: UserModel
  ): Promise<void> {
    const sprint = await this.sprintService.get(id)

    const project = await this.projectService.get(sprint.projectId)

    if (!(await this.projectAuthService.canUpdateSprints(project, user))) {
      throw new ForbiddenException(
        this.i18n.t('sprint.forbidden', {
          lang: I18nContext.current().lang
        })
      )
    }

    await this.sprintService.removeTasks(sprint, tasksSprintDto, user)
  }
}