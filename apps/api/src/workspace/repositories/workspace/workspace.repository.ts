import { CustomQueryBuilder, InjectModel } from '@squareboat/nestjs-objection'
import { Injectable } from '@nestjs/common'
import { Repository } from '../../../common/database/repository'
import { WorkspaceModel } from '../../models/workspace.model'
import { IWorkspaceRepository } from './workspace-repository.interface'
import { CreateWorkspaceDto } from '../../dto/in/create-workspace.dto'
import { UserModel } from '../../../user/models/user.model'
import { FetchGraphOptions, RelationExpression, TransactionOrKnex } from 'objection'
import { UpdateWorkspaceDto } from '../../dto/in/update-workspace.dto'
import { getCurrentUTCDateTime } from '../../../common/helpers/date'
import { WorkspaceUserModel } from '../../models/workspace-user.model'
import { ProjectModel } from '../../../project/models/project.model'
import { DataBaseException } from '../../../exceptions/DataBaseException'

@Injectable()
export class WorkspaceRepository
  extends Repository<WorkspaceModel>
  implements IWorkspaceRepository
{
  @InjectModel(WorkspaceModel)
  model: WorkspaceModel

  public async createWorkspace(
    createWorkspaceDto: CreateWorkspaceDto,
    user: UserModel,
    trx?: TransactionOrKnex
  ): Promise<WorkspaceModel> {
    try {
      return WorkspaceModel.query(trx).insert({
        title: createWorkspaceDto.title,
        userId: user.id
      })
    } catch (e) {
      throw new DataBaseException(e)
    }
  }

  public async getWorkspace(id: number): Promise<WorkspaceModel> {
    try {
      return WorkspaceModel.query().findOne('id', id).where('dateDeleted', null)
    } catch (e) {
      throw new DataBaseException(e)
    }
  }

  public async updateWorkspace(
    workspace: WorkspaceModel,
    updateWorkspaceDto: UpdateWorkspaceDto
  ): Promise<void> {
    try {
      await workspace.$query().patch(updateWorkspaceDto)
    } catch (e) {
      throw new DataBaseException(e)
    }
  }

  public async deleteWorkspace(workspace: WorkspaceModel, trx?: TransactionOrKnex): Promise<void> {
    try {
      await workspace.$query(trx).patch({
        dateDeleted: getCurrentUTCDateTime()
      })
    } catch (e) {
      throw new DataBaseException(e)
    }
  }

  public async getUserWorkspaces(user: UserModel): Promise<WorkspaceModel[]> {
    try {
      const workspaces = await WorkspaceModel.query()
        .alias('w')
        .withGraphJoined('user(selectShortColor)')
        .leftJoin('workspace_user as wu', builder => {
          builder.on('wu.workspaceId', 'w.id').andOnVal('wu.userId', user.id)
        })
        .leftJoin('project as p', 'p.workspace_id', 'w.id')
        .leftJoin('project_permissions as pp', 'pp.project_id', 'p.id')
        .where('w.dateDeleted', null)
        .andWhere(builder => {
          builder
            .where('w.userId', user.id)
            .orWhereNotNull('wu.userId')
            .orWhere('pp.user_id', user.id)
            .orWhere(builder => {
              builder.where('p.user_id', user.id).whereNull('p.date_deleted')
            })
        })
        .distinct()

      await Promise.all(workspaces.map(workspace => workspace.loadProjectCount(workspace.id)))

      return workspaces
    } catch (e) {
      throw new DataBaseException(e)
    }
  }

  public async fetchGraph(
    workspace: WorkspaceModel,
    expression: RelationExpression<WorkspaceModel>,
    options?: FetchGraphOptions
  ): Promise<CustomQueryBuilder<WorkspaceModel, WorkspaceModel>> {
    try {
      return workspace.$fetchGraph(expression, options)
    } catch (e) {
      throw new DataBaseException(e)
    }
  }

  public async createWorkspaceUser(
    userId: number,
    workspaceId: number,
    trx?: TransactionOrKnex
  ): Promise<void> {
    try {
      await WorkspaceUserModel.query(trx)
        .insert({
          userId: userId,
          workspaceId: workspaceId
        })
        .onConflict(['userId', 'workspaceId'])
        .ignore()
    } catch (e) {
      throw new DataBaseException(e)
    }
  }

  public async removeWorkspaceUser(
    userId: number,
    workspaceId: number,
    trx?: TransactionOrKnex
  ): Promise<void> {
    try {
      await WorkspaceUserModel.query(trx)
        .where('workspaceId', workspaceId)
        .where('userId', userId)
        .delete()
    } catch (e) {
      throw new DataBaseException(e)
    }
  }

  public async getProjects(
    workspace: WorkspaceModel,
    trx?: TransactionOrKnex
  ): Promise<ProjectModel[]> {
    try {
      return ProjectModel.query(trx)
        .where('workspaceId', workspace.id)
        .andWhere('dateDeleted', null)
    } catch (e) {
      throw new DataBaseException(e)
    }
  }

  public async getAdmins(workspaceId: number, trx?: TransactionOrKnex): Promise<UserModel[]> {
    try {
      return WorkspaceModel.relatedQuery<UserModel>('admins', trx)
        .for(workspaceId)
        .modify(['selectShortColor', 'notDeleted', 'activeTask'])
    } catch (e) {
      throw new DataBaseException(e)
    }
  }

  public async getOwnerAndAdmins(
    workspaceId: number,
    trx?: TransactionOrKnex
  ): Promise<UserModel[]> {
    try {
      const [workspace, admins] = await Promise.all([
        WorkspaceModel.query(trx)
          .select('userId')
          .where('id', workspaceId)
          .andWhere('dateDeleted', null)
          .first(),
        this.getAdmins(workspaceId, trx)
      ])

      return UserModel.query(trx).findByIds([workspace.userId, ...admins.map(item => item.id)])
    } catch (e) {
      throw new DataBaseException(e)
    }
  }
}
