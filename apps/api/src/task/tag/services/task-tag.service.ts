import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { TagModel } from '../models/tag.model'
import { TaskModel } from '../../models/task.model'
import { UserModel } from '../../../user/models/user.model'
import { CreateTagDto } from '../dto/in/create-tag.dto'
import { ProjectModel } from '../../../project/models/project.model'
import { UpdateTagDto } from '../dto/in/update-tag.dto'
import { TransactionOrKnex } from 'objection'
import {
  ITaskTagRepository,
  TASK_TAG_REPOSITORY
} from '../../repositories/tag/task-tag-repository.interface'
import { EventService } from '../../../events/event.service'
import { MyBaseModel } from '../../../common/database/base.model'
import { ProjectCacheService } from '../../../cache/services/project.cache-service'
import { ProjectService } from '../../../project/services/project/project.service'
import { TaskCacheService } from '../../../cache/services/task.cache-service'

@Injectable()
export class TaskTagService {
  constructor(
    @Inject(TASK_TAG_REPOSITORY) private readonly taskTagRepository: ITaskTagRepository,
    @Inject(forwardRef(() => ProjectService)) private readonly projectService: ProjectService,
    private readonly eventService: EventService,
    private readonly projectCacheService: ProjectCacheService,
    private readonly tasksCacheService: TaskCacheService
  ) {}

  public async get(tagId: number): Promise<TagModel> {
    const tag = await this.taskTagRepository.getTag(tagId)

    if (!tag) {
      throw new NotFoundException('Tag not found')
    }

    return tag
  }

  public async addToTask(task: TaskModel, tag: TagModel, user: UserModel, trx?: TransactionOrKnex) {
    const [project] = await Promise.all([
      this.projectService.get(task.projectId),
      this.taskTagRepository.addToTask(task, tag, trx)
    ])

    await this.projectCacheService.deleteSingleProject(project.workspaceId, project.id)

    const tagDto = this.createTagDto(tag)

    await this.tasksCacheService.delete(task.projectId)

    this.eventService
      .sendEvent({
        userId: user.id,
        project: {
          id: task.projectId,
          task: {
            id: task.id,
            update: {
              tags: {
                add: [tagDto]
              }
            }
          }
        }
      })
      .then()
      .catch(console.error)
  }

  public async removeFromTask(
    task: TaskModel,
    tag: TagModel,
    user: UserModel,
    trx?: TransactionOrKnex
  ) {
    const [project] = await Promise.all([
      this.projectService.get(task.projectId),
      this.taskTagRepository.removeFromTask(task, tag, trx)
    ])

    await this.projectCacheService.deleteSingleProject(project.workspaceId, project.id)

    const tagDto = this.createTagDto(tag)

    await this.tasksCacheService.delete(task.projectId)

    this.eventService
      .sendEvent({
        userId: user.id,
        project: {
          id: task.projectId,
          task: {
            id: task.id,
            update: {
              tags: {
                delete: [tagDto]
              }
            }
          }
        }
      })
      .then()
      .catch(console.error)
  }

  public async createTag(
    createTagDto: CreateTagDto,
    user: UserModel,
    project: ProjectModel
  ): Promise<TagModel> {
    const name = createTagDto.name.trim()

    if (await this.isTagExists(name, project)) {
      throw new BadRequestException('Tag already exists')
    }

    const createdTag = await this.taskTagRepository.createTag(createTagDto, project)

    await this.projectCacheService.deleteSingleProject(project.workspaceId, project.id)
    await this.tasksCacheService.delete(project.id)

    this.eventService
      .sendEvent({
        userId: user.id,
        project: {
          id: project.id,
          tag: {
            add: {
              id: createdTag.id,
              name: createdTag.name,
              color: createdTag.color
            }
          }
        }
      })
      .catch(console.error)

    return createdTag
  }

  public async getByProject(projectId: number): Promise<TagModel[]> {
    return this.taskTagRepository.getByProject(projectId)
  }

  public async deleteTag(tagId: number, user: UserModel, project: ProjectModel): Promise<void> {
    const trx = await MyBaseModel.startTransaction()

    try {
      const tag = await this.taskTagRepository.getTag(tagId)

      await this.taskTagRepository.removeTagFromAllTasks(tag, trx)

      await this.taskTagRepository.deleteTag(tag.id, trx)

      await this.projectCacheService.deleteSingleProject(project.workspaceId, project.id)

      await trx.commit()

      await this.tasksCacheService.delete(project.id)

      this.eventService.sendEvent({
        userId: user.id,
        project: {
          id: project.id,
          tag: {
            remove: {
              id: tag.id
            }
          }
        }
      })
    } catch (e) {
      await trx.rollback()
      console.error(e)
      throw e
    }
  }

  public async updateTag(
    tagId: number,
    user: UserModel,
    project: ProjectModel,
    updateTagDto: UpdateTagDto
  ): Promise<void> {
    const tag = await this.taskTagRepository.getTag(tagId)

    await this.taskTagRepository.updateTag(tag, updateTagDto)

    await this.projectCacheService.deleteSingleProject(project.workspaceId, project.id)

    await this.tasksCacheService.delete(project.id)

    this.eventService
      .sendEvent({
        userId: user.id,
        project: {
          id: project.id,
          tag: {
            update: {
              id: tag.id,
              name: updateTagDto.name,
              color: updateTagDto.color
            }
          }
        }
      })
      .catch(console.error)
  }

  public async getByIds(ids: number[]): Promise<TagModel[]> {
    return this.taskTagRepository.getByIds(ids)
  }

  public async isTagExists(name: string, project: ProjectModel): Promise<boolean> {
    return this.taskTagRepository.isTagExists(name, project)
  }

  private createTagDto(tag: TagModel) {
    return {
      id: tag.id,
      name: tag.name,
      colorFg: tag.color,
      colorBg: tag.color
    }
  }
}
