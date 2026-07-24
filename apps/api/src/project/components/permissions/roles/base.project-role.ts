import { IProjectPermissions } from '../types/project-permissions.interface'
import { ProjectRoleType } from '../types/roles/project-role.interface'

interface IPermissionsProjectRole {
  getRole(): ProjectRoleType
  getPermissions(): IProjectPermissions
}

export class PermissionsProjectRole implements IPermissionsProjectRole {
  protected role: ProjectRoleType
  protected permissions: IProjectPermissions

  private static readonly default: IProjectPermissions = {
    openTasks: false,
    createTasks: false,
    deleteTasks: false,
    moveTasks: false,
    changeTaskAssigner: false,
    changeTaskExecutor: false,
    deleteTaskComments: false,
    deleteTaskFile: false,
    editTaskTracking: false,
    editTaskDescription: false,
    editTaskTitle: false,
    editTaskDeadline: false,
    editTaskStatus: false,
    manageTaskObservers: false,
    editTaskPriority: false,
    editTaskTags: false,
    executeTask: false,
    confirmExecuteTask: false,
    createFolders: false,
    editFolders: false,
    deleteFolders: false,
    createSprints: false,
    updateSprints: false,
    deleteSprints: false,
    generateReports: false,
    listReports: false,
    deleteReports: false,
    manageAdmins: false,
    delete: false,
    edit: false,
    addUsers: false,
    removeUsers: false,
    createTags: false,
    updateTags: false,
    deleteTags: false
  }

  constructor(role: ProjectRoleType, permissions: Partial<IProjectPermissions>) {
    this.role = role
    this.permissions = { ...PermissionsProjectRole.default, ...permissions }
  }

  getRole(): ProjectRoleType {
    return this.role
  }

  getPermissions(): IProjectPermissions {
    return this.permissions
  }
}
