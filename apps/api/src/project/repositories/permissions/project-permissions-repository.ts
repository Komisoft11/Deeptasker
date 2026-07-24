import { Injectable } from '@nestjs/common'
import { ProjectPermissionsModel } from '../../models/project-permissions.model'
import { InjectModel } from '@squareboat/nestjs-objection'
import { Repository } from '../../../common/database/repository'
import { IProjectPermissionsRepository } from './project-permissions-repository.interface'
import { TransactionOrKnex } from 'objection'
import { PermissionsProjectRole } from '../../components/permissions/roles/base.project-role'
import { IProjectPermissions } from '../../components/permissions/types/project-permissions.interface'

@Injectable()
export class ProjectPermissionsRepository
  extends Repository<ProjectPermissionsModel>
  implements IProjectPermissionsRepository
{
  @InjectModel(ProjectPermissionsModel)
  model: ProjectPermissionsModel

  public async getPermissionsProjectRole(
    projectId: number,
    userId: number
  ): Promise<PermissionsProjectRole> {
    const projectPermissionsModel = await ProjectPermissionsModel.query()
      .where('projectId', projectId)
      .where('userId', userId)
      .limit(1)
      .first()

    return new PermissionsProjectRole(projectPermissionsModel.role, {
      openTasks: projectPermissionsModel?.openTasks ?? false,
      createTasks: projectPermissionsModel?.createTasks ?? false,
      deleteTasks: projectPermissionsModel?.deleteTasks ?? false,
      moveTasks: projectPermissionsModel?.moveTasks ?? false,
      changeTaskAssigner: projectPermissionsModel?.changeTaskAssigner ?? false,
      changeTaskExecutor: projectPermissionsModel?.changeTaskExecutor ?? false,
      deleteTaskComments: projectPermissionsModel?.deleteTaskComments ?? false,
      deleteTaskFile: projectPermissionsModel?.deleteTaskFile ?? false,
      editTaskTracking: projectPermissionsModel?.editTaskTracking ?? false,
      editTaskDescription: projectPermissionsModel?.editTaskDescription ?? false,
      editTaskTitle: projectPermissionsModel?.editTaskTitle ?? false,
      editTaskDeadline: projectPermissionsModel?.editTaskDeadline ?? false,
      editTaskStatus: projectPermissionsModel?.editTaskStatus ?? false,
      manageTaskObservers: projectPermissionsModel?.manageTaskObservers ?? false,
      editTaskPriority: projectPermissionsModel?.editTaskPriority ?? false,
      editTaskTags: projectPermissionsModel?.editTaskTags ?? false,
      executeTask: projectPermissionsModel?.executeTask ?? false,
      confirmExecuteTask: projectPermissionsModel?.confirmExecuteTask ?? false,
      createFolders: projectPermissionsModel?.createFolders ?? false,
      editFolders: projectPermissionsModel?.editFolders ?? false,
      deleteFolders: projectPermissionsModel?.deleteFolders ?? false,
      createSprints: projectPermissionsModel?.createSprints ?? false,
      updateSprints: projectPermissionsModel?.updateSprints ?? false,
      deleteSprints: projectPermissionsModel?.deleteSprints ?? false,
      generateReports: projectPermissionsModel?.generateReports ?? false,
      listReports: projectPermissionsModel?.listReports ?? false,
      deleteReports: projectPermissionsModel?.deleteReports ?? false,
      manageAdmins: projectPermissionsModel?.manageAdmins ?? false,
      delete: projectPermissionsModel?.delete ?? false,
      edit: projectPermissionsModel?.edit ?? false,
      addUsers: projectPermissionsModel?.addUsers ?? false,
      removeUsers: projectPermissionsModel?.removeUsers ?? false,
      createTags: projectPermissionsModel?.createTags ?? false,
      updateTags: projectPermissionsModel?.updateTags ?? false,
      deleteTags: projectPermissionsModel?.deleteTags ?? false
    })
  }

  public async hasAccessToProject(projectId: number, userId: number): Promise<boolean> {
    return ProjectPermissionsModel.query()
      .where('projectId', projectId)
      .where('userId', userId)
      .exists()
  }

  public async hasProjectPermissions(
    projectId: number,
    userId: number,
    permissions: Partial<IProjectPermissions>
  ): Promise<boolean> {
    const permissionsExpressions = Object.keys(permissions).reduce(
      (expr, permission) => ({ ...expr, [permission]: permissions[permission] }),
      {}
    )

    return ProjectPermissionsModel.query()
      .where('projectId', projectId)
      .andWhere('userId', userId)
      .andWhere(permissionsExpressions)
      .exists()
  }

  public async giveProjectRolePermissionsToUser(
    projectId: number,
    userId: number,
    permissionsProjectRole: PermissionsProjectRole,
    trx?: TransactionOrKnex
  ): Promise<ProjectPermissionsModel> {
    return ProjectPermissionsModel.query(trx)
      .insert({
        projectId: projectId,
        userId: userId,
        role: permissionsProjectRole.getRole(),
        ...permissionsProjectRole.getPermissions()
      })
      .onConflict(['userId', 'projectId'])
      .merge()
  }

  public async giveProjectRolePermissionsToUsers(
    projectId: number,
    userIds: number[],
    permissionsProjectRole: PermissionsProjectRole,
    trx?: TransactionOrKnex
  ): Promise<void> {
    await ProjectPermissionsModel.query(trx)
      .insert(
        userIds.map(userId => {
          return {
            projectId: projectId,
            userId: userId,
            role: permissionsProjectRole.getRole(),
            ...permissionsProjectRole.getPermissions()
          }
        })
      )
      .onConflict(['userId', 'projectId'])
      .merge()
  }

  public async updateProjectRolePermissionsForUser(
    projectId: number,
    userId: number,
    permissionsProjectRole: PermissionsProjectRole,
    trx?: TransactionOrKnex
  ): Promise<void> {
    await ProjectPermissionsModel.query(trx)
      .patch({
        role: permissionsProjectRole.getRole(),
        ...permissionsProjectRole.getPermissions()
      })
      .where('userId', userId)
      .where('projectId', projectId)
  }
}
