import { Id } from 'react-toastify/dist/types'
import { Project } from '@/entities/Project/model/project'
import { TaskResponse } from '@/entities/Task'
import { IUser } from '@/entities/User'

export interface IProjectDto {
  id: number
  iconBg: string
  iconFg: string
  slug: string
  parentId: number | null
  rootId: number | null
  taskCount: number
  folderCount: number
  title: string
  uuid: string
  order?: number
  dateCreated: string
  dateUpdated: string | null
  dateArchived: string | null
  settings: IProjectSettings
  workspaceId: number
  statuses: ITaskStatus[]
  tags: ITag[]
  user: IUser
  invitees?: IInvitee[]
}

export interface IProjectSettings {
  isReviewRequired: boolean
}

export interface ITag {
  id: number
  name: string
  colorBg: string
  colorFg: string
}

export type ITagCreateDto = Pick<ITag, 'name' | 'colorBg'> & {
  projectId: number
}

export type IProjectUpdateDto = Pick<Project, 'title' | 'slug' | 'id'>

export type ITaskStatusCreateDto = Pick<ITaskStatus, 'name' | 'color'>

export type ITaskStatusUpdateDto = Pick<ITaskStatus, 'id'> &
  Partial<Pick<ITaskStatus, 'name' | 'color' | 'order'>>

export type IProjectUpdateByFieldsDto = {
  id: number
  fields: Extract<keyof Project, string | number | Date>[]
  isArchived: boolean
}

export const TaskStatusCodeDefault = {
  open: 'open',
  process: 'process',
  executed: 'executed',
  review: 'review'
}

export interface ITaskStatus {
  id: number
  name: string
  color: string
  order: number
  code: string | null
}

export interface IDeleteTaskStatusDto {
  project: Project
  status: ITaskStatus
  toastId?: Id
}

export interface IProjectDndMove {
  projectId: string | number
  order: number
}

export const ProjectRoleObj: Record<ProjectRole, ProjectRole> = {
  admin: 'admin',
  assigner: 'assigner',
  user: 'user',
  controller: 'controller',
  guest: 'guest'
}
export type ProjectRole = 'admin' | 'assigner' | 'controller' | 'user' | 'guest'

export interface IPermissionProject {
  // admin
  edit: boolean
  addUsers: boolean
  removeUsers: boolean
  manageAdmins: boolean
  delete: boolean

  // controller
  openTasks: boolean
  editTaskTracking: boolean
  deleteTasks: boolean
  deleteTaskComments: boolean
  deleteTaskFile: boolean

  // assigner
  changeTaskAssigner: boolean
  changeTaskExecutor: boolean
  moveTasks: boolean
  editTaskDescription: boolean
  editTaskTitle: boolean
  editTaskDeadline: boolean
  editTaskStatus: boolean
  executeTask: boolean
  confirmExecuteTask: boolean
  manageTaskObservers: boolean
  editTaskPriority: boolean
  editTaskTags: boolean
  editFolders: boolean
  deleteFolders: boolean
  generateReports: boolean

  // user
  listTasks: boolean
  createTasks: boolean
  createFolders: boolean
  listFolders: boolean

  listReports: boolean
  deleteReports: boolean
  listSprints: boolean
  createSprints: boolean
  updateSprints: boolean
  deleteSprints: boolean
  createTags: boolean
  updateTags: boolean
  deleteTags: boolean
}

export interface IAutomationProject {
  selfReferral?: boolean
  addTag?: boolean
  repeatTask?: boolean
  statusUpdate?: boolean
  sendToEmail?: boolean
}

export interface IProjectPermissionRole {
  projectId?: number
  role: ProjectRole
  permissions: IPermissionProject
}

export interface IProjectPermissionRoleService {}

export interface IInviteOrChangePermissionsProject {
  user: IUser
  permissions?: IProjectPermissionRole
}

export interface IProjectInviteMemberOrCancelInvite {
  project: Project
  email: string
  senderId: number
}

export interface IProjectRemoveMember {
  project: Project
  member: IUser
}

export interface IInvitee {
  email: string
  role: ProjectRole
  senderId: number
}

export type Invitees = IInvitee[]

export interface IProjectInviteMultipleMembers {
  project: Project
  invitees: Invitees
}

export interface ICreateProjectDTO
  extends Pick<Project, 'title' | 'slug' | 'settings'> {
  invitees: Invitees
  workspaceId: number
}

export interface IUpdateProjectDTO {
  project: Project
}

export interface ICreateDuplicateStatusDTO {
  project: Project
  status: ITaskStatus
}

export interface IDuplicateStatusDTO {
  id: number
  name: string
  tasksDTOs: TaskResponse[]
}

export interface IProjectInviteesDTO {
  senderId: number
  email: string
}

export interface IAcceptInvite {
  redirectUrl: string
}
