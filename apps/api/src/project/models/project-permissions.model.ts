import { MyBaseModel } from '../../common/database/base.model'
import { UserModel } from '../../user/models/user.model'
import { BaseModel } from '@squareboat/nestjs-objection'
import { AutoMap } from '@automapper/classes'
import { ProjectModel } from './project.model'
import { IProjectPermissions } from '../components/permissions/types/project-permissions.interface'
import { ProjectRoleType } from '../components/permissions/types/roles/project-role.interface'

export class ProjectPermissionsModel extends MyBaseModel implements IProjectPermissions {
  static tableName = 'project_permissions'

  id: number
  @AutoMap()
  projectId: number
  @AutoMap()
  userId: number
  @AutoMap()
  role: ProjectRoleType

  @AutoMap()
  delete: boolean
  @AutoMap()
  edit: boolean
  @AutoMap()
  addUsers: boolean
  @AutoMap()
  removeUsers: boolean
  @AutoMap()
  manageAdmins: boolean
  @AutoMap()
  listTasks: boolean
  @AutoMap()
  openTasks: boolean
  @AutoMap()
  createTasks: boolean
  @AutoMap()
  deleteTasks: boolean
  @AutoMap()
  moveTasks: boolean
  @AutoMap()
  changeTaskAssigner: boolean
  @AutoMap()
  changeTaskExecutor: boolean
  @AutoMap()
  deleteTaskComments: boolean
  @AutoMap()
  deleteTaskFile: boolean
  @AutoMap()
  editTaskTracking: boolean
  @AutoMap()
  editTaskDescription: boolean
  @AutoMap()
  editTaskTitle: boolean
  @AutoMap()
  editTaskDeadline: boolean
  @AutoMap()
  editTaskStatus: boolean
  @AutoMap()
  manageTaskObservers: boolean
  @AutoMap()
  editTaskPriority: boolean
  @AutoMap()
  editTaskTags: boolean
  @AutoMap()
  executeTask: boolean
  @AutoMap()
  confirmExecuteTask: boolean
  @AutoMap()
  listFolders: boolean
  @AutoMap()
  createFolders: boolean
  @AutoMap()
  editFolders: boolean
  @AutoMap()
  deleteFolders: boolean
  @AutoMap()
  createSprints: boolean
  @AutoMap()
  updateSprints: boolean
  @AutoMap()
  listSprints: boolean
  @AutoMap()
  deleteSprints: boolean
  @AutoMap()
  generateReports: boolean
  @AutoMap()
  listReports: boolean
  @AutoMap()
  deleteReports: boolean
  @AutoMap()
  createTags: boolean
  @AutoMap()
  updateTags: boolean
  @AutoMap()
  deleteTags: boolean

  project?: ProjectModel
  user?: UserModel

  static relationMappings = {
    user: {
      relation: BaseModel.HasOneRelation,
      modelClass: () => UserModel,
      join: {
        from: 'project_permissions.userId',
        to: 'user.id'
      }
    },

    project: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: () => ProjectModel,
      join: {
        from: 'project_permissions.projectId',
        to: 'project.id'
      }
    }
  }
}
