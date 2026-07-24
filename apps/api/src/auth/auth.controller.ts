import { AuthService } from './services/auth.service'
import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  Res
} from '@nestjs/common'
import { RegisterDto } from './dto/register.dto'
import { UserLoginDto } from './dto/user-login.dto'
import type { Request, Response } from 'express'
import { GlobalRole } from '../user/access/enum.role'
import { Auth } from './decorators/auth.decorator'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { ILoginResponse } from './interfaces/login-response.interface'
import { User } from './decorators/user.decorator'
import {
  PasswordResetRequestDto,
  PasswordResetSetDto,
  PasswordResetVerifyDto
} from './dto/reset-password.dto'
import { IAccessToken } from './interfaces/access-token.interface'
import { getCurrentUTCDateTime } from '../common/helpers/date'
import dayjs from 'dayjs'
import { ConfigService } from '@nestjs/config'
import { ITokenPair } from './interfaces/token-pair.interface'
import { ProjectService } from '../project/services/project/project.service'
import { ProjectAuthService } from '../project/auth/project-auth.service'
import { WorkspaceService } from '../workspace/services/workspace/workspace.service'
import { WorkspaceAuthService } from '../workspace/auth/workspace-auth.service'
import { UserModel } from '../user/models/user.model'
import { I18nContext, I18nService } from 'nestjs-i18n'
import { ResendCodeDto, VerificationDto } from '../verification/dto/in/verification.dto'
import { UserService } from '../user/user.service'
import { ArchivedProjectService } from '../project/services/project/archived-project.service'
import { ChangePasswordDto } from './dto/change-password.dto'
import { ProjectPermissionsService } from '../project/services/project-permissions/project-permissions.service'
import { WorkspacePermissionsService } from '../workspace/services/permissions/workspace-permissions.service'
import { IProjectPermissionsRole } from '../project/components/permissions/types/project-permissions.interface'
import { IWorkspacePermissions } from '../workspace/components/permissions/types/workspace-permissions.interface'

