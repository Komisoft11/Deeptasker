import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { EventService } from '../../../events/event.service'
import { type ProjectExtraProperties, ProjectService } from './project.service'
import { UserModel } from '../../../user/models/user.model'
import { WorkspaceModel } from '../../../workspace/models/workspace.model'
import { ProjectModel } from '../../models/project.model'
import { I18nContext, I18nService } from 'nestjs-i18n'
import type { IProjectRepository } from '../../repositories/project/project-repository.interface'
import { PROJECT_REPOSITORY } from '../../repositories/project/project-repository.interface'
import { TaskResponse } from '../../../task/dto'
import { TaskService } from '../../../task/services/task.service'
import { IProjectService } from './interfaces/project.service.interface'
import { PlanService } from '../../../payment/services/plan.service'
import { ProjectDto } from '../../dto/project/out/project.dto'
import { ProjectCacheService } from '../../../cache/services/project.cache-service'
import { InjectMapper } from '@automapper/nestjs'
import type { Mapper } from '@automapper/core'

@Injectable()
export class ArchivedProjectService implements IProjectService {
  constructor(
    private projectService: ProjectService,
    private taskService: TaskService,
    private eventService: EventService,
    private planService: PlanService,
    @Inject(PROJECT_REPOSITORY) private readonly projectRepository: IProjectRepository,
    private readonly i18n: I18nService,
    @InjectMapper() private readonly mapper: Mapper,
    private readonly projectCacheService: ProjectCacheService
  ) {}

  public async getProjectsByUser(
    user: UserModel,
    workspace: WorkspaceModel,
    fields: ProjectExtraProperties
  ): Promise<ProjectDto[]> {
    const cached = await this.projectCacheService.get(workspace.id, user.id)

    if (cached) {
      return cached
    }

    const projects = await this.projectRepository.getArchivedProjectsByUser(user, workspace, fields)

    await Promise.all(projects.map(p => Promise.all([p.loadTaskCount(), p.loadFolderCount()])))

    const dto = this.mapper.mapArray(projects, ProjectModel, ProjectDto)

    await this.projectCacheService.set(workspace.id, user.id, dto)

    return dto
  }

  public async getSingleProjectByUser(
    id: number,
    workspace: WorkspaceModel,
    user: UserModel
  ): Promise<ProjectDto> {
    const project = await this.projectRepository.getArchivedProjectByUser(id, workspace, user)

    return this.mapper.map(project, ProjectModel, ProjectDto)
  }

  public async getProjectTasks(project: ProjectModel): Promise<TaskResponse[]> {
    return await this.taskService.getTasksByProject(project)
  }

  public async returnFromArchive(project: ProjectModel, user: UserModel) {
    if (!(await this.planService.canUnArchiveProject(project, user))) {
      throw new ForbiddenException(
        this.i18n.t('project.too_many_projects_upgrade_plan', { lang: I18nContext.current().lang })
      )
    }

    await project.$query().patch({
      dateArchived: null
    })

    await this.projectCacheService.deleteSingleProject(project.workspaceId, project.id)

    this.eventService
      .sendEvent({
        userId: user.id,
        project: {
          id: project.id,
          update: { dateArchived: null }
        }
      })
      .then()
      .catch(e => {
        console.error(e)
      })
  }

  public async get(id: number): Promise<ProjectModel> {
    const project = await this.projectRepository.getArchivedProject(id)

    if (!project) {
      throw new NotFoundException(this.i18n.t('project.not_found'))
    }

    return project
  }

  public async getProjectFolders(project: ProjectModel, user: UserModel) {
    return this.projectService.getProjectFolders(project, user)
  }

  public async getMembers(project: ProjectModel) {
    return this.projectRepository.getMembers(project)
  }
}
