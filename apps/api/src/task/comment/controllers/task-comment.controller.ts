import { TaskCommentService } from '../services/task-comment.service'
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post
} from '@nestjs/common'
import { CreateDto } from '../dto/create.dto'
import { UpdateDto } from '../dto/update.dto'
import { Auth } from '../../../auth/decorators/auth.decorator'
import { GlobalRole } from '../../../user/access/enum.role'
import { User } from '../../../auth/decorators/user.decorator'
import { ApiTags } from '@nestjs/swagger'
import { ICreatedRecord } from '../../../common/interfaces/created-record.interface'
import { TaskService } from '../../services/task.service'
import { TaskAuthService } from '../../auth/task-auth.service'
import { I18nService } from 'nestjs-i18n'
import { UserModel } from '../../../user/models/user.model'
import { TaskCommentReactDto } from '../dto/react.dto'
import { TaskCommentResponse } from '../../dto'
import type { Mapper } from '@automapper/core'
import { TaskCommentModel } from '../models/task-comment.model'
import { InjectMapper } from '@automapper/nestjs'

@Auth(GlobalRole.User)
@ApiTags('task-comments')
@Controller('tasks/:taskId/comments')
export class TaskCommentController {
  constructor(
    private readonly taskCommentService: TaskCommentService,
    private readonly taskService: TaskService,
    private readonly taskAuthService: TaskAuthService,
    private readonly i18n: I18nService,
    @InjectMapper() private readonly mapper: Mapper
  ) {}

  @Post()
  async create(
    @Param('taskId', ParseIntPipe) taskId: number,
    @Body() createDto: CreateDto,
    @User() user: UserModel
  ): Promise<ICreatedRecord> {
    const task = await this.taskService.getTask(taskId)

    if (!(await this.taskAuthService.canComment(user, task))) {
      throw new ForbiddenException(this.i18n.t('task.forbidden'))
    }

    const taskComment = await this.taskCommentService.create(task, createDto, user)

    return { id: taskComment.id }
  }

  @Post(':commentId/react')
  async react(
    @Param('taskId', ParseIntPipe) taskId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() commentReactDto: TaskCommentReactDto,
    @User() user: UserModel
  ): Promise<ICreatedRecord> {
    const comment = await this.taskCommentService.findOne(commentId)

    if (comment.taskId !== taskId) {
      throw new BadRequestException('Comment does not belong to task')
    }

    const task = await this.taskService.getTask(taskId)

    if (!(await this.taskAuthService.canComment(user, task))) {
      throw new ForbiddenException(this.i18n.t('task.forbidden'))
    }

    const reaction = await this.taskCommentService.react(comment.id, commentReactDto.name, user)

    return { id: reaction.id }
  }

  @Delete(':commentId/react/:reactionId')
  async removeReaction(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Param('reactionId', ParseIntPipe) reactionId: number,
    @User() user: UserModel
  ): Promise<void> {
    const commentReaction = await this.taskCommentService.getReaction(reactionId)

    if (commentReaction.commentId !== commentId) {
      throw new BadRequestException('Reaction does not belong to comment ' + commentId)
    }

    if (commentReaction.userId !== user.id) {
      throw new ForbiddenException(this.i18n.t('task.forbidden'))
    }

    await this.taskCommentService.removeReaction(reactionId, commentId, user)
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) commentId: number,
    @Body() updateDto: UpdateDto,
    @User() user: UserModel
  ) {
    const comment = await this.taskCommentService.findOne(commentId)

    if (!this.taskAuthService.modelAuth.canUpdateComment(user, comment)) {
      throw new ForbiddenException(this.i18n.t('task.comment.forbidden'))
    }

    return this.taskCommentService.update(comment, updateDto, user)
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) commentId: number, @User() user: UserModel) {
    const comment = await this.taskCommentService.findOne(commentId)

    if (!(await this.taskAuthService.modelAuth.canDeleteComment(user, comment))) {
      throw new ForbiddenException(this.i18n.t('task.comment.forbidden'))
    }

    return this.taskCommentService.delete(comment, user)
  }

  @Get()
  async getByTask(
    @Param('taskId', ParseIntPipe) taskId: number,
    @User() user: UserModel
  ): Promise<TaskCommentResponse[]> {
    const task = await this.taskService.getTask(taskId)

    if (!(await this.taskAuthService.canRead(user, task.id))) {
      throw new ForbiddenException(this.i18n.t('task.forbidden'))
    }

    return this.mapper.mapArray(
      await this.taskCommentService.getByTask(taskId),
      TaskCommentModel,
      TaskCommentResponse
    )
  }
}
