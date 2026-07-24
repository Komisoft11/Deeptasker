import { IsBoolean } from 'class-validator'
import { ProjectAssignerPermissions } from '../../../../components/permissions/types/roles/assigner-permissions.interface'
import { UserPermissionsDto } from './user-permissions.dto'

export class AssignerPermissionsDto
  extends UserPermissionsDto
  implements ProjectAssignerPermissions
{
  @IsBoolean()
  editFolders: boolean

  @IsBoolean()
  deleteFolders: boolean

  @IsBoolean()
  moveTasks: boolean

  @IsBoolean()
  changeTaskAssigner: boolean

  @IsBoolean()
  changeTaskExecutor: boolean

  @IsBoolean()
  deleteTaskFile: boolean

  @IsBoolean()
  manageTaskObservers: boolean

  @IsBoolean()
  editTaskDeadline: boolean

  @IsBoolean()
  editTaskDescription: boolean

  @IsBoolean()
  editTaskPriority: boolean

  @IsBoolean()
  editTaskStatus: boolean

  @IsBoolean()
  editTaskTags: boolean

  @IsBoolean()
  editTaskTitle: boolean

  @IsBoolean()
  updateSprints: boolean

  @IsBoolean()
  deleteSprints: boolean

  @IsBoolean()
  createSprints: boolean

  @IsBoolean()
  listReports: boolean
}
