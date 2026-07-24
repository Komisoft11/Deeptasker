import { Auth } from '../../auth/decorators/auth.decorator'
import { GlobalRole } from '../../user/access/enum.role'
import { ApiTags } from '@nestjs/swagger'
import {
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  NotImplementedException,
  Param,
  ParseIntPipe,
  Post
} from '@nestjs/common'
import { User } from '../../auth/decorators/user.decorator'
import { TaskAccessService } from './task-access.service'
import { TaskAccessDto } from './dto/in/task-access.dto'
import { TaskService } from '../services/task.service'
import { UserService } from '../../user/user.service'
import { I18nService } from 'nestjs-i18n'
import { TaskAuthService } from '../auth/task-auth.service'
import { TaskRoleCode } from '../auth/task-access.role'

@Auth(GlobalRole.User)
@ApiTags('tasks-access')
@Controller('/tasks/:taskId/access')
export class TaskAccessController {
  constructor(
    private readonly taskAccessService: TaskAccessService,
    private readonly taskService: TaskService,
    private readonly userService: UserService,
    private i18n: I18nService,
    private readonly taskAuthService: TaskAuthService
  ) {}

  @Post('give/:userId')
  @HttpCode(HttpStatus.OK)
  async giveAccess(
    @Param('taskId', ParseIntPipe) taskId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() accessDto: TaskAccessDto,
    @User() user
  ) {
    if (accessDto.code !== TaskRoleCode.observer) {
      throw new NotImplementedException('Only for "observer" for the moment')
    }

    const task = await this.taskService.getTask(taskId)

    if (!(await this.taskAuthService.canManageTaskObservers(user, task))) {
      throw new ForbiddenException(this.i18n.t('task.forbidden'))
    }

    const userToGive = await this.userService.getUser(userId)

    return this.taskAccessService.giveAccess(task, userToGive, accessDto.code, user)
  }

  @Post('take/:userId')
  @HttpCode(HttpStatus.OK)
  async takeAccess(
    @Param('taskId', ParseIntPipe) taskId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() accessDto: TaskAccessDto,
    @User() user
  ) {
    if (accessDto.code !== TaskRoleCode.observer) {
      throw new NotImplementedException('Only for "observer" for the moment')
    }

    const task = await this.taskService.getTask(taskId)

    if (!(await this.taskAuthService.canManageTaskObservers(user, task))) {
      throw new ForbiddenException(this.i18n.t('task.forbidden'))
    }

    const userToTake = await this.userService.getUser(userId)

    return this.taskAccessService.takeAccess(task, userToTake, user, accessDto.code)
  }
}