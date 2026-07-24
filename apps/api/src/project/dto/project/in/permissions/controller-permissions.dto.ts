import { ProjectControllerPermissions } from '../../../../components/permissions/types/roles/controller-permissions.interface'
import { UserPermissionsDto } from './user-permissions.dto'
import { IsBoolean } from 'class-validator'

export class ControllerPermissionsDto
  extends UserPermissionsDto
  implements ProjectControllerPermissions
{
  @IsBoolean()
  generateReports: boolean

  @IsBoolean()
  removeUsers: boolean

  @IsBoolean()
  moveTasks: boolean

  @IsBoolean()
  deleteTasks: boolean

  @IsBoolean()
  confirmExecuteTask: boolean

  @IsBoolean()
  deleteTaskFile: boolean

  @IsBoolean()
  manageTaskObservers: boolean

  @IsBoolean()
  deleteTaskComments: boolean

  @IsBoolean()
  editTaskStatus: boolean

  @IsBoolean()
  editTaskTracking: boolean

  @IsBoolean()
  listReports: boolean

  @IsBoolean()
  deleteReports: boolean
}
