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
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Res
} from '@nestjs/common'
import {
  type WorkspaceExtraProperties,
  WorkspaceService
} from './services/workspace/workspace.service'
import { ICreatedRecord } from '../common/interfaces/created-record.interface'
import { User } from '../auth/decorators/user.decorator'
import { UserModel } from '../user/models/user.model'
import { Auth } from '../auth/decorators/auth.decorator'
import { GlobalRole } from '../user/access/enum.role'
import { ApiTags } from '@nestjs/swagger'
import { CreateWorkspaceDto } from './dto/in/create-workspace.dto'
import { WorkspaceAuthService } from './auth/workspace-auth.service'
import { I18nContext, I18nService } from 'nestjs-i18n'
import { WorkspaceDto } from './dto/out/workspace.dto'
import { Mapper } from '@automapper/core'
import { InjectMapper } from '@automapper/nestjs'
import { WorkspaceModel } from './models/workspace.model'
import { UpdateWorkspaceDto } from './dto/in/update-workspace.dto'
import { UserService } from '../user/user.service'
import { ValidFieldsPipe } from '../common/pipes/valid-fields.pipe'
import { WorkspacePermissionsDto } from './dto/in/workspace-permissions.dto'
import { UserDto } from '../user/dto/out/user.dto'
import { UUID } from 'crypto'
import { InviteAdminDto } from './dto/in/invite-admin.dto'
import { WorkspaceInvitationsModel } from './models/workspace-invitations.model'
import { AdminInviteeDto } from './dto/out/admin-invitee.dto'
import type { Response } from 'express'
import { ConfigService } from '@nestjs/config'
import { readFileSync } from 'fs'
import path from 'path'

@ApiTags('workspaces')
@Controller('workspaces')
export class WorkspaceController {
  constructor(
    @InjectMapper() private readonly mapper: Mapper,
    private readonly workspaceService: WorkspaceService,
    private readonly workspaceAuthService: WorkspaceAuthService,
    private readonly userService: UserService,
    private readonly i18n: I18nService,
    private readonly configService: ConfigService
  ) {}

  @Auth(GlobalRole.User)
  @Get('/:workspaceId/admins')
  public async getAdminsAndOwner(
    @Param('workspaceId', ParseIntPipe) id: number
  ): Promise<UserDto[]> {
    const admins = await this.workspaceService.getOwnerAndAdmins(id)

    return this.mapper.mapArray(admins, UserModel, UserDto)
  }

  @Auth(GlobalRole.User)
  @Get('/:workspaceId/invitees')
  public async getInvitees(
    @Param('workspaceId', ParseIntPipe) id: number
  ): Promise<AdminInviteeDto[]> {
    const invitees = await this.workspaceService.getInvitees(id)

    return this.mapper.mapArray(invitees, WorkspaceInvitationsModel, AdminInviteeDto)
  }

  @Auth(GlobalRole.User)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  public async create(
    @Body() createWorkspaceDto: CreateWorkspaceDto,
    @User() user: UserModel
  ): Promise<ICreatedRecord> {
    if (!(await this.workspaceAuthService.canCreate(user))) {
      throw new ForbiddenException(
        this.i18n.t('workspace.forbidden', {
          lang: I18nContext.current().lang
        })
      )
    }

    const workspace = await this.workspaceService.create(createWorkspaceDto, user)

    return { id: workspace.id, uuid: workspace.uuid }
  }

