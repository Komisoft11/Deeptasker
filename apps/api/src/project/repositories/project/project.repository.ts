import { CustomQueryBuilder, InjectModel } from '@squareboat/nestjs-objection'
import { Injectable } from '@nestjs/common'
import { Repository } from '../../../common/database/repository'
import { FetchGraphOptions, RelationExpression, TransactionOrKnex } from 'objection'
import { IProjectWithWorkspace, ProjectModel } from '../../models/project.model'
import { IProjectRepository } from './project-repository.interface'
import { ProjectPermissionsModel } from '../../models/project-permissions.model'
import { CreateProjectDto, ProjectSettingsDto } from '../../dto/project/in/create-project.dto'
import { WorkspaceModel } from '../../../workspace/models/workspace.model'
import { UserModel } from '../../../user/models/user.model'
import { generateFgColorForBg, generateRandomBgColor } from '../../../common/helpers/color'
import { WorkspaceUserModel } from '../../../workspace/models/workspace-user.model'
import { UpdateProjectDto } from '../../dto/project/in/update-project.dto'
import { getCurrentUTCDateTime } from '../../../common/helpers/date'
import { ProjectExtraProperties } from '../../services/project/project.service'
import { Knex } from '@mikro-orm/postgresql'
import { ProjectSettingsModel } from '../../models/project-settings.model'
import { DataBaseException } from '../../../exceptions/DataBaseException'
import {
  ProjectRoleEnum,
  ProjectRoleType
} from '../../components/permissions/types/roles/project-role.interface'

@Injectable()
export class ProjectRepository extends Repository<ProjectModel> implements IProjectRepository {
  @InjectModel(ProjectModel)
  model: ProjectModel

  public async createProject(
    createProjectDto: CreateProjectDto,
    workspaceId: number,
    userId: number,
    slug: string,
    trx?: TransactionOrKnex
  ): Promise<ProjectModel> {
    try {
      const bgColor = generateRandomBgColor()
      const fgColor = generateFgColorForBg(bgColor)

      return ProjectModel.query(trx).insert({
        title: createProjectDto.title,
        slug: slug,
        workspaceId: workspaceId,
        userId: userId,
        iconBg: bgColor,
        iconFg: fgColor,
        order: 1
      })
    } catch (e) {
      throw new DataBaseException(e)
    }
  }

  public async getProject(id: number): Promise<ProjectModel> {
    try {
      return ProjectModel.query().findOne({ id: id, dateArchived: null, dateDeleted: null })
    } catch (e) {
      throw new DataBaseException(e)
    }
  }

  public async getBySlugInWorkspace(workspaceId: number, slug: string): Promise<ProjectModel> {
    try {
      return ProjectModel.query().findOne({
        slug,
        workspaceId,
        dateArchived: null,
        dateDeleted: null
      })
    } catch (e) {
      throw new DataBaseException(e)
    }
  }

  public async getArchivedProject(id: number, trx?: TransactionOrKnex): Promise<ProjectModel> {
    try {
      return ProjectModel.query(trx)
        .where('id', id)
        .andWhereNot('dateArchived', null)
        .andWhere('dateDeleted', null)
        .first()
    } catch (e) {
      throw new DataBaseException(e)
    }
  }

  public async getProjectUserRole(
    projectId: number,
    userId: number
  ): Promise<ProjectRoleType | undefined> {
    try {
      const projectUser = await ProjectPermissionsModel.query()
        .select('role')
        .where('projectId', projectId)
        .where('userId', userId)
        .limit(1)
        .first()

      return projectUser?.role
    } catch (e) {
      throw new DataBaseException(e)
    }
  }

  public async getWorkspaceAdmins(
    id: number,
    trx?: TransactionOrKnex
  ): Promise<WorkspaceUserModel[]> {
    try {
      return WorkspaceUserModel.query(trx).where('workspaceId', id)
    } catch (e) {
      throw new DataBaseException(e)
    }
  }

  public async updateProject(
    project: ProjectModel,
    updateProjectDto: UpdateProjectDto,
    trx?: TransactionOrKnex
  ): Promise<void> {
    try {
      await project.$query(trx).patch({
        title: updateProjectDto.title,
        slug: updateProjectDto.slug,
        dateArchived: updateProjectDto.dateArchived
      })
    } catch (e) {
      throw new DataBaseException(e)
    }
  }

  public async deleteProject(projectId: number, trx?: TransactionOrKnex): Promise<void> {
    try {
      await ProjectModel.query(trx)
        .patch({
          dateDeleted: getCurrentUTCDateTime()
        })
        .where('id', projectId)
    } catch (e) {
      throw new DataBaseException(e)
    }
  }

  public async getProjectsByUser(
    user: UserModel,
    workspace: WorkspaceModel
  ): Promise<ProjectModel[]> {
    try {
      return this.getProjectsByUserQuery(user, workspace, false)
    } catch (e) {
      throw new DataBaseException(e)
    }
  }

  public async getArchivedProjectsByUser(
    user: UserModel,
    workspace: WorkspaceModel,
    fields: ProjectExtraProperties
  ): Promise<ProjectModel[]> {
    try {
      return this.getProjectsByUserQuery(user, workspace, true)
        .when(fields.includes('members'), cb =>
          cb.withGraphFetched('members(notDeleted,selectShortColor)')
        )
        .when(fields.includes('user'), cb => cb.withGraphJoined('user(selectShortColor)'))
    } catch (e) {
      throw new DataBaseException(e)
    }
  }

