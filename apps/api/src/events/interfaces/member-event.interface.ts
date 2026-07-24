import { IUser } from './user.interface'
import { ProjectRoleType } from '../../project/components/permissions/types/roles/project-role.interface'
import { IProjectPermissions } from '../../project/components/permissions/types/project-permissions.interface'

export type MemberEventType = 'add' | 'remove' | 'updatePermissions'

export interface IMemberEvent {
  type: MemberEventType
  user: IUser
  role?: ProjectRoleType
  permissions?: IProjectPermissions
}