import { ProjectAdminPermissions } from 'src/project/components/permissions/types/roles/admin-permissions.interface'
import { AssignerPermissionsDto } from './assigner-permissions.dto'
import { IsBoolean } from 'class-validator'

export class AdminPermissionsDto extends AssignerPermissionsDto implements ProjectAdminPermissions {
  @IsBoolean()
  manageAdmins: boolean

  @IsBoolean()
  delete: boolean

  @IsBoolean()
  edit: boolean

  @IsBoolean()
  addUsers: boolean

  @IsBoolean()
  removeUsers: boolean

  @IsBoolean()
  deleteTasks: boolean

  @IsBoolean()
  deleteTaskComments: boolean

  @IsBoolean()
  editTaskTracking: boolean

  @IsBoolean()
  executeTask: boolean

  @IsBoolean()
  confirmExecuteTask: boolean

  @IsBoolean()
  generateReports: boolean

  @IsBoolean()
  deleteReports: boolean
}
