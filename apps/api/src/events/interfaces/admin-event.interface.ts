import { IUser } from './user.interface'
import { WorkspacePermissionsDto } from '../../workspace/dto/in/workspace-permissions.dto'

export type AdminEventType = 'add' | 'remove' | 'updatePermissions'

export interface IAdminEvent {
  type: AdminEventType
  admin: IUser
  permissions?: WorkspacePermissionsDto
}