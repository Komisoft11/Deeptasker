import { PermissionsProjectRole } from './base.project-role'
import { ProjectRoleEnum, ProjectRoleType } from '../types/roles/project-role.interface'
import { ProjectAssignerPermissions } from '../types/roles/assigner-permissions.interface'

export class AssignerProjectRole extends PermissionsProjectRole {
  public static readonly role: ProjectRoleType = ProjectRoleEnum.assigner
  public static readonly defaultPermissions: ProjectAssignerPermissions = {
    openTasks: true,
    createTasks: true,
    createFolders: true,
    createSprints: true,
    editFolders: true,
    deleteFolders: true,
    moveTasks: true,
    changeTaskAssigner: true,
    changeTaskExecutor: true,
    deleteTaskFile: true,
    manageTaskObservers: true,
    editTaskDeadline: true,
    editTaskDescription: true,
    editTaskPriority: true,
    editTaskStatus: true,
    editTaskTags: true,
    editTaskTitle: true,
    updateSprints: true,
    deleteSprints: true,
    listReports: true,
    createTags: true,
    updateTags: true,
    deleteTags: true
  }

  constructor(permissions?: ProjectAssignerPermissions) {
    super(AssignerProjectRole.role, { ...AssignerProjectRole.defaultPermissions, ...permissions })
  }
}
