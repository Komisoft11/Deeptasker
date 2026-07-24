import { CustomQueryBuilder, RepositoryContract } from '@squareboat/nestjs-objection'
import { ProjectPermissionsModel } from '../../models/project-permissions.model'
import { TransactionOrKnex } from 'objection'
import { PermissionsProjectRole } from '../../components/permissions/roles/base.project-role'
import { IProjectPermissions } from '../../components/permissions/types/project-permissions.interface'

export const PROJECT_PERMISSIONS_REPOSITORY = 'project_permissions_repository'

export interface IProjectPermissionsRepository extends RepositoryContract<ProjectPermissionsModel> {
  query<R = ProjectPermissionsModel>(): CustomQueryBuilder<ProjectPermissionsModel, R>

  getPermissionsProjectRole(projectId: number, userId: number): Promise<PermissionsProjectRole>

  hasAccessToProject(projectId: number, userId: number): Promise<boolean>

  hasProjectPermissions(
    projectId: number,
    userId: number,
    permissions: Partial<IProjectPermissions>
  ): Promise<boolean>

  giveProjectRolePermissionsToUser(
    projectId: number,
    userId: number,
    permissionsProjectRole: PermissionsProjectRole,
    trx?: TransactionOrKnex
  ): Promise<ProjectPermissionsModel>

  giveProjectRolePermissionsToUsers(
    projectId: number,
    userIds: number[],
    permissionsProjectRole: PermissionsProjectRole,
    trx?: TransactionOrKnex
  ): Promise<void>

  updateProjectRolePermissionsForUser(
    projectId: number,
    userId: number,
    permissionsProjectRole: PermissionsProjectRole,
    trx?: TransactionOrKnex
  ): Promise<void>
}
