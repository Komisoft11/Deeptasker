import { Auth } from '../../../auth/decorators/auth.decorator'
import { GlobalRole } from '../../../user/access/enum.role'
import { ApiTags } from '@nestjs/swagger'
import { Controller, Delete, ForbiddenException, Param, ParseIntPipe, Post } from '@nestjs/common'
import { TaskService } from '../../services/task.service'
import { TaskAuthService } from '../../auth/task-auth.service'
import { I18nService } from 'nestjs-i18n'
import { User } from '../../../auth/decorators/user.decorator'
import { TaskTagService } from '../services/task-tag.service'
import { UserModel } from '../../../user/models/user.model'

@Auth(GlobalRole.User)
@ApiTags('task-tag')
@Controller('tasks/:taskId/tag')
export class TaskTagController {
  constructor(
    private readonly taskTagService: TaskTagService,
    private readonly taskService: TaskService,
    private readonly taskAuthService: TaskAuthService,
    private readonly i18n: I18nService
  ) {}

  @Post(':tagId')
  async addTagToTask(
    @Param('taskId', ParseIntPipe) taskId: number,
    @Param('tagId', ParseIntPipe) tagId: number,
    @User() user: UserModel
  ) {
    const task = await this.taskService.getTask(taskId)

    if (!(await this.taskAuthService.modelAuth.canAssign(user, task))) {
      throw new ForbiddenException(this.i18n.t('task.forbidden'))
    }

    const tag = await this.taskTagService.get(tagId)

    await this.taskTagService.addToTask(task, tag, user)
  }

  @Delete(':tagId')
  async removeFromTask(
    @Param('taskId', ParseIntPipe) taskId: number,
    @Param('tagId', ParseIntPipe) tagId: number,
    @User() user: UserModel
  ) {
    const task = await this.taskService.getTask(taskId)

    if (!(await this.taskAuthService.modelAuth.canAssign(user, task))) {
      throw new ForbiddenException(this.i18n.t('task.forbidden'))
    }

    const tag = await this.taskTagService.get(tagId)

    await this.taskTagService.removeFromTask(task, tag, user)
  }
}