  @Auth(GlobalRole.User)
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  public async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWorkspaceDto: UpdateWorkspaceDto,
    @User() user: UserModel
  ) {
    const workspace = await this.workspaceService.getWorkspace(id)

    if (!(await this.workspaceAuthService.canUpdate(workspace, user))) {
      throw new ForbiddenException(
        this.i18n.t('workspace.forbidden', {
          lang: I18nContext.current().lang
        })
      )
    }

    return this.workspaceService.update(workspace, updateWorkspaceDto, user)
  }

  @Auth(GlobalRole.User)
  @Get()
  public async getAllByUser(@User() user: UserModel): Promise<WorkspaceDto[]> {
    const workspaces = await this.workspaceService.getUserWorkspaces(user)

    const workspaceDTOs = await this.mapper.mapArrayAsync(workspaces, WorkspaceModel, WorkspaceDto)

    return this.workspaceService.loadUserRoleInDTOs(workspaceDTOs, user)
  }

  @Auth(GlobalRole.User)
  @Get(':id')
  public async getOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('fields', new ValidFieldsPipe<WorkspaceExtraProperties>(['admins', 'user']))
    fields: WorkspaceExtraProperties,
    @User() user: UserModel
  ): Promise<WorkspaceDto> {
    const workspace = await this.workspaceService.getWorkspace(id, fields)

    if (!(await this.workspaceAuthService.canRead(workspace, user))) {
      throw new ForbiddenException(
        this.i18n.t('workspace.forbidden', {
          lang: I18nContext.current().lang
        })
      )
    }

    return this.mapper.map(workspace, WorkspaceModel, WorkspaceDto)
  }

  @Auth(GlobalRole.User)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async delete(@Param('id', ParseIntPipe) id: number, @User() user: UserModel) {
    const workspace = await this.workspaceService.getWorkspace(id)

    if (!(await this.workspaceAuthService.canDelete(workspace, user))) {
      throw new ForbiddenException(
        this.i18n.t('workspace.forbidden', {
          lang: I18nContext.current().lang
        })
      )
    }

    return this.workspaceService.delete(workspace, user)
  }

  @Auth(GlobalRole.User)
  @Post(':id/user')
  @HttpCode(HttpStatus.OK)
  public async inviteAdmin(
    @Param('id', ParseIntPipe) id: number,
    @Body() inviteAdminDto: InviteAdminDto,
    @User() user: UserModel
  ): Promise<void> {
    const workspace = await this.workspaceService.getWorkspace(id)

    if (!(await this.workspaceAuthService.canManageAdmins(workspace, user))) {
      throw new ForbiddenException(
        this.i18n.t('workspace.forbidden', {
          lang: I18nContext.current().lang
        })
      )
    }

    await this.workspaceService.inviteAdmin(workspace, inviteAdminDto, user)
  }

  @Auth(GlobalRole.User)
  @Post(':id/user/cancel')
  @HttpCode(HttpStatus.OK)
  public async cancelInviteAdmin(
    @Param('id', ParseIntPipe) id: number,
    @Body() inviteAdminDto: InviteAdminDto,
    @User() user: UserModel
  ): Promise<void> {
    const workspace = await this.workspaceService.getWorkspace(id)

    if (!(await this.workspaceAuthService.canManageAdmins(workspace, user))) {
      throw new ForbiddenException(
        this.i18n.t('workspace.forbidden', {
          lang: I18nContext.current().lang
        })
      )
    }

    await this.workspaceService.cancelInviteAdmin(workspace, inviteAdminDto, user)
  }

  @Get('/accept-invitation/:token')
  @HttpCode(HttpStatus.PERMANENT_REDIRECT)
  public async unauthenticatedAcceptAdminInvitation(
    @Param('token', ParseUUIDPipe) token: UUID,
    @Res({ passthrough: true }) res: Response
  ): Promise<void> {
    try {
      const invitation = await this.workspaceService.getInvitationByToken(token)

      const isUserRegistered = await this.userService.isUserRegistered(invitation.email)

      if (!isUserRegistered) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .redirect(this.configService.getOrThrow<string>('CLIENT_URL'))
      }

      const url = await this.workspaceService.acceptAdminInvitation(invitation)

      return res.status(HttpStatus.PERMANENT_REDIRECT).redirect(url)
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
  public async unauthenticatedDeclineAdminInvitation(
    @Param('token', ParseUUIDPipe) token: UUID,
    @Res({ passthrough: true }) res: Response
  ): Promise<void> {
    try {
      const invitation = await this.workspaceService.getInvitationByToken(token)

      const isUserRegistered = await this.userService.isUserRegistered(invitation.email)

      if (!isUserRegistered) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .redirect(this.configService.getOrThrow<string>('CLIENT_URL'))
      }

      const url = await this.workspaceService.declineAdminInvitation(invitation)

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
  @Patch(':id/user/:userId')
  @HttpCode(HttpStatus.OK)
  public async editAdminPermissions(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() workspacePermissions: WorkspacePermissionsDto,
    @User() user: UserModel
  ): Promise<void> {
    const workspace = await this.workspaceService.getWorkspace(id)
    const admin = await this.userService.getUser(userId)

    if (!(await this.workspaceAuthService.canManageAdmins(workspace, user))) {
      throw new ForbiddenException(
        this.i18n.t('workspace.forbidden', {
          lang: I18nContext.current().lang
        })
      )
    }

    return this.workspaceService.updateAdminPermissions(
      workspace,
      admin,
      workspacePermissions,
      user
    )
  }

  @Auth(GlobalRole.User)
  @Delete(':id/user/:userId')
  @HttpCode(HttpStatus.OK)
  public async removeAdmin(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
    @User() user: UserModel
  ): Promise<void> {
    const workspace = await this.workspaceService.getWorkspace(id)
    const userToRemove = await this.userService.getUser(userId)

    if (!(await this.workspaceAuthService.canManageAdmins(workspace, user))) {
      throw new ForbiddenException(
        this.i18n.t('workspace.forbidden', {
          lang: I18nContext.current().lang
        })
      )
    }

    return this.workspaceService.removeAdminAccess(workspace, userToRemove, user)
  }
}
