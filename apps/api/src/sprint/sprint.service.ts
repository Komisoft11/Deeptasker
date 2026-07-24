import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { CreateSprintDto } from './dto/in/create-sprint.dto'
import { UserModel } from '../user/models/user.model'
import { SprintModel } from './model/sprint.model'
import { InjectMapper } from '@automapper/nestjs'
import type { Mapper } from '@automapper/core'
import { EventService } from '../events/event.service'
import { I18nContext, I18nService } from 'nestjs-i18n'
import { ISprintRepository, SPRINT_REPOSITORY } from './repositories/sprint-repository.interface'
import { UpdateSprintDto } from './dto/in/update-sprint.dto'
import { TasksSprintDto } from './dto/in/tasks-sprint.dto'
import { MyBaseModel } from '../common/database/base.model'
import { TransactionOrKnex } from 'objection'
import { SprintDto } from './dto/out/sprint.dto'
import { ProjectCacheService } from '../cache/services/project.cache-service'

interface checkIntersectionsDto {
  dateStart?: Date
  dateEnd?: Date
}

@Injectable()
export class SprintService {
  constructor(
    @Inject(SPRINT_REPOSITORY) private readonly sprintRepository: ISprintRepository,
    @InjectMapper() private readonly mapper: Mapper,
    private readonly eventService: EventService,
    private i18n: I18nService,
    private readonly projectCacheService: ProjectCacheService
  ) {}

  public async create(createSprintDto: CreateSprintDto, user: UserModel): Promise<SprintModel> {
    const isSprintExists = await this.sprintRepository.isSprintExistsInProject(
      createSprintDto.title,
      createSprintDto.projectId
    )

    if (isSprintExists) {
      throw new ForbiddenException(
        this.i18n.t('sprint.title_exist', { lang: I18nContext.current().lang })
      )
    }

    const sprint = await this.sprintRepository.createSprint(createSprintDto, user)

    await this.projectCacheService.deleteSprints(sprint.projectId)

    this.eventService
      .sendEvent({
        userId: user.id,
        project: {
          id: createSprintDto.projectId,
          sprint: {
            id: sprint.id,
            create: {
              title: sprint.title,
              description: sprint.description,
              status: sprint.status,
              dateCreated: sprint.dateCreated,
              dateEnd: sprint.dateEnd,
              dateStart: sprint.dateStart
            }
          }
        }
      })
      .then()
      .catch(e => {
        console.error(e)
      })

    return sprint
  }

  public async get(id: number): Promise<SprintModel> {
    const sprint = await this.sprintRepository.getSprint(id)

    if (!sprint) {
      throw new NotFoundException(
        this.i18n.t('sprint.not_found', { lang: I18nContext.current().lang })
      )
    }

    return sprint
  }

  public async update(updateSprintDto: UpdateSprintDto, sprint: SprintModel, user: UserModel) {
    if (updateSprintDto.dateStart || updateSprintDto.dateEnd) {
      this.checkIntersections(
        { dateStart: updateSprintDto.dateStart, dateEnd: updateSprintDto.dateEnd },
        sprint
      )
    }

    await this.sprintRepository.updateSprint(sprint, updateSprintDto)

    await this.projectCacheService.deleteSprints(sprint.projectId)

    this.eventService
      .sendEvent({
        userId: user.id,
        project: {
          id: sprint.projectId,
          sprint: {
            id: sprint.id,
            update: updateSprintDto
          }
        }
      })
      .then()
      .catch(e => {
        console.error(e)
      })
  }

  public async getSprintsByProject(projectId: number): Promise<SprintDto[]> {
    const cached = await this.projectCacheService.getSprints(projectId)

    if (cached) {
      return cached
    }

    const sprints = await this.sprintRepository.getSprintsByProject(projectId)

    const dto = this.mapper.mapArray(sprints, SprintModel, SprintDto)

    await this.projectCacheService.setSprints(projectId, dto)

    return dto
  }

  public async addTasks(
    sprint: SprintModel,
    tasksSprintDto: TasksSprintDto,
    user: UserModel,
    trx?: TransactionOrKnex
  ) {
    await this.sprintRepository.addTasks(sprint, tasksSprintDto, trx)

    await this.projectCacheService.deleteSprints(sprint.projectId)

    this.eventService
      .sendEvent({
        userId: user.id,
        project: {
          id: sprint.projectId,
          sprint: {
            id: sprint.id,
            tasks: {
              add: tasksSprintDto.taskIds
            }
          }
        }
      })
      .then()
      .catch(e => {
        console.error(e)
      })
  }

  public async removeTasks(
    sprint: SprintModel,
    tasksSprintDto: TasksSprintDto,
    user: UserModel,
    trx?: TransactionOrKnex
  ) {
    if (sprint.dateDeleted) {
      throw new ForbiddenException(
        this.i18n.t('sprint.forbidden', {
          lang: I18nContext.current().lang
        })
      )
    }

    await this.sprintRepository.removeTasks(tasksSprintDto, trx)

    await this.projectCacheService.deleteSprints(sprint.projectId)

    this.eventService
      .sendEvent({
        userId: user.id,
        project: {
          id: sprint.projectId,
          sprint: {
            id: sprint.id,
            tasks: {
              remove: tasksSprintDto.taskIds
            }
          }
        }
      })
      .then()
      .catch(e => {
        console.error(e)
      })
  }

  public async delete(sprint: SprintModel, user: UserModel): Promise<void> {
    const taskIds = sprint.tasks.map(task => task.id)

    const trx = await MyBaseModel.startTransaction()

    try {
      await Promise.all([
        this.removeTasks(sprint, { taskIds }, user, trx),
        this.sprintRepository.deleteSprint(sprint, trx)
      ])

      this.eventService
        .sendEvent({
          userId: user.id,
          project: {
            id: sprint.projectId,
            sprint: {
              id: sprint.id,
              delete: {
                projectId: sprint.projectId,
                dateDeleted: new Date()
              }
            }
          }
        })
        .then()
        .catch(e => {
          console.error(e)
        })

      await trx.commit()

      await this.projectCacheService.deleteSprints(sprint.projectId)
    } catch (e) {
      await trx.rollback()
      throw e
    }
  }

  private checkIntersections(dates: checkIntersectionsDto, sprint: SprintModel) {
    if (dates.dateStart && dates.dateEnd && dates.dateStart > dates.dateEnd) {
      throw new NotFoundException(
        this.i18n.t('dateStart > dateEnd', { lang: I18nContext.current().lang })
      )
    }

    if (dates.dateStart && dates.dateStart > sprint.dateEnd) {
      throw new NotFoundException(
        this.i18n.t('dateStart > sprint.dateEnd', { lang: I18nContext.current().lang })
      )
    }

    if (dates.dateEnd && dates.dateEnd < sprint.dateStart) {
      throw new NotFoundException(
        this.i18n.t('dateEnd < sprint.dateStart', { lang: I18nContext.current().lang })
      )
    }
  }
}
