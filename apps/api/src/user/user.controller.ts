import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseArrayPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Res
} from '@nestjs/common'
import { UserService } from './user.service'
import { Roles } from '../auth/guards/roles-auth.decorator'
import { GlobalRole } from './access/enum.role'
import { ApiTags } from '@nestjs/swagger'
import { UserDto } from './dto/out/user.dto'
import { Auth } from '../auth/decorators/auth.decorator'
import { InjectMapper } from '@automapper/nestjs'
import type { Mapper } from '@automapper/core'
import { User } from '../auth/decorators/user.decorator'
import { UserModel } from './models/user.model'
import { UserSearchDto } from './dto/out/user-search.dto'
import { ProjectAuthService } from '../project/auth/project-auth.service'
import { I18nContext, I18nService } from 'nestjs-i18n'
import { ProjectService } from '../project/services/project/project.service'
import { UserProfileDto } from './dto/out/user-profile.dto'
import { UpdateUserDto } from './dto/in/update-user.dto'
import { UpdateUserEmailDto } from './dto/in/update-user-email.dto'
import { UpdateUserRoleDto } from './dto/in/update-user-role.dto'
import { VerifyUserEmailDto } from './dto/in/verify-user-email.dto'
import { DeleteUserDto } from './dto/in/delete-user.dto'
import { ConfigService } from '@nestjs/config'
import type { Response } from 'express'
import { CheckUsernameDto } from './dto/in/check-username.dto'

export type UserFindExtraProperties = Array<'projectId'>

@Auth(GlobalRole.Admin)
@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(
    private userService: UserService,
    @InjectMapper()
    private readonly mapper: Mapper,
    private readonly projectAuthService: ProjectAuthService,
    private readonly projectService: ProjectService,
    private readonly i18n: I18nService,
    private readonly configService: ConfigService
  ) {}

  @Get()
  public async getAll(): Promise<UserDto[]> {
    const users = await this.userService.getAll()

    return this.mapper.mapArray(users, UserModel, UserDto)
  }

  @Auth(GlobalRole.User)
  @Get('/find')
  public async findUser(
    @User() user: UserModel,
    @Query('query') query: string,
    @Query('excludeProject') excludeProjectId?: number,
    @Query('excludeWorkspaceAdmins') excludeWorkspaceAdminsId?: number,
    @Query('excludeWorkspaceInvitees') excludeWorkspaceInviteesId?: number,
    @Query('includeProject') includeProjectId?: number,
    @Query('userIds', new ParseArrayPipe({ items: Number, separator: ',', optional: true }))
    userIds?: number[]
  ): Promise<UserSearchDto[]> {
    if (userIds) {
      const users = await this.userService.getByIds(userIds)

      return this.mapper.mapArray(users, UserModel, UserSearchDto)
    }

    let users = []

    if (excludeProjectId) {
      users = await this.userService.findNotInProject(query, excludeProjectId)
    } else if (includeProjectId) {
      const includeProject = await this.projectService.get(includeProjectId)
      if (!(await this.projectAuthService.canRead(user, includeProject))) {
        throw new ForbiddenException(
          this.i18n.t('project.forbidden', {
            lang: I18nContext.current().lang
          })
        )
      }

      users = await this.userService.findInProject(query, includeProjectId)
    } else if (excludeWorkspaceAdminsId && excludeWorkspaceInviteesId) {
      users = await this.userService.findNotInWorkspaceAdminsAndInvitees(
        query,
        excludeWorkspaceAdminsId,
        excludeWorkspaceInviteesId
      )
    } else if (excludeWorkspaceAdminsId) {
      users = await this.userService.findNotInWorkspaceAdmins(query, excludeWorkspaceAdminsId)
    } else if (excludeWorkspaceInviteesId) {
      users = await this.userService.findNotInWorkspaceInvitees(query, excludeWorkspaceInviteesId)
    } else {
      users = await this.userService.find(query)
    }

    return this.mapper.mapArray(users, UserModel, UserSearchDto)
  }

  @Auth(GlobalRole.User)
  @Get('/profile')
  public async profile(@User() user: UserModel): Promise<UserProfileDto> {
    const userModel = await this.userService.getUser(user.id)

    return this.mapper.map(userModel, UserModel, UserProfileDto)
  }

  @Roles(GlobalRole.Admin, GlobalRole.User)
  @Patch('/update')
  public async updateInfo(@Body() updateUserDto: UpdateUserDto, @User() user: UserModel) {
    return await this.userService.updateUserInfo(user.id, updateUserDto)
  }

  @Roles(GlobalRole.Admin, GlobalRole.User)
  @Post('/update-email/request')
  public async requestUpdateEmail(
    @Body() updateUserEmailDto: UpdateUserEmailDto,
    @User() user: UserModel
  ): Promise<void> {
    await this.userService.requestUpdateEmail(user, updateUserEmailDto)
  }

  @Roles(GlobalRole.Admin, GlobalRole.User)
  @Post('/update-email/resend-request')
  public async resendRequestUpdateEmail(@User() user: UserModel): Promise<void> {
    await this.userService.resendRequestUpdateEmail(user)
  }

  @Roles(GlobalRole.Admin, GlobalRole.User)
  @Post('/update-email/verify')
  public async confirmNewEmail(
    @Body() verifyUserEmailDto: VerifyUserEmailDto,
    @User() user: UserModel
  ): Promise<void> {
    await this.userService.confirmNewEmail(user, verifyUserEmailDto)
  }

  @Roles(GlobalRole.Admin, GlobalRole.User)
  @Post('/update-email/cancel')
  public async cancelUpdateEmail(@User() user: UserModel): Promise<void> {
    await this.userService.cancelUpdateEmail(user)
  }

  @Patch(':id/role')
  public async updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserRoleDto: UpdateUserRoleDto
  ): Promise<void> {
    await this.userService.changeRole(id, updateUserRoleDto)
  }

  @Roles(GlobalRole.User)
  @HttpCode(HttpStatus.OK)
  @Post('/delete/request')
  public async deleteRequest(@User() user: UserModel): Promise<void> {
    await this.userService.deleteRequest(user)
  }

  @Roles(GlobalRole.User)
  @HttpCode(HttpStatus.OK)
  @Post('/delete')
  public async delete(
    @Body() deleteUserDto: DeleteUserDto,
    @User() user: UserModel,
    @Res({ passthrough: true }) res: Response
  ): Promise<void> {
    await this.userService.delete(deleteUserDto, user)
    const domain = this.configService.get('DOMAIN')
    res.clearCookie('refreshToken', { path: '/', domain: domain ? '.' + domain : undefined })
    res.clearCookie('accessToken', { path: '/', domain: domain ? '.' + domain : undefined })
  }

  @Auth(GlobalRole.User)
  @Post('/check-username')
  @HttpCode(HttpStatus.OK)
  public async isUsernameAvailable(
    @Body() checkUsernameDto: CheckUsernameDto,
    @User() user: UserModel
  ): Promise<boolean> {
    return this.userService.isUsernameAvailable(checkUsernameDto, user)
  }
}
