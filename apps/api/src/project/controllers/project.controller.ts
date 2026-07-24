import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Res,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common'
import type { Response } from 'express'
import { CreateProjectDto } from '../dto/project/in/create-project.dto'
import { UpdateProjectDto } from '../dto/project/in/update-project.dto'
import { ProjectService } from '../services/project/project.service'
import { Auth } from '../../auth/decorators/auth.decorator'
import { GlobalRole } from '../../user/access/enum.role'
import { ApiTags } from '@nestjs/swagger'
import { User } from '../../auth/decorators/user.decorator'
import { TaskResponse } from '../../task/dto'
import type { Mapper } from '@automapper/core'
import { InjectMapper } from '@automapper/nestjs'
import { ProjectModel } from '../models/project.model'
import { UserService } from '../../user/user.service'
import { ProjectDto } from '../dto/project/out/project.dto'
import { ProjectAuthService } from '../auth/project-auth.service'
import { I18nContext, I18nService } from 'nestjs-i18n'
import { WorkspaceAuthService } from '../../workspace/auth/workspace-auth.service'
import { WorkspaceService } from '../../workspace/services/workspace/workspace.service'
import { MoveDto } from '../dto/project/in/move.dto'
import { PermissionsRoleDto } from '../dto/project/in/permissions/permissions-role.dto'
import { ImportDto } from '../dto/project/in/import.dto'
import { FileInterceptor } from '@nestjs/platform-express'
import { maxFileSize } from '../../file/file-storage'
import type { BufferedFile } from '../../file/interfaces/buffered-file.interface'
import { ProjectImportService } from '../../async-job/import/project-import.service'
import { UserModel } from '../../user/models/user.model'
import { fetchWorkspaceAndCompareWithGiven } from '../components/project.helper'
import { UserShortDto } from '../../common/dto/user-short.dto'
import { FolderDto } from '../../folder/dto/out/folder.dto'
import { ReportDto } from '../../report/dto/dto/report.dto'
import { ReportService } from '../../report/services/report.service'
import { SprintService } from '../../sprint/sprint.service'
import { SprintDto } from '../../sprint/dto/out/sprint.dto'
import { MemberInvitationDto } from '../dto/project/out/member-invitee.dto'
import { InviteUserDto } from '../dto/project/in/invite-user.dto'
import { UUID } from 'crypto'
import { CancelInviteUserDto } from '../dto/project/in/cancel-invite-user.dto'
import { ConfigService } from '@nestjs/config'
import { readFileSync } from 'fs'
import path from 'path'

//TODO use workspaceId for all actions to check access

@ApiTags('projects')
@Controller('/workspaces/:workspaceId/projects')
export class ProjectController {
  constructor(
    private readonly projectService: ProjectService,
    @InjectMapper() private readonly mapper: Mapper,
    private readonly projectAuthService: ProjectAuthService,
    private readonly workspaceAuthService: WorkspaceAuthService,
    private readonly workspaceService: WorkspaceService,
    private readonly userService: UserService,
    private readonly i18n: I18nService,
    private readonly projectImportService: ProjectImportService,
    private readonly reportService: ReportService,
    private readonly sprintService: SprintService,
    private readonly configService: ConfigService
  ) {}

  @Auth(GlobalRole.User)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  public async create(
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Body() createProjectDto: CreateProjectDto,
    @User() user: UserModel
  ): Promise<ProjectDto> {
    const workspace = await this.workspaceService.getWorkspace(workspaceId)

    if (!(await this.projectAuthService.canCreateProjects(workspace, user))) {
      throw new ForbiddenException(
        this.i18n.t('workspace.forbidden', {
          lang: I18nContext.current().lang
        })
      )
    }

    const project = await this.projectService.create(createProjectDto, workspace, user)

    const hasInvitees = createProjectDto?.invitees?.length > 0

    if (hasInvitees) {
      await Promise.all(
        createProjectDto.invitees.map(dto =>
          this.projectService.inviteUser(
            project,
            {
              email: dto.email,
              role: dto.role
            },
            user
          )
        )
      )
    }

    return this.mapper.map(project, ProjectModel, ProjectDto)
  }

