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
import { TimerService } from './timer.service'
import { Auth } from '../../auth/decorators/auth.decorator'
import { GlobalRole } from '../../user/access/enum.role'
import { ApiTags } from '@nestjs/swagger'
import { User } from '../../auth/decorators/user.decorator'
import { TaskService } from '../services/task.service'
import { TaskAuthService } from '../auth/task-auth.service'
import { I18nContext, I18nService } from 'nestjs-i18n'
import { TimerHistoryDto } from './dto/out/timer-history.dto'
import { InjectMapper } from '@automapper/nestjs'
import type { Mapper } from '@automapper/core'
import { TaskTimerHistoryModel } from './models/task-timer-history.model'
import { TimerHistoryCommentDto } from './dto/in/timer-history-comment.dto'
import { UserModel } from '../../user/models/user.model'
import { TimerHistoryCreateDto } from './dto/in/timer-history-create.dto'
import { ICreatedRecord } from '../../common/interfaces/created-record.interface'
import { getCurrentUTCDateTime } from '../../common/helpers/date'
import { StartTimerDto } from './dto/out/start-timer.dto'
import { StopTimerDto } from './dto/out/stop-timer.dto'

@Auth(GlobalRole.User)
@ApiTags('tasks')
@Controller('/tasks/:taskId/timer')
export class TimerController {
  constructor(
    private readonly timerService: TimerService,
    private readonly taskService: TaskService,
    private readonly taskAuthService: TaskAuthService,
    private i18n: I18nService,
    @InjectMapper() private readonly mapper: Mapper
  ) {}

  @Post('start')
  @HttpCode(HttpStatus.OK)
  public async start(
    @Param('taskId', ParseIntPipe) taskId: number,
    @User() user: UserModel
  ): Promise<StartTimerDto> {
    const startedAt = getCurrentUTCDateTime()
    await this.timerService.start(taskId, startedAt, user)

    return { startedAt }
  }

  @Post('stop')
  @HttpCode(HttpStatus.OK)
  public async stop(
    @Param('taskId', ParseIntPipe) taskId: number,
    @User() user: UserModel
  ): Promise<StopTimerDto> {
    const stoppedAt = getCurrentUTCDateTime()
    await this.timerService.stop(taskId, stoppedAt, user)
    return { stoppedAt }
  }

  @Get('history/:userId')
  public async historyUser(
    @Param('taskId', ParseIntPipe) taskId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @User() user: UserModel
  ): Promise<TimerHistoryDto[]> {
    const task = await this.taskService.getTask(taskId)
    if (!task) {
      throw new NotFoundException(
        this.i18n.t('task.not_found', { lang: I18nContext.current().lang })
      )
    }

    if (!(await this.taskAuthService.canRead(user, task.id))) {
      throw new ForbiddenException(
        this.i18n.t('task.forbidden', { lang: I18nContext.current().lang })
      )
    }

    const histories = await this.timerService.getUserHistory(task, user, userId)

    return this.mapper.mapArray(histories, TaskTimerHistoryModel, TimerHistoryDto)
  }

  @Get('history')
  public async historyAll(@Param('taskId', ParseIntPipe) taskId: number, @User() user: UserModel) {
    if (!(await this.taskAuthService.canRead(user, taskId))) {
      throw new ForbiddenException(
        this.i18n.t('task.forbidden', { lang: I18nContext.current().lang })
      )
    }

    return this.timerService.getAllHistory(taskId, user)
  }

  @Post('history')
  public async createHistoryComment(
    @Param('taskId', ParseIntPipe) taskId: number,
    @Body() creationTimerHistoryDto: TimerHistoryCreateDto,
    @User() user: UserModel
  ): Promise<ICreatedRecord> {
    const task = await this.taskService.getTask(taskId)

    if (!(await this.taskAuthService.canCreateTimerHistoryEntry(user, task))) {
      throw new ForbiddenException(
        this.i18n.t('task.forbidden', {
          lang: I18nContext.current().lang,
          args: { taskId: task.id }
        })
      )
    }

    return this.timerService.createTimerHistoryEntry(creationTimerHistoryDto, task, user)
  }

  @Patch('history/:historyId')
  public async commentHistory(
    @Param('taskId', ParseIntPipe) taskId: number,
    @Param('historyId', ParseIntPipe) historyId: number,
    @Body() commentDto: TimerHistoryCommentDto,
    @User() user: UserModel
  ) {
    if (commentDto.endTime) {
      commentDto.endTime = new Date(commentDto.endTime)
    }

    const task = await this.taskService.getTask(taskId)

    const history = await this.timerService.getHistory(historyId)

    if (history.taskId !== task.id) {
      throw new NotFoundException('History does not belong to task ' + task.id)
    }

    if (history.userId !== user.id) {
      throw new ForbiddenException(
        this.i18n.t('task.forbidden', { lang: I18nContext.current().lang })
      )
    }

    return this.timerService.editHistoryEntry(history, commentDto, user)
  }

  @Delete('history/:historyId')
  public async deleteHistory(
    @Param('taskId', ParseIntPipe) taskId: number,
    @Param('historyId', ParseIntPipe) historyId: number,
    @User() user: UserModel
  ) {
    const task = await this.taskService.getTask(taskId)
    const history = await this.timerService.getHistory(historyId)

    if (history.taskId !== task.id) {
      throw new NotFoundException('History does not belong to task ' + task.id)
    }

    if (history.userId !== user.id) {
      throw new ForbiddenException(
        this.i18n.t('task.forbidden', { lang: I18nContext.current().lang })
      )
    }

    return this.timerService.deleteHistoryEntry(history, user)
  }
}
