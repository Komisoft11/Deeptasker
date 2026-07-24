import { Auth } from '../../auth/decorators/auth.decorator'
import { GlobalRole } from '../../user/access/enum.role'
import { ApiTags } from '@nestjs/swagger'
import {
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query
} from '@nestjs/common'
import type { ProjectExtraProperties } from '../services/project/project.service'
import { InjectMapper } from '@automapper/nestjs'
import type { Mapper } from '@automapper/core'
import { ProjectAuthService } from '../auth/project-auth.service'
import { WorkspaceService } from '../../workspace/services/workspace/workspace.service'
import { I18nContext, I18nService } from 'nestjs-i18n'
import { ValidFieldsPipe } from '../../common/pipes/valid-fields.pipe'
import { User } from '../../auth/decorators/user.decorator'
import { ProjectDto } from '../dto/project/out/project.dto'
import { ArchivedProjectService } from '../services/project/archived-project.service'
import { UserModel } from '../../user/models/user.model'
import { TaskResponse } from '../../task/dto'
import { fetchWorkspaceAndCompareWithGiven } from '../components/project.helper'
import { FolderDto } from '../../folder/dto/out/folder.dto'
import { UserShortDto } from '../../common/dto/user-short.dto'

@Auth(GlobalRole.User)
@ApiTags('projects')
@Controller('/workspaces/:workspaceId/archived-projects')
export class ArchivedProjectController {
  constructor(
    private readonly archivedProjectService: ArchivedProjectService,
    @InjectMapper() private readonly mapper: Mapper,
    private readonly projectAuthService: ProjectAuthService,
    private readonly workspaceService: WorkspaceService,
    private readonly i18n: I18nService
  ) {}

  @Get()
  async getAllByUser(
    @Query('fields', new ValidFieldsPipe<ProjectExtraProperties>(['members', 'user']))
    fields: ProjectExtraProperties,
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @User() user: UserModel
  ): Promise<ProjectDto[]> {
    const workspace = await this.workspaceService.getWorkspace(workspaceId) // checking if exists

    return this.archivedProjectService.getProjectsByUser(user, workspace, fields)
  }

  @Get(':id')
  async get(
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Param('id', ParseIntPipe) id: number,
    @User() user: UserModel
  ): Promise<ProjectDto> {
    const workspace = await this.workspaceService.getWorkspace(workspaceId)

    return this.archivedProjectService.getSingleProjectByUser(id, workspace, user)
  }

  @Get(':id/tasks')
  async getTasks(
    @Param('id', ParseIntPipe) id: number,
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @User() user: UserModel
  ): Promise<TaskResponse[]> {
    const project = await this.archivedProjectService.get(id)
    await fetchWorkspaceAndCompareWithGiven(project, workspaceId)

    if (!(await this.projectAuthService.canRead(user, project))) {
      throw new ForbiddenException(
        this.i18n.t('project.forbidden', {
          lang: I18nContext.current().lang
        })
      )
    }

    return this.archivedProjectService.getProjectTasks(project)
  }

  @Get(':id/folders')
  async getFolders(
    @Param('id', ParseIntPipe) id: number,
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @User() user: UserModel
  ): Promise<FolderDto[]> {
    const project = await this.archivedProjectService.get(id)
    await fetchWorkspaceAndCompareWithGiven(project, workspaceId)

    if (!(await this.projectAuthService.canRead(user, project))) {
      throw new ForbiddenException(
        this.i18n.t('project.forbidden', {
          lang: I18nContext.current().lang
        })
      )
    }

    return this.archivedProjectService.getProjectFolders(project, user)
  }

  @Post('return/:id')
  @HttpCode(HttpStatus.OK)
  async returnProject(
    @Param('id', ParseIntPipe) projectId: number,
    @User() user: UserModel
  ): Promise<void> {
    const project = await this.archivedProjectService.get(projectId)

    if (!(await this.projectAuthService.canUpdate(user, project))) {
      throw new ForbiddenException(
        this.i18n.t('project.forbidden', {
          lang: I18nContext.current().lang
        })
      )
    }

    await this.archivedProjectService.returnFromArchive(project, user)
  }

  @Get('/:projectId/members')
  async getMembers(
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Param('projectId', ParseIntPipe) projectId: number,
    @User() user: UserModel
  ): Promise<UserShortDto[]> {
    const project = await this.archivedProjectService.get(projectId)
    await fetchWorkspaceAndCompareWithGiven(project, workspaceId)

    if (!(await this.projectAuthService.canRead(user, project))) {
      throw new ForbiddenException(
        this.i18n.t('project.forbidden', {
          lang: I18nContext.current().lang
        })
      )
    }

    const members = await this.archivedProjectService.getMembers(project)

    return this.mapper.mapArray(members, UserModel, UserShortDto)
  }
}