  @Auth(GlobalRole.User)
  @Patch(':id')
  public async update(
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProjectDto: UpdateProjectDto,
    @User() user: UserModel
  ): Promise<void> {
    const project = await this.projectService.get(id)
    await fetchWorkspaceAndCompareWithGiven(project, workspaceId)

    if (!(await this.projectAuthService.canUpdate(user, project))) {
      throw new ForbiddenException(
        this.i18n.t('project.forbidden', {
          lang: I18nContext.current().lang
        })
      )
    }

    return this.projectService.update(project, updateProjectDto, user)
  }

  @Auth(GlobalRole.User)
  @Delete(':id')
  public async delete(
    @Param('id', ParseIntPipe) id: number,
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @User() user: UserModel
  ): Promise<void> {
    const project = await this.projectService.get(id)
    await fetchWorkspaceAndCompareWithGiven(project, workspaceId)

    if (!(await this.projectAuthService.canDelete(user, project))) {
      throw new ForbiddenException(
        this.i18n.t('project.forbidden', {
          lang: I18nContext.current().lang
        })
      )
    }

    return this.projectService.delete(project, user)
  }

  @Auth(GlobalRole.User)
  @Get()
  public async getAllByUser(
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @User() user: UserModel
  ): Promise<ProjectDto[]> {
    const workspace = await this.workspaceService.getWorkspace(workspaceId) // checking if ws exists

    return this.projectService.getProjectsByUser(user, workspace)
  }

  @Auth(GlobalRole.User)
  @Get(':id/tasks')
  public async getTasks(
    @Param('id', ParseIntPipe) id: number,
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @User() user: UserModel
  ): Promise<TaskResponse[]> {
    const project = await this.projectService.get(id)
    await fetchWorkspaceAndCompareWithGiven(project, workspaceId)

    if (!(await this.projectAuthService.canRead(user, project))) {
      throw new ForbiddenException(
        this.i18n.t('project.forbidden', {
          lang: I18nContext.current().lang
        })
      )
    }

    return this.projectService.getProjectTasks(project)
  }

  @Auth(GlobalRole.User)
  @Get(':id/folders')
  public async getFolders(
    @Param('id', ParseIntPipe) id: number,
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @User() user: UserModel
  ): Promise<FolderDto[]> {
    const project = await this.projectService.get(id)
    await fetchWorkspaceAndCompareWithGiven(project, workspaceId)

    if (!(await this.projectAuthService.canRead(user, project))) {
      throw new ForbiddenException(
        this.i18n.t('project.forbidden', {
          lang: I18nContext.current().lang
        })
      )
    }

    return this.projectService.getProjectFolders(project, user)
  }

  @Auth(GlobalRole.User)
  @Get(':id')
  public async get(
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Param('id', ParseIntPipe) id: number,
    @User() user: UserModel
  ): Promise<ProjectDto> {
    const workspace = await this.workspaceService.getWorkspace(workspaceId)

    return this.projectService.getSingleProjectByUser(id, workspace, user)
  }

  @Auth(GlobalRole.User)
  @Get('/:projectId/members')
  public async getMembers(
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Param('projectId', ParseIntPipe) projectId: number,
    @User() user: UserModel
  ): Promise<UserShortDto[]> {
    const project = await this.projectService.get(projectId)
    await fetchWorkspaceAndCompareWithGiven(project, workspaceId)

    if (!(await this.projectAuthService.canRead(user, project))) {
      throw new ForbiddenException(
        this.i18n.t('project.forbidden', {
          lang: I18nContext.current().lang
        })
      )
    }

    return this.projectService.getMembers(project)
  }

