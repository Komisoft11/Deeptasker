import { IUser } from '@/entities/User'

export interface IFolderDTO {
  id: number

  title: string

  userId: number

  projectId: number

  parentId?: number

  dateUpdated?: string

  dateCreated: string

  customOrder: number

  taskIds: number[]

  subFolderIds: number[]

  user: IUser

  taskCount: number
}

export interface ICreateFolderDTO {
  title: string | null
  projectId: number
  parentId?: number
}

export interface IUpdateFolderDTO {
  id: number
  title?: string
  customOrder?: number
  newParentId?: number
  newProjectId?: number
}

export interface IFolderPermissionRole {
  canEditFolder: boolean
  canDeleteFolder: boolean
}
