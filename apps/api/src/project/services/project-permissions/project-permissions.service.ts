import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  IProjectPermissionsRepository,
  PROJECT_PERMISSIONS_REPOSITORY
} from '../../repositories/permissions/project-permissions-repository.interface'
import { ProjectPermissionsModel } from '../../models/project-permissions.model'
import { PermissionsRoleDto } from '../../dto/project/in/permissions/permissions-role.dto'
import { I18nContext, I18nService } from 'nestjs-i18n'
import { TransactionOrKnex } from 'objection'
import { AdminProjectRole } from '../../components/permissions/roles/admin.project-role'
import { AssignerProjectRole } from '../../components/permissions/roles/assigner.project-role'
import { ControllerProjectRole } from '../../components/permissions/roles/controller.project-role'
import { UserProjectRole } from '../../components/permissions/roles/user.project-role'
import { GuestProjectRole } from '../../components/permissions/roles/guest.project-role'
import { PermissionsProjectRole } from '../../components/permissions/roles/base.project-role'
import { IProjectPermissions } from '../../components/permissions/types/project-permissions.interface'

@Injectable()
export class ProjectPermissionsService {
  constructor(
    @Inject(PROJECT_PERMISSIONS_REPOSITORY)
    private readonly projectPermissionsRepository: IProjectPermissionsRepository,
    private readonly i18n: I18nService
  ) {}

  public async hasAccessToProject(projectId: number, userId: number): Promise<boolean> {
    return this.projectPermissionsRepository.hasAccessToProject(projectId, userId)
  }

  public async getProjectPermissions(
    projectId: number,
    userId: number
  ): Promise<PermissionsRoleDto> {
    const permissionsProjectRole =
      await this.projectPermissionsRepository.getPermissionsProjectRole(projectId, userId)

    if (!permissionsProjectRole) {
      throw new NotFoundException(
        this.i18n.t('user.not_found', { lang: I18nContext.current().lang })
      )
    }

    return {
      role: permissionsProjectRole.getRole(),
      permissions: permissionsProjectRole.getPermissions()
    }
  }

  public async hasProjectPermissions(
    projectId: number,
    userId: number,
    permissions: Partial<IProjectPermissions>
  ): Promise<boolean> {
    if (Object.keys(permissions).length === 0) {
      throw new Error('No permissions provided for checking')
    }

    return this.projectPermissionsRepository.hasProjectPermissions(projectId, userId, permissions)
  }

  public async giveProjectRolePermissionsToUser(
    projectId: number,
    userId: number,
    permissionDto: PermissionsRoleDto,
    trx?: TransactionOrKnex
  ): Promise<ProjectPermissionsModel> {
    const permissionsProjectRole = this.factoryProjectRolePermissions(permissionDto)

    return this.projectPermissionsRepository.giveProjectRolePermissionsToUser(
      projectId,
      userId,
      permissionsProjectRole,
      trx
    )
  }

  public async giveProjectRolePermissionsToUsers(
    projectId: number,
    userIds: number[],
    permissionDto: PermissionsRoleDto,
    trx?: TransactionOrKnex
  ): Promise<void> {
    const permissionsProjectRole = this.factoryProjectRolePermissions(permissionDto)

    await this.projectPermissionsRepository.giveProjectRolePermissionsToUsers(
      projectId,
      userIds,
      permissionsProjectRole,
      trx
    )
  }

  public async updateProjectRolePermissionsForUser(
    projectId: number,
    userId: number,
    projectPermissionsDto: PermissionsRoleDto,
    trx?: TransactionOrKnex
  ): Promise<ProjectPermissionsModel | void> {
    const permissionsModel = await this.projectPermissionsRepository.getPermissionsProjectRole(
      projectId,
      userId
    )

    if (!permissionsModel) {
      return this.giveProjectRolePermissionsToUser(projectId, userId, projectPermissionsDto, trx)
    }

    const permissionsProjectRole = this.factoryProjectRolePermissions(projectPermissionsDto)

    await this.projectPermissionsRepository.updateProjectRolePermissionsForUser(
      projectId,
      userId,
      permissionsProjectRole,
      trx
    )
  }

  private factoryProjectRolePermissions(
    projectPermissionsDto: PermissionsRoleDto
  ): PermissionsProjectRole {
    switch (projectPermissionsDto.role) {
      case AdminProjectRole.role:
        return new AdminProjectRole(projectPermissionsDto.permissions)
      case AssignerProjectRole.role:
        return new AssignerProjectRole(projectPermissionsDto.permissions)
      case ControllerProjectRole.role:
        return new ControllerProjectRole(projectPermissionsDto.permissions)
      case UserProjectRole.role:
        return new UserProjectRole(projectPermissionsDto.permissions)
      case GuestProjectRole.role:
        return new GuestProjectRole(projectPermissionsDto.permissions)
      default:
        throw new Error(`Unknown role: ${projectPermissionsDto.role}`)
    }
  }
}
