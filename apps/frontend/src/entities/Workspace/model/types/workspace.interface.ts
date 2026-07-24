import { IUser } from '@/entities/User'
import { Workspace } from '@/entities/Workspace'

export interface IWorkspaceDTO {
  id: number
  uuid: string
  title: string
  projectCount: number
  dateCreated: Date
  archivedProjectCount: number
  user: IUser
  members?: IUser[]
  userRole?: IUSerRole
}

export type IUSerRole = 'admin' | 'member'

export type IWorkspaceUpdateByFieldsDto = {
  id: number
  fields: Extract<'admins' | keyof Workspace, string | number | Date>[]
}

export type IWorkspaceCreateDto = Pick<Workspace, 'title'> & {
  invitees?: IWorkspaceInviteAdminDTO[]
}

export type IWorkspaceUpdateDto = Pick<Workspace, 'title' | 'id'>
export type ICreatedWorkspaceDTO = Omit<
  IWorkspaceDTO,
  'archivedProjectCount' | 'projectCount' | 'user' | 'members'
>

export interface IPermissionWorkspace {
  edit?: boolean
  manageAdmins?: boolean
  delete?: boolean
  createProjects?: boolean
  deleteProjects?: boolean
  editProjects?: boolean
}

export interface IWorkspaceInviteAdminDTO {
  workspace: Workspace
  email: string
  senderId: number
}

export interface IWorkspaceRemoveMemberDTO {
  workspace: Workspace
  memberId: number
}

export interface AdminInviteesDTO {
  email: string
  senderId: number
}

export interface IAcceptInvite {
  redirectUrl: string
}