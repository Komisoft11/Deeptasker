import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { CreateDto } from '../dto/create.dto'
import { UpdateDto } from '../dto/update.dto'
import { ICreatedRecord } from '../../../common/interfaces/created-record.interface'
import { TaskCommentModel } from '../models/task-comment.model'
import { getCurrentUTCDateTime } from '../../../common/helpers/date'
import { UserModel } from '../../../user/models/user.model'
import { EventService } from '../../../events/event.service'
import { TaskModel } from '../../models/task.model'
import { ITaskCommentEvent } from '../../../events/interfaces/task/task-comment-event.interface'
import { InjectMapper } from '@automapper/nestjs'
import type { Mapper } from '@automapper/core'
import { UserShortDto } from '../../../common/dto/user-short.dto'
import { TaskCommentReactionModel } from '../models/task-comment-reaction.model'

@Injectable()
export class TaskCommentService {
  constructor(
    private readonly eventService: EventService,
    @InjectMapper() private readonly mapper: Mapper
  ) {}

  public async create(
    task: TaskModel,
    createDto: CreateDto,
    user: UserModel
  ): Promise<ICreatedRecord> {
    if (createDto.replyId) {
      const reply = await this.findOne(createDto.replyId)
      if (reply.taskId !== task.id) {
        throw new BadRequestException('Reply does not belong to task')
      }
    }

    const comment = await TaskCommentModel.query().insert({
      taskId: task.id,
      comment: createDto.comment,
      replyId: createDto.replyId,
      userId: user.id
    })

    this.sendEvent(user.id, comment.taskId, {
      type: 'add',
      taskId: comment.taskId,
      dto: {
        id: comment.id,
        content: comment.comment,
        user: this.mapper.map(user, UserModel, UserShortDto),
        files: comment.files
      }
    })
      .then()
      .catch(e => console.error(e))

    return { id: comment.id }
  }

  public async update(comment: TaskCommentModel, updateDto: UpdateDto, user: UserModel) {
    await comment.$query().patch({
      comment: updateDto.comment
    })

    this.sendEvent(user.id, comment.taskId, {
      type: 'update',
      taskId: comment.taskId,
      dto: {
        user: comment.user,
        id: comment.id,
        content: updateDto.comment
      }
    })
      .then()
      .catch(e => console.error(e))
  }

  public async delete(comment: TaskCommentModel, user: UserModel) {
    const currentDate = getCurrentUTCDateTime()
    await comment.$query().patch({
      dateDeleted: currentDate
    })

    this.sendEvent(user.id, comment.taskId, {
      type: 'delete',
      taskId: comment.taskId,
      dto: {
        user: comment.user,
        id: comment.id,
        dateDeleted: currentDate
      }
    })
      .then()
      .catch(e => console.error(e))
  }

  public async getByTask(taskId: number): Promise<TaskCommentModel[]> {
    return TaskCommentModel.query()
      .withGraphJoined('[user(selectShortColor), reactions.user(selectShortColor), files]')
      .where('taskId', taskId)
      .andWhere('dateDeleted', null)
  }

  public async findOne(id: number): Promise<TaskCommentModel> {
    const comment = await TaskCommentModel.query().findOne({ id: id, dateDeleted: null })

    if (!comment) {
      throw new NotFoundException('comment not found')
    }

    return comment
  }

  private async sendEvent(userId: number, taskId: number, commentEvent: ITaskCommentEvent) {
    const projectId = (await TaskModel.query().select(['id', 'projectId']).findOne({ id: taskId }))
      .projectId
    return this.eventService.sendEvent({
      userId: userId,
      project: {
        id: projectId,
        task: {
          id: taskId,
          update: {
            comment: commentEvent
          }
        }
      }
    })
  }

  public async react(
    commentId: number,
    reactionName: string,
    user: UserModel
  ): Promise<TaskCommentReactionModel> {
    const reactionNameLower = reactionName.toLowerCase()
    if (
      await TaskCommentReactionModel.query()
        .where('commentId', commentId)
        .where('userId', user.id)
        .where('name', reactionNameLower)
        .exists()
    ) {
      throw new BadRequestException('User already reacted with ' + reactionName)
    }

    const reaction = await TaskCommentReactionModel.query().insertAndFetch({
      name: reactionNameLower,
      commentId: commentId,
      userId: user.id
    })

    const newReaction = reaction.$setJson({
      ...reaction.toJSON(),
      user: user.getShortInfo()
    })

    const comment = await TaskCommentModel.query().findById(commentId)

    await this.sendEvent(user.id, comment.taskId, {
      type: 'update',
      taskId: comment.taskId,
      dto: {
        id: comment.id,
        user: user,
        reaction: {
          add: newReaction
        }
      }
    })

    return reaction
  }

  public async getReaction(reactionId: number): Promise<TaskCommentReactionModel> {
    const reaction = await TaskCommentReactionModel.query().findOne({
      id: reactionId
    })

    if (!reaction) {
      throw new NotFoundException('Reaction not found')
    }

    return reaction
  }

  public async removeReaction(reactionId: number, commentId: number, user: UserModel) {
    const reactionToRemove = await TaskCommentReactionModel.query().findById(reactionId)

    await TaskCommentReactionModel.query().deleteById(reactionId)

    const comment = await TaskCommentModel.query().findById(commentId)

    await this.sendEvent(user.id, comment.taskId, {
      type: 'update',
      taskId: comment.taskId,
      dto: {
        id: comment.id,
        user: user,
        reaction: {
          remove: reactionToRemove
        }
      }
    })
  }
}