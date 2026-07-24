import { ITaskProjectPermissions } from './entities/task.project-permission.interface'
import { IFolderProjectPermissions } from './entities/folder.project-permission.interface'
import { ISprintProjectPermissions } from './entities/sprint.project-permission.interface'
import { IReportProjectPermissions } from './entities/report.project-permission.interface'
import { ProjectRoleType } from './roles/project-role.interface'
import { ITagProjectPermissions } from './entities/tag.project-permission.interface'

export interface IProjectPermissions
  extends ITaskProjectPermissions,
    IFolderProjectPermissions,
    ISprintProjectPermissions,
    IReportProjectPermissions,
    ITagProjectPermissions {
  manageAdmins: boolean
  delete: boolean
  edit: boolean
  addUsers: boolean
  removeUsers: boolean
}

export interface IProjectPermissionsRole {
  role: ProjectRoleType
  permissions?: IProjectPermissions
}