  @Auth(GlobalRole.User)
  @Get('/:projectId/invitees')
  public async getInvitees(
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Param('projectId', ParseIntPipe) projectId: number,
    @User() user: UserModel
  ): Promise<MemberInvitationDto[]> {
    const project = await this.projectService.get(projectId)
    await fetchWorkspaceAndCompareWithGiven(project, workspaceId)

    if (!(await this.projectAuthService.canRead(user, project))) {
      throw new ForbiddenException(
        this.i18n.t('project.forbidden', {
          lang: I18nContext.current().lang
        })
      )
    }

    return this.projectService.getInvitees(project)
  }

  @Auth(GlobalRole.User)
  @Post(':id/user')
  @HttpCode(HttpStatus.OK)
  public async inviteUser(
    @Param('id', ParseIntPipe) id: number,
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Body() inviteUserDto: InviteUserDto,
    @User() user: UserModel
  ): Promise<void> {
    const project = await this.projectService.get(id)
    await fetchWorkspaceAndCompareWithGiven(project, workspaceId)

    if (!(await this.projectAuthService.canAddUser(user, project))) {
      throw new ForbiddenException(
        this.i18n.t('project.forbidden', {
          lang: I18nContext.current().lang
        })
      )
    }

    const invitee = await this.userService.getUserByEmail(inviteUserDto.email)

    if (await this.projectService.hasProjectAccess(invitee, project.id)) {
      throw new ForbiddenException('User is already member of this project')
    }

    await this.projectService.inviteUser(project, inviteUserDto, user)
  }

