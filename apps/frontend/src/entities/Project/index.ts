//API
export { projectsQueries } from './api/project'

export type {
  IProjectDndMove,
  IProjectUpdateDto,
  IProjectUpdateByFieldsDto,
  ITag,
  ITaskStatus,
  IPermissionProject,
  ITagCreateDto,
  ITaskStatusCreateDto,
  ITaskStatusUpdateDto,
  ICreateProjectDTO,
  IUpdateProjectDTO,
  IInviteOrChangePermissionsProject,
  IAutomationProject,
  IProjectPermissionRole,
  IDeleteTaskStatusDto,
  IProjectPermissionRoleService,
  IProjectSettings,
  IProjectDto,
  ProjectRole,
  ICreateDuplicateStatusDTO
} from './model/types/project.interface'
export { ProjectStore } from './model/project.store'
export { Project } from './model/project'

// SERVICES
export { ProjectService } from './services/project.service'

export { TaskStatusCodeDefault } from './model/types/project.interface'
export { UserProjectList } from './ui/UserProjectList/UserProjectList'
export { ProjectListSkeleton } from './ui/ProjectListSkeleton/ProjectListSkeleton'
export { ProjectHeader } from './ui/ProjectHeader/ProjectHeader'

// HOOKS
export { useProjects } from './lib/hooks/useProjects'
export { usePermissionProject } from './lib/hooks/usePermissionProject'

// SCHEMAS
export { projectSettingsSchema } from './lib/projectSettingsSchema'

// PERMISSIONS
export { defaultProjectRolesPermissions } from './model/permissions/project.permissions'
