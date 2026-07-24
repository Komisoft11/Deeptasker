import { IsOptional } from 'class-validator'
import { IProjectPermissions } from '../../../../components/permissions/types/project-permissions.interface'
import { AutoMap } from '@automapper/classes'

export class PermissionsDto implements IProjectPermissions {
  @IsOptional()
  @AutoMap()
  delete: boolean

  @IsOptional()
  @AutoMap()
  edit: boolean

  @IsOptional()
  @AutoMap()
  addUsers: boolean

  @IsOptional()
  @AutoMap()
  removeUsers: boolean

  @IsOptional()
  @AutoMap()
  manageAdmins: boolean

  @IsOptional()
  @AutoMap()
  openTasks: boolean

  @IsOptional()
  @AutoMap()
  createTasks: boolean

  @IsOptional()
  @AutoMap()
  deleteTasks: boolean

  @IsOptional()
  @AutoMap()
  moveTasks: boolean

  @IsOptional()
  @AutoMap()
  changeTaskAssigner: boolean

  @IsOptional()
  @AutoMap()
  changeTaskExecutor: boolean

  @IsOptional()
  @AutoMap()
  deleteTaskComments: boolean

  @IsOptional()
  @AutoMap()
  deleteTaskFile: boolean

  @IsOptional()
  @AutoMap()
  editTaskTracking: boolean

  @IsOptional()
  @AutoMap()
  editTaskDescription: boolean

  @IsOptional()
  @AutoMap()
  editTaskTitle: boolean

  @IsOptional()
  @AutoMap()
  editTaskDeadline: boolean

  @IsOptional()
  @AutoMap()
  editTaskStatus: boolean

  @IsOptional()
  @AutoMap()
  manageTaskObservers: boolean

  @IsOptional()
  @AutoMap()
  editTaskPriority: boolean

  @IsOptional()
  @AutoMap()
  editTaskTags: boolean

  @IsOptional()
  @AutoMap()
  executeTask: boolean

  @IsOptional()
  @AutoMap()
  confirmExecuteTask: boolean

  @IsOptional()
  @AutoMap()
  createFolders: boolean

  @IsOptional()
  @AutoMap()
  editFolders: boolean

  @IsOptional()
  @AutoMap()
  deleteFolders: boolean

  @IsOptional()
  @AutoMap()
  createSprints: boolean

  @IsOptional()
  @AutoMap()
  updateSprints: boolean

  @IsOptional()
  @AutoMap()
  deleteSprints: boolean

  @IsOptional()
  @AutoMap()
  generateReports: boolean

  @IsOptional()
  @AutoMap()
  listReports: boolean

  @IsOptional()
  @AutoMap()
  deleteReports: boolean

  @IsOptional()
  @AutoMap()
  createTags: boolean

  @IsOptional()
  @AutoMap()
  updateTags: boolean

  @IsOptional()
  @AutoMap()
  deleteTags: boolean
}
