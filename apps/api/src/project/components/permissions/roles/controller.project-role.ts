import { PermissionsProjectRole } from './base.project-role'
import { ProjectRoleEnum, ProjectRoleType } from '../types/roles/project-role.interface'
import { ProjectControllerPermissions } from '../types/roles/controller-permissions.interface'

export class ControllerProjectRole extends PermissionsProjectRole {
  public static readonly role: ProjectRoleType = ProjectRoleEnum.controller
  public static readonly defaultPermissions: ProjectControllerPermissions = {
    openTasks: true,
    createTasks: true,
    createFolders: true,
    generateReports: true,
    removeUsers: true,
    moveTasks: true,
    deleteTasks: true,
    confirmExecuteTask: true,
    deleteTaskFile: true,
    manageTaskObservers: true,
    deleteTaskComments: true,
    editTaskStatus: true,
    editTaskTracking: true,
    listReports: true,
    deleteReports: true,
    createTags: true,
    updateTags: true,
    deleteTags: true
  }

  constructor(permissions: ProjectControllerPermissions) {
    super(ControllerProjectRole.role, {
      ...ControllerProjectRole.defaultPermissions,
      ...permissions
    })
  }
}