interface IPermissions {
  workspace: IWorkspacePermissions
  project: IProjectPermissionsRole
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly workspacePermissionsService: WorkspacePermissionsService,
    private readonly projectPermissionsService: ProjectPermissionsService,
    private readonly projectService: ProjectService,
    private readonly archivedProjectService: ArchivedProjectService,
    private readonly projectAuthService: ProjectAuthService,
    private readonly workspaceService: WorkspaceService,
    private readonly workspaceAuthService: WorkspaceAuthService,
    private readonly userService: UserService,
    private readonly i18n: I18nService
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  public async login(
    @Body() userDto: UserLoginDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<ILoginResponse> {
    const response = await this.authService.login(userDto)

    this.addCookies(res, {
      refreshToken: response.refreshToken,
      accessToken: response.loginResponse.accessToken
    })

    return response.loginResponse
  }

  @ApiOperation({
    description: 'Create new user'
  })
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  public async register(@Body() registerDto: RegisterDto): Promise<void> {
    await this.authService.register(registerDto)
  }

  @Post('activate')
  public async activate(
    @Body() verificationDto: VerificationDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<ILoginResponse> {
    const user = await this.userService.getUserByEmail(verificationDto.email)

    if (user.isActivated) {
      throw new ForbiddenException('User is already activated')
    }

    const response = await this.authService.activate(user, verificationDto.code)

    this.addCookies(res, {
      refreshToken: response.refreshToken,
      accessToken: response.loginResponse.accessToken
    })

    return response.loginResponse
  }

  @Auth(GlobalRole.User)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  public async logout(@User() user: UserModel, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(user)
    const domain = this.configService.get('DOMAIN')
    res.clearCookie('refreshToken', { path: '/', domain: domain ? '.' + domain : undefined })
    res.clearCookie('accessToken', { path: '/', domain: domain ? '.' + domain : undefined })
  }

  @Post('refresh')
  public async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ): Promise<IAccessToken> {
    const { refreshToken } = req.cookies
    const refreshResponse = await this.authService.refreshToken(refreshToken)
    if (refreshResponse) {
      this.addCookies(res, refreshResponse)
    }

    return refreshResponse.accessToken
  }

  @Post('resend/activation-code')
  public async resendActivationCode(@Body() resendCodeDto: ResendCodeDto): Promise<void> {
    const user = await this.userService.getUserByEmail(resendCodeDto.email)

    await this.authService.sendActivationCode(user)
  }

  @Post('password-reset/request')
  public async requestPasswordReset(
    @Body() passwordResetRequestDto: PasswordResetRequestDto
  ): Promise<void> {
    const user = await this.userService.getUserByEmail(passwordResetRequestDto.email)

    await this.authService.requestPasswordReset(user)
  }

  @Post('password-reset/verify')
  public async verifyPasswordResetCode(@Body() passwordResetVerifyDto: PasswordResetVerifyDto) {
    const user = await this.userService.getUserByEmail(passwordResetVerifyDto.email)

    await this.authService.verifyPasswordResetCode(passwordResetVerifyDto.code, user)
  }

  @Post('password-reset/set')
  public async resetPassword(
    @Body() passwordResetSetDto: PasswordResetSetDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<ILoginResponse> {
    const user = await this.userService.getUserByEmail(passwordResetSetDto.email)

    await this.authService.resetPassword(
      passwordResetSetDto.code,
      passwordResetSetDto.password,
      user
    )

    const response = await this.authService.login({
      email: passwordResetSetDto.email,
      password: passwordResetSetDto.password
    })

    this.addCookies(res, {
      refreshToken: response.refreshToken,
      accessToken: response.loginResponse.accessToken
    })

    return response.loginResponse
  }

  @Auth(GlobalRole.User)
  @Get('permissions/all/:projectId')
  public async getAllPermissions(
    @Param('projectId', ParseIntPipe) projectId: number,
    @User() user: UserModel
  ): Promise<IPermissions> {
    const project = await this.projectService.get(projectId)

    if (!(await this.projectAuthService.canManageAdmins(user, project))) {
      throw new ForbiddenException(
        this.i18n.t('project.user_is_not_part_of_project', {
          lang: I18nContext.current().lang,
          args: { username: user.username, title: project.title }
        })
      )
    }

    return {
      project: await this.projectPermissionsService.getProjectPermissions(project.id, user.id),
      workspace: await this.workspacePermissionsService.getWorkspacePermissions(
        project.workspaceId,
        user.id
      )
    }
  }

  @Auth(GlobalRole.User)
  @Get('permissions/project/:projectId/user/:userId')
  public async getProjectUserPermissions(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @User() user: UserModel
  ): Promise<IProjectPermissionsRole> {
    const project = await this.projectService.get(projectId)

    if (user.id === userId || (await this.projectAuthService.canManageAdmins(user, project))) {
      return this.projectPermissionsService.getProjectPermissions(project.id, userId)
    }

    const { role } = await this.projectPermissionsService.getProjectPermissions(project.id, userId)

    return { role }
  }

  @Auth(GlobalRole.User)
  @Get('permissions/archived-project/:projectId/user/:userId')
  public async getArchivedProjectUserPermissions(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('userId', ParseIntPipe) userId: number
  ): Promise<IProjectPermissionsRole> {
    const project = await this.archivedProjectService.get(projectId)

    const { role } = await this.projectPermissionsService.getProjectPermissions(project.id, userId)

    return { role }
  }

  @Auth(GlobalRole.User)
  @Get('permissions/project/:projectId')
  public async getProjectPermissions(
    @Param('projectId', ParseIntPipe) projectId: number,
    @User() user: UserModel
  ): Promise<IProjectPermissionsRole> {
    const project = await this.projectService.get(projectId)

    if (!(await this.projectAuthService.canRead(user, project))) {
      throw new ForbiddenException(
        this.i18n.t('project.user_is_not_part_of_project', {
          lang: I18nContext.current().lang,
          args: { username: user.username, title: project.title }
        })
      )
    }

    return this.projectPermissionsService.getProjectPermissions(project.id, user.id)
  }

  @Auth(GlobalRole.User)
  @Get('permissions/workspace/:workspaceId/user/:adminId')
  public async getWorkspaceUserPermissions(
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Param('adminId', ParseIntPipe) adminId: number,
    @User() user: UserModel
  ): Promise<IWorkspacePermissions> {
    const workspace = await this.workspaceService.getWorkspace(workspaceId)

    if (
      user.id === adminId ||
      (await this.workspaceAuthService.isOwnerOrAdmin(workspace.id, user.id))
    ) {
      return this.workspacePermissionsService.getWorkspacePermissions(workspace.id, adminId)
    }

    throw new ForbiddenException()
  }

  @Auth(GlobalRole.User)
  @Get('permissions/workspace/:workspaceId')
  public async getWorkspacePermissions(
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @User() user: UserModel
  ): Promise<IWorkspacePermissions> {
    const workspace = await this.workspaceService.getWorkspace(workspaceId)

    if (
      !(await this.workspaceAuthService.isOwnerOrAdmin(workspace.id, user.id)) &&
      !(await this.workspaceAuthService.isPartOfAnyWorkspaceProjects(workspace.id, user.id))
    ) {
      throw new ForbiddenException(
        this.i18n.t('workspace.user_not_part_of_workspace', {
          lang: I18nContext.current().lang
        })
      )
    }

    return this.workspacePermissionsService.getWorkspacePermissions(workspace.id, user.id)
  }

  @Auth(GlobalRole.User)
  @Patch('/update/password')
  public async updatePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @User() user: UserModel
  ): Promise<void> {
    await this.authService.updatePassword(user.id, changePasswordDto)
  }

  private addCookies(res: Response, tokens: ITokenPair) {
    const domain = this.configService.get('DOMAIN')
    const baseUrl = this.configService.get('BASE_URL') || ''

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      expires: dayjs(getCurrentUTCDateTime()).add(1, 'month').toDate(),
      path: baseUrl + '/auth/refresh',
      domain: domain ? '.' + domain : undefined
    })

    res.cookie('accessToken', tokens.accessToken.token, {
      httpOnly: true,
      sameSite: 'lax',
      expires: dayjs(tokens.accessToken.expiresIn).toDate(),
      domain: domain ? '.' + domain : undefined
    })
  }
}