  public async getProjectByUser(
    id: number,
    workspace: WorkspaceModel,
    user: UserModel
  ): Promise<ProjectModel> {
    try {
      return this.getProjectsByUserQuery(user, workspace, false)
        .withGraphJoined('user(selectShortColor)')
        .withGraphFetched('[statuses(notDeleted), tags, settings]')
        .modifyGraph('settings', builder => {
          builder.select(['isReviewRequired'])
        })
        .andWhere('p.id', id)
        .first()
    } catch (e) {
      throw new DataBaseException(e)
    }
  }

  public async getArchivedProjectByUser(
    id: number,
    workspace: WorkspaceModel,
    user: UserModel
  ): Promise<ProjectModel> {
    try {
      return this.getProjectsByUserQuery(user, workspace, true)
        .withGraphJoined('user(selectShortColor)')
        .andWhere('p.id', id)
        .first()
    } catch (e) {
      throw new DataBaseException(e)
    }
  }

  public async isSlugExists(slug: string): Promise<boolean> {
    try {
      return ProjectModel.query().where('slug', slug).exists()
    } catch (e) {
      throw new DataBaseException(e)
    }
  }

  public async hasProjectAccess(
    user: UserModel,
    projectId: number,
    projectRole?: ProjectRoleType
  ): Promise<boolean> {
    try {
      return ProjectModel.query()
        .alias('p')
        .leftJoinRelated('permissions', { alias: 'pp' })
        .where('p.id', projectId)
        .where(builder => {
          builder.where('p.userId', user.id).orWhere(builder => {
            builder.where('pp.userId', user.id)
            if (projectRole) {
              builder.andWhere('pp.role', projectRole)
            }
          })
        })
        .exists()
    } catch (e) {
      throw new DataBaseException(e)
    }
  }

  public async pathGuestAccessToProject(
    project: ProjectModel,
    userIdToGiveAccess: number,
    trx?: TransactionOrKnex
  ): Promise<ProjectPermissionsModel> {
    try {
      let projectUser = await ProjectPermissionsModel.query(trx)
        .where('userId', userIdToGiveAccess)
        .where('projectId', project.id)
        .limit(1)
        .first()

      if (!projectUser) {
        projectUser = await ProjectPermissionsModel.query(trx).insert({
          userId: userIdToGiveAccess,
          projectId: project.id,
          role: ProjectRoleEnum.guest
        })
      }

      return projectUser
    } catch (e) {
      throw new DataBaseException(e)
    }
  }

  public async removeUserFromProject(
    project: ProjectModel,
    userToRemove: UserModel,
    trx?: Knex.Transaction
  ): Promise<void> {
    try {
      await ProjectPermissionsModel.query(trx)
        .delete()
        .where('userId', userToRemove.id)
        .where('projectId', project.id)
    } catch (e) {
      throw new DataBaseException(e)
    }
  }

  public async fetchGraph(
    project: ProjectModel,
    expression: RelationExpression<ProjectModel>,
    options?: FetchGraphOptions
  ): Promise<CustomQueryBuilder<ProjectModel, ProjectModel>> {
    try {
      return project.$fetchGraph(expression, options)
    } catch (e) {
      throw new DataBaseException(e)
    }
  }

  public async getMembers(project: ProjectModel, trx?: TransactionOrKnex): Promise<UserModel[]> {
    try {
      return project.$relatedQuery('members', trx)
    } catch (e) {
      throw new DataBaseException(e)
    }
  }

  public async getNumberOfMembers(
    project: IProjectWithWorkspace,
    trx?: TransactionOrKnex
  ): Promise<number> {
    try {
      return ProjectPermissionsModel.query(trx).where('projectId', project.id).resultSize()
    } catch (e) {
      throw new DataBaseException(e)
    }
  }

  public async getWorkspace(
    project: ProjectModel,
    trx?: TransactionOrKnex
  ): Promise<WorkspaceModel> {
    try {
      return project.$relatedQuery('workspace', trx)
    } catch (e) {
      throw new DataBaseException(e)
    }
  }

  public async addProjectSettings(
    project: ProjectModel,
    settingsDto: ProjectSettingsDto,
    trx?: TransactionOrKnex
  ): Promise<ProjectSettingsModel> {
    try {
      return ProjectSettingsModel.query(trx).insert({ projectId: project.id, ...settingsDto })
    } catch (e) {
      throw new DataBaseException(e)
    }
  }

  private getProjectsByUserQuery(
    user: UserModel,
    workspace: WorkspaceModel,
    isArchived: boolean = false
  ): CustomQueryBuilder<ProjectModel, ProjectModel[]> {
    try {
      const query = ProjectModel.query()
        .alias('p')
        .select(['p.*'])
        .where(b => {
          b.where('p.userId', user.id).orWhere(
            'p.id',
            'in',
            ProjectPermissionsModel.query().select('projectId').where('userId', user.id)
          )
        })
        .andWhere('p.workspaceId', workspace.id)
        .andWhere('p.dateDeleted', null)

      if (isArchived) {
        query.andWhereNot('p.dateArchived', null)
      } else {
        query.andWhere('p.dateArchived', null)
      }

      return query
    } catch (e) {
      throw new DataBaseException(e)
    }
  }

  public async isTitleExists(title: string, workspaceId: number): Promise<boolean> {
    try {
      return ProjectModel.query()
        .where('title', title)
        .andWhere('workspaceId', workspaceId)
        .andWhere('dateDeleted', null)
        .exists()
    } catch (e) {
      throw new DataBaseException(e)
    }
  }

  public async getProjectsByWorkspace(workspace: WorkspaceModel): Promise<ProjectModel[]> {
    return ProjectModel.query().where('workspaceId', workspace.id).andWhere('dateDeleted', null)
  }
}
