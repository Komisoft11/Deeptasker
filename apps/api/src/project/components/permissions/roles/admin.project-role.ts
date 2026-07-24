import { PermissionsProjectRole } from './base.project-role'
import { ProjectRoleEnum, ProjectRoleType } from '../types/roles/project-role.interface'
import { ProjectAdminPermissions } from '../types/roles/admin-permissions.interface'

export class AdminProjectRole extends PermissionsProjectRole {
  public static readonly role: ProjectRoleType = ProjectRoleEnum.admin
  public static readonly defaultPermissions: ProjectAdminPermissions = {
    openTasks: true,
    createTasks: true,
    deleteTasks: true,
    moveTasks: true,
    changeTaskAssigner: true,
    changeTaskExecutor: true,
    deleteTaskComments: true,
    deleteTaskFile: true,
    editTaskTracking: true,
    editTaskDescription: true,
    editTaskTitle: true,
    editTaskDeadline: true,
    editTaskStatus: true,
    manageTaskObservers: true,
    editTaskPriority: true,
    editTaskTags: true,
    executeTask: true,
    confirmExecuteTask: true,
    createFolders: true,
    editFolders: true,
    deleteFolders: true,
    createSprints: true,
    updateSprints: true,
    deleteSprints: true,
    generateReports: true,
    listReports: true,
    deleteReports: true,
    manageAdmins: true,
    delete: true,
    edit: true,
    addUsers: true,
    removeUsers: true,
    createTags: true,
    updateTags: true,
    deleteTags: true
  }

  constructor(permissions?: ProjectAdminPermissions) {
    super(AdminProjectRole.role, { ...AdminProjectRole.defaultPermissions, ...permissions })
  }
}
