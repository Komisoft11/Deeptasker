import { IsBoolean, IsOptional } from 'class-validator'
import { WorkspaceAdminPermissions } from '../../components/permissions/types/roles/admin-permissions.interface'

export class WorkspacePermissionsDto implements WorkspaceAdminPermissions {
  @IsOptional()
  @IsBoolean()
  createProjects: boolean

  @IsOptional()
  @IsBoolean()
  deleteProjects: boolean

  @IsOptional()
  @IsBoolean()
  editProjects: boolean

  @IsOptional()
  @IsBoolean()
  manageAdmins: boolean

  @IsOptional()
  @IsBoolean()
  edit: boolean
}