  @Auth(GlobalRole.User)
  @Post(':id/user/cancel')
  @HttpCode(HttpStatus.OK)
  public async cancelInviteUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() cancelInviteUserDto: CancelInviteUserDto,
    @User() user: UserModel
  ): Promise<void> {
    const project = await this.projectService.get(id)

    await this.projectService.cancelInviteUser(project, cancelInviteUserDto, user)
  }

  @Get('/accept-invitation/:token')
  @HttpCode(HttpStatus.PERMANENT_REDIRECT)
  public async acceptUserInvitation(
    @Param('token', ParseUUIDPipe) token: UUID,
    @Res({ passthrough: true }) res: Response
  ): Promise<void> {
    try {
      const invitation = await this.projectService.getInvitationByToken(token)

      const isUserRegistered = await this.userService.isUserRegistered(invitation.email)

      if (!isUserRegistered) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .redirect(this.configService.getOrThrow<string>('CLIENT_URL'))
      }

      const url = await this.projectService.acceptUserInvitation(invitation)
      return res.status(HttpStatus.ACCEPTED).redirect(url)
    } catch (e) {
      console.error(e)
      const html = readFileSync(
        path.join('src', 'static', 'accept-invitation-error.html'),
        'utf8'
      ).replace('{{DYNAMIC_LINK}}', this.configService.get('CLIENT_URL'))
      res.setHeader('Content-Type', 'text/html')
      res.status(e.status).send(html)
    }
  }

  @Get('/decline-invitation/:token')
  @HttpCode(HttpStatus.OK)
  public async declineUserInvitation(
    @Param('token', ParseUUIDPipe) token: UUID,
    @Res({ passthrough: true }) res: Response
  ): Promise<void> {
    try {
      const invitation = await this.projectService.getInvitationByToken(token)

      const isUserRegistered = await this.userService.isUserRegistered(invitation.email)

      if (!isUserRegistered) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .redirect(this.configService.getOrThrow<string>('CLIENT_URL'))
      }

      const url = await this.projectService.declineUserInvitation(invitation)

      return res.status(HttpStatus.OK).redirect(url)
    } catch (e) {
      console.error(e)
      const html = readFileSync(
        path.join('src', 'static', 'accept-invitation-error.html'),
        'utf8'
      ).replace('{{DYNAMIC_LINK}}', this.configService.get('CLIENT_URL'))
      res.setHeader('Content-Type', 'text/html')
      res.status(e.status).send(html)
    }
  }

  @Auth(GlobalRole.User)
  @Delete(':id/user/:userId')
  @HttpCode(HttpStatus.OK)
  public async removeUser(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
    @User() user: UserModel
  ): Promise<void> {
    const project = await this.projectService.get(id)

    if (!(await this.projectAuthService.canRemoveUser(user, project))) {
      throw new ForbiddenException(
        this.i18n.t('project.forbidden', {
          lang: I18nContext.current().lang
        })
      )
    }

    const userToRemove = await this.userService.getUser(userId)

    return this.projectService.removeUserFromProject(project, userToRemove, user)
  }

  @Auth(GlobalRole.User)
  @Patch(':id/permissions/:userId')
  @HttpCode(HttpStatus.OK)
  public async editUserProjectPermissions(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Body() projectPermissionsDto: PermissionsRoleDto,
    @User() user: UserModel
  ): Promise<void> {
    const project = await this.projectService.get(id)
    await fetchWorkspaceAndCompareWithGiven(project, workspaceId)

    if (!(await this.projectAuthService.canManageAdmins(user, project))) {
      throw new ForbiddenException(
        this.i18n.t('project.forbidden', {
          lang: I18nContext.current().lang
        })
      )
    }

    const userToEdit = await this.userService.getUser(userId)

    return this.projectService.updateUserPermissions(
      userToEdit,
      project,
      projectPermissionsDto,
      user
    )
  }

  @Auth(GlobalRole.User)
  @Post(':id/move')
  @HttpCode(HttpStatus.ACCEPTED)
  public async move(
    @Param('id', ParseIntPipe) projectId: number,
    @Body() moveDto: MoveDto,
    @User() user: UserModel
  ) {
    const project = await this.projectService.get(projectId)
    return this.projectService.move(project, moveDto, user)
  }

  @Auth(GlobalRole.User)
  @Post('archive/:id')
  @HttpCode(HttpStatus.OK)
  public async archiveProject(
    @Param('id', ParseIntPipe) projectId: number,
    @User() user: UserModel
  ): Promise<void> {
    const project = await this.projectService.get(projectId)

    if (!(await this.projectAuthService.canUpdate(user, project))) {
      throw new ForbiddenException(
        this.i18n.t('project.forbidden', {
          lang: I18nContext.current().lang
        })
      )
    }

    await this.projectService.archive(project, user)
  }

  @Auth(GlobalRole.User)
  @Post('import')
  @HttpCode(HttpStatus.ACCEPTED)
  @UseInterceptors(FileInterceptor('file'))
  public async import(
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Body() importDto: ImportDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: 'json'
        })
        .addMaxSizeValidator({
          maxSize: maxFileSize
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
        })
    )
    file: BufferedFile,
    @User() user: UserModel
  ): Promise<void> {
    const workspace = await this.workspaceService.getWorkspace(workspaceId)
    if (!(await this.workspaceAuthService.canCreateProjects(workspace, user))) {
      throw new ForbiddenException(
        this.i18n.t('workspace.forbidden', {
          lang: I18nContext.current().lang
        })
      )
    }

    await this.projectImportService.import(
      workspace.id,
      {
        file: file,
        customName: 'import_trello_' + workspace.id
      },
      importDto.type,
      user
    )
  }

  @Auth(GlobalRole.User)
  @Get(':id/reports')
  public async getProjectReports(
    @Param('id', ParseIntPipe) projectId: number,
    @User() user: UserModel
  ): Promise<ReportDto[]> {
    if (!(await this.projectAuthService.canListReports(user, projectId))) {
      throw new ForbiddenException('You do not have permission to get reports')
    }

    return this.reportService.getProjectReports(projectId)
  }

  @Auth(GlobalRole.User)
  @Get(':id/sprints')
  public async getProjectSprints(
    @Param('id', ParseIntPipe) projectId: number,
    @User() user: UserModel
  ): Promise<SprintDto[]> {
    const project = await this.projectService.get(projectId)

    if (!(await this.projectAuthService.canRead(user, project))) {
      throw new ForbiddenException(
        this.i18n.t('project.forbidden', {
          lang: I18nContext.current().lang
        })
      )
    }

    return this.sprintService.getSprintsByProject(project.id)
  }
}
